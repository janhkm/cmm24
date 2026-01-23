'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickyMobileCTAProps {
  /** Phone number to call */
  phone?: string;
  /** Primary action label */
  primaryLabel?: string;
  /** Primary action handler */
  onPrimaryClick?: () => void;
  /** Show phone button */
  showPhone?: boolean;
  /** Show scroll to top */
  showScrollTop?: boolean;
}

export function StickyMobileCTA({
  phone = '+49 123 456789',
  primaryLabel = 'Anfrage senden',
  onPrimaryClick,
  showPhone = true,
  showScrollTop = true,
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 300px
      setIsVisible(window.scrollY > 300);
      // Show scroll to top after 500px
      setShowScrollButton(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'bg-background/95 backdrop-blur-sm border-t shadow-lg',
        'transform transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex items-center gap-2 p-3 safe-area-bottom">
        {/* Phone Button */}
        {showPhone && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            asChild
          >
            <a href={`tel:${phone.replace(/\s/g, '')}`} aria-label="Anrufen">
              <Phone className="h-5 w-5" />
            </a>
          </Button>
        )}

        {/* Primary CTA */}
        <Button
          className="flex-1"
          onClick={onPrimaryClick}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {primaryLabel}
        </Button>

        {/* Scroll to Top */}
        {showScrollTop && showScrollButton && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={scrollToTop}
            aria-label="Nach oben scrollen"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
