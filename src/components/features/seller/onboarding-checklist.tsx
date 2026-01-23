'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Sparkles,
  Building2,
  FileText,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface OnboardingChecklistProps {
  onDismiss?: () => void;
}

export function OnboardingChecklist({ onDismiss }: OnboardingChecklistProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'company',
      title: 'Firmendaten vervollständigen',
      description: 'Fügen Sie Ihre Firmeninformationen hinzu',
      href: '/seller/konto?tab=company',
      icon: Building2,
      completed: false,
    },
    {
      id: 'listing',
      title: 'Erstes Inserat erstellen',
      description: 'Veröffentlichen Sie Ihre erste Maschine',
      href: '/seller/inserate/neu',
      icon: FileText,
      completed: false,
    },
    {
      id: 'inquiry',
      title: 'Anfrage beantworten',
      description: 'Reagieren Sie auf Interessenten',
      href: '/seller/anfragen',
      icon: MessageSquare,
      completed: false,
    },
    {
      id: 'statistics',
      title: 'Statistiken ansehen',
      description: 'Verstehen Sie Ihre Performance',
      href: '/seller/statistiken',
      icon: BarChart3,
      completed: false,
    },
  ]);

  // Check localStorage for completed steps on mount
  useEffect(() => {
    const savedSteps = localStorage.getItem('onboarding-steps');
    const dismissed = localStorage.getItem('onboarding-dismissed');
    
    if (dismissed === 'true') {
      setIsVisible(false);
      return;
    }

    if (savedSteps) {
      try {
        const parsed = JSON.parse(savedSteps);
        setSteps((prev) =>
          prev.map((step) => ({
            ...step,
            completed: parsed[step.id] || false,
          }))
        );
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  const allCompleted = completedCount === steps.length;

  const toggleStep = (stepId: string) => {
    setSteps((prev) => {
      const updated = prev.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );
      
      // Save to localStorage
      const completedMap = updated.reduce((acc, step) => {
        acc[step.id] = step.completed;
        return acc;
      }, {} as Record<string, boolean>);
      localStorage.setItem('onboarding-steps', JSON.stringify(completedMap));
      
      return updated;
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding-dismissed', 'true');
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Willkommen bei CMM24!</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {allCompleted
                  ? '🎉 Alle Schritte abgeschlossen!'
                  : `${completedCount} von ${steps.length} Schritten erledigt`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                step.completed
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                  : 'bg-background hover:bg-muted/50'
              )}
            >
              <button
                onClick={() => toggleStep(step.id)}
                className="shrink-0"
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'font-medium text-sm',
                    step.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {step.description}
                </p>
              </div>
              {!step.completed && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={step.href}>
                    <span className="sr-only">Starten</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>

        {allCompleted && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Super gemacht! Sie sind bereit für den Erfolg.
            </p>
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Checklist ausblenden
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
