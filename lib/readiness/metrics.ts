export interface ReadinessCountMetric {
  completed: number;
  total: number;
}

export interface InstitutionReadinessSnapshot {
  score: number;
  staffTrained: ReadinessCountMetric;
  criticalPhrases: ReadinessCountMetric;
  serviceCoverage: string[];
  successfulInteractionsPercent: number;
  assistanceRequests: number;
  nextAction: {
    label: string;
    description: string;
    href: string;
    cta: string;
  };
}

export const DISTRICT_HOSPITAL_READINESS: InstitutionReadinessSnapshot = {
  score: 72,
  staffTrained: { completed: 28, total: 40 },
  criticalPhrases: { completed: 42, total: 50 },
  serviceCoverage: ['Registration', 'Pharmacy', 'Billing'],
  successfulInteractionsPercent: 91,
  assistanceRequests: 2,
  nextAction: {
    label: 'Train billing staff',
    description: 'Prioritize frontline billing staff in the next learning cycle.',
    href: '/learn',
    cta: 'Open staff training',
  },
};

export function metricPercent(metric: ReadinessCountMetric): number {
  if (metric.total <= 0) return 0;
  return Math.round(Math.min(100, Math.max(0, metric.completed / metric.total * 100)));
}
