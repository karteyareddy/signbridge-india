export type ServiceCategory = 'hospital' | 'college' | 'bank' | 'civic' | 'transport';

export interface AccessPointContext {
  id: string;
  institution_id: string;
  institution_name: string;
  institution_type: ServiceCategory;
  service_type: string;
  counter_name: string;
  district: string;
  qr_token: string;
  is_offline_cached?: boolean;
}

export type PhraseCategory = 'general' | 'appointment' | 'documents' | 'payment' | 'emergency';

export interface PhraseItem {
  id: string;
  intent: string;
  text: string;
  isl_asset: string; // URL to video / animation asset
  category: PhraseCategory;
}

export interface StaffResponseItem {
  id: string;
  intent: string;
  text: string;
  isl_asset: string;
  category?: string;
}

export interface ServicePackContent {
  id: string;
  service_type: string;
  locale: string;
  version: number;
  phrases: PhraseItem[];
  staff_responses: StaffResponseItem[];
}

export type UrgencyLevel = 'normal' | 'high' | 'emergency';
export type AssistanceStatus = 'pending' | 'accepted' | 'in_progress' | 'resolved';

export interface AssistanceRequest {
  id: string;
  access_point_id: string;
  urgency: UrgencyLevel;
  status: AssistanceStatus;
  operator_id?: string | null;
  tracking_token?: string;
  created_at: string;
  accepted_at?: string | null;
  started_at?: string | null;
  resolved_at?: string | null;
  updated_at?: string;
  location?: {
    institution_name: string;
    service_type: string;
  } | null;
  sync_status?: 'synced' | 'queued';
}

export interface FeedbackSubmission {
  access_point_id: string;
  phrase_id?: string;
  outcome: 'success' | 'failure';
  rating: number; // 1 to 5
  comment?: string;
}
