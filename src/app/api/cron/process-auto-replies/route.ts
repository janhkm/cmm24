import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { log } from '@/lib/logger';

// This route processes the auto-reply queue
// It should be called by a cron job every 5 minutes
// 
// For Vercel Cron, add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/process-auto-replies",
//     "schedule": "*/5 * * * *"
//   }]
// }

interface PendingReply {
  queue_id: string;
  account_id: string;
  inquiry_id: string;
  recipient_email: string;
  recipient_name: string;
  listing_id: string | null;
  listing_title: string | null;
  subject: string;
  message: string;
  include_listing_details: boolean;
  include_signature: boolean;
  signature: string | null;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  try {
    // Verify authorization
    // Vercel Cron sends Authorization header with CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Also check for Vercel's cron verification header
    const vercelCron = request.headers.get('x-vercel-cron');
    
    if (!vercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      log('info', 'AutoReply Cron', 'Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      log('error', 'AutoReply Cron', 'Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      log('warn', 'AutoReply Cron', 'RESEND_API_KEY not configured');
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        result: { processed: 0, sent: 0, failed: 0 }
      });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Get pending auto-replies
    const { data: pendingReplies, error: fetchError } = await supabase
      .rpc('get_pending_auto_replies', { p_limit: 10 });

    if (fetchError) {
      log('error', 'AutoReply Cron', 'Fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (!pendingReplies || pendingReplies.length === 0) {
      log('info', 'AutoReply Cron', 'No pending replies');
      return NextResponse.json({
        success: true,
        message: 'No pending replies',
        result: { processed: 0, sent: 0, failed: 0 }
      });
    }

    log('info', 'AutoReply Cron', `Processing ${pendingReplies.length} replies`);

    const result = {
      processed: pendingReplies.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each reply
    for (const reply of pendingReplies as PendingReply[]) {
      try {
        // Build email content
        const emailHtml = buildEmailHtml(reply);

        // Send email via Resend
        const emailResult = await sendEmail({
          to: reply.recipient_email,
          subject: reply.subject,
          html: emailHtml,
          resendApiKey,
        });

        if (emailResult.success) {
          // Mark as sent
          await supabase.rpc('mark_auto_reply_sent', {
            p_queue_id: reply.queue_id,
            p_success: true,
          });
          result.sent++;
          log('info', 'AutoReply Cron', `Sent to ${reply.recipient_email}`);
        } else {
          // Mark as failed
          await supabase.rpc('mark_auto_reply_sent', {
            p_queue_id: reply.queue_id,
            p_success: false,
            p_error_message: emailResult.error || 'Unknown error',
          });
          result.failed++;
          result.errors.push(`${reply.recipient_email}: ${emailResult.error}`);
          log('error', 'AutoReply Cron', `Failed for ${reply.recipient_email}`, emailResult.error);
        }
      } catch (error) {
        // Mark as failed
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await supabase.rpc('mark_auto_reply_sent', {
          p_queue_id: reply.queue_id,
          p_success: false,
          p_error_message: errorMessage,
        });
        result.failed++;
        result.errors.push(`${reply.recipient_email}: ${errorMessage}`);
        log('error', 'AutoReply Cron', `Error for ${reply.recipient_email}`, error);
      }
    }

    log('info', 'AutoReply Cron', `Completed: ${result.sent} sent, ${result.failed} failed`);

    return NextResponse.json({ success: true, result });

  } catch (error) {
    log('error', 'AutoReply Cron', 'Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// Helper: Build Email HTML
// =============================================================================

function buildEmailHtml(reply: PendingReply): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.de';
  
  // Build message with line breaks preserved
  const messageHtml = reply.message
    .split('\n')
    .map(line => `<p style="margin: 4px 0; font-size: 14px; line-height: 24px; color: #333;">${escapeHtml(line) || '&nbsp;'}</p>`)
    .join('');
  
  // Build listing section if needed
  let listingHtml = '';
  if (reply.include_listing_details && reply.listing_title) {
    const listingUrl = reply.listing_id ? `${baseUrl}/maschinen/${reply.listing_id}` : '';
    listingHtml = `
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="font-size: 12px; color: #666; margin: 0 0 8px;">Ihre Anfrage bezüglich:</p>
        <p style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px;">${escapeHtml(reply.listing_title)}</p>
        ${listingUrl ? `<a href="${listingUrl}" style="font-size: 14px; color: #2563eb; text-decoration: none;">Inserat ansehen →</a>` : ''}
      </div>
    `;
  }
  
  // Build signature if needed
  let signatureHtml = '';
  if (reply.include_signature && reply.signature) {
    signatureHtml = `
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        ${reply.signature.split('\n').map(line => 
          `<p style="margin: 2px 0; font-size: 14px; color: #666;">${escapeHtml(line) || '&nbsp;'}</p>`
        ).join('')}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #e6ebf1; text-align: center;">
              <a href="${baseUrl}" style="text-decoration: none;">
                <img src="${baseUrl}/logo.png" width="120" height="40" alt="CMM24" style="display: block; margin: 0 auto;">
              </a>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0 0 24px;">
                Vielen Dank für Ihre Anfrage
              </h1>
              
              <p style="font-size: 14px; line-height: 24px; color: #333; margin: 0 0 16px;">
                Hallo ${escapeHtml(reply.recipient_name)},
              </p>
              
              ${messageHtml}
              
              ${listingHtml}
              
              ${signatureHtml}
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="font-size: 12px; color: #666; margin: 0;">
                Diese Nachricht wurde automatisch versendet.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; text-align: center;">
              <p style="font-size: 12px; color: #8898aa; margin: 0 0 8px;">
                CMM24 - Der Marktplatz für gebrauchte Koordinatenmessmaschinen
              </p>
              <p style="font-size: 12px; color: #8898aa; margin: 0;">
                <a href="${baseUrl}" style="color: #556cd6; text-decoration: none;">Website</a>
                &nbsp;•&nbsp;
                <a href="${baseUrl}/kontakt" style="color: #556cd6; text-decoration: none;">Kontakt</a>
                &nbsp;•&nbsp;
                <a href="${baseUrl}/datenschutz" style="color: #556cd6; text-decoration: none;">Datenschutz</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// Helper: Send Email via Resend
// =============================================================================

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  resendApiKey: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, resendApiKey } = params;
  
  const fromEmail = process.env.EMAIL_FROM || 'CMM24 <noreply@cmm24.de>';
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || `HTTP ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}
