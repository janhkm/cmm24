'use client';

import { useSellerAuth } from '@/hooks/use-seller-auth';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

/**
 * Feature flags as defined in the plans.feature_flags JSONB column
 */
export type FeatureFlag = 
  | 'statistics'
  | 'email_composer'
  | 'lead_pipeline'
  | 'auto_reply'
  | 'team_management'
  | 'api_access';

interface FeatureGateProps {
  /** The feature to check access for */
  feature: FeatureFlag;
  /** Content to render if user has access */
  children: React.ReactNode;
  /** Optional custom fallback (defaults to UpgradePrompt) */
  fallback?: React.ReactNode;
  /** If true, shows children as disabled/greyed out instead of fallback */
  showDisabled?: boolean;
}

/**
 * Gate component for plan-based feature access control.
 * Nutzt useSellerAuth() statt useAuth() - keine DB-Calls, sofort verfuegbar.
 * 
 * HINWEIS: Aktuell ist alles Free - alle Features sind freigeschaltet.
 * Die alte Logik bleibt auskommentiert fuer spaetere Pay-Versionen.
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showDisabled = false,
}: FeatureGateProps) {
  // ALLES IST JETZT FREE - immer Kinder rendern
  return <>{children}</>;
  
  // AUSKOMMENTIERT: Alte Plan-basierte Zugriffskontrolle
  // const { plan } = useSellerAuth();
  // const featureFlags = plan?.feature_flags as Record<string, boolean> | null;
  // const hasAccess = featureFlags?.[feature] ?? false;
  // 
  // if (hasAccess) {
  //   return <>{children}</>;
  // }
  // 
  // if (showDisabled) {
  //   return (
  //     <div className="relative">
  //       <div className="pointer-events-none opacity-50 select-none">
  //         {children}
  //       </div>
  //       <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
  //         <UpgradePrompt feature={feature} compact />
  //       </div>
  //     </div>
  //   );
  // }
  // 
  // return fallback ? <>{fallback}</> : <UpgradePrompt feature={feature} />;
}

interface UpgradePromptProps {
  feature: FeatureFlag;
  compact?: boolean;
}

/**
 * Feature flag to translation key mapping
 */
const featureKeyMap: Record<FeatureFlag, string> = {
  statistics: 'statistics',
  email_composer: 'emailComposer',
  lead_pipeline: 'leadPipeline',
  auto_reply: 'autoReply',
  team_management: 'teamManagement',
  api_access: 'apiAccess',
};

/**
 * Minimum plan required for each feature
 */
const featureMinPlan: Record<FeatureFlag, 'starter' | 'business'> = {
  statistics: 'starter',
  email_composer: 'starter',
  lead_pipeline: 'business',
  auto_reply: 'business',
  team_management: 'business',
  api_access: 'business',
};

/**
 * Default upgrade prompt component
 */
export function UpgradePrompt({ feature, compact = false }: UpgradePromptProps) {
  const t = useTranslations('featureGate');
  const featureKey = featureKeyMap[feature];
  const featureName = t(featureKey);
  const minPlan = featureMinPlan[feature];
  const planName = minPlan === 'starter' ? 'Starter' : 'Business';
  
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {t('fromPlan', { plan: planName })}
        </p>
        <Button size="sm" asChild>
          <Link href="/seller/abo/upgrade">
            {t('upgrade')}
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border rounded-lg bg-muted/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {t('unlockFeature', { feature: featureName })}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {t('availableFromDesc', { plan: planName, featureLower: featureName.toLowerCase() })}
      </p>
      <Button asChild>
        <Link href="/seller/abo/upgrade">
          <Sparkles className="mr-2 h-4 w-4" />
          {t('upgradeToPlan', { plan: planName })}
        </Link>
      </Button>
    </div>
  );
}

/**
 * Hook to check if a feature is available.
 * HINWEIS: Aktuell ist alles Free - gibt immer true zurueck.
 */
export function useFeatureAccess(feature: FeatureFlag): boolean {
  // ALLES IST JETZT FREE
  return true;
  
  // AUSKOMMENTIERT: Alte Plan-basierte Logik
  // const { plan } = useSellerAuth();
  // const featureFlags = plan?.feature_flags as Record<string, boolean> | null;
  // return featureFlags?.[feature] ?? false;
}

/**
 * Hook to check multiple features at once
 * HINWEIS: Aktuell ist alles Free - gibt immer true zurueck.
 */
export function useFeatureFlags(): {
  hasFeature: (feature: FeatureFlag) => boolean;
  isLoading: boolean;
} {
  // ALLES IST JETZT FREE
  const hasFeature = (_feature: FeatureFlag): boolean => true;
  return { hasFeature, isLoading: false };
  
  // AUSKOMMENTIERT: Alte Plan-basierte Logik
  // const { plan } = useSellerAuth();
  // const hasFeature = (feature: FeatureFlag): boolean => {
  //   const featureFlags = plan?.feature_flags as Record<string, boolean> | null;
  //   return featureFlags?.[feature] ?? false;
  // };
  // return { hasFeature, isLoading: false };
}
