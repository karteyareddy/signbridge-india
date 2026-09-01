export const RECOGNITION_FALLBACK_ACTIONS = [
  {
    label: 'Appointment',
    description: 'Open the validated appointment phrase.',
    href: '/access/hosp-reg-001?intent=need_appointment',
  },
  {
    label: 'Registration',
    description: 'Open the validated registration phrase.',
    href: '/access/hosp-reg-001?intent=opd_ticket',
  },
  {
    label: 'Need help',
    description: 'Request qualified human assistance.',
    href: '/access/hosp-reg-001?help=1',
  },
] as const;
