import { AssistanceStatus } from '../../types/access-point';

export const ASSISTANCE_STATUSES: AssistanceStatus[] = [
  'pending',
  'accepted',
  'in_progress',
  'resolved',
];

export const ASSISTANCE_STATUS_LABELS: Record<AssistanceStatus, string> = {
  pending: 'Request sent',
  accepted: 'Accepted',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

const NEXT_STATUS: Partial<Record<AssistanceStatus, AssistanceStatus>> = {
  pending: 'accepted',
  accepted: 'in_progress',
  in_progress: 'resolved',
};

export function nextAssistanceStatus(status: AssistanceStatus): AssistanceStatus | null {
  return NEXT_STATUS[status] ?? null;
}

export function canTransitionAssistanceStatus(
  current: AssistanceStatus,
  next: AssistanceStatus,
): boolean {
  return NEXT_STATUS[current] === next;
}

export function assistanceActionLabel(status: AssistanceStatus): string | null {
  switch (status) {
    case 'pending':
      return 'Accept request';
    case 'accepted':
      return 'Start assistance';
    case 'in_progress':
      return 'Resolve request';
    default:
      return null;
  }
}
