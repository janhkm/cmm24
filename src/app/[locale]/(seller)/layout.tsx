import { redirect } from '@/i18n/navigation';
import { getSellerLayoutData } from '@/lib/actions/dashboard';
import { SellerShell } from '@/components/seller/seller-shell';
import { SellerAuthProvider } from '@/hooks/use-seller-auth';
import { getTranslations } from 'next-intl/server';

/**
 * Seller Layout - Server Component.
 *
 * Laedt alle benoetigten Daten (Profile, Account, Plan, Inquiry-Count)
 * serverseitig in einem einzigen Request und reicht sie ueber:
 * 1. Props an die SellerShell (Sidebar/Header)
 * 2. SellerAuthProvider Context an alle Child-Pages
 *
 * Damit braucht KEINE Seller-Page mehr useAuth() aufzurufen.
 */
export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getSellerLayoutData();
  const t = await getTranslations('buyer');

  if (!layoutData) {
    redirect('/login');
  }

  const { profile, account, plan, subscription, unreadInquiries, activeListings, listingLimit } = layoutData!;

  return (
    <SellerAuthProvider value={{ profile, account, plan, subscription, unreadInquiries, activeListings, listingLimit }}>
      <SellerShell
        displayName={profile.full_name || profile.email?.split('@')[0] || t('defaultUser')}
        displayEmail={profile.email || ''}
        planName={plan?.name || 'Free'}
        planSlug={plan?.slug || 'free'}
        activeListings={activeListings}
        listingLimit={listingLimit}
        unreadInquiries={unreadInquiries}
      >
        {children}
      </SellerShell>
    </SellerAuthProvider>
  );
}
