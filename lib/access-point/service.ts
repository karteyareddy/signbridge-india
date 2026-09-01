import { createClient } from '../supabase/client';
import {
  AccessPointContext,
  ServicePackContent,
  AssistanceRequest,
  AssistanceStatus,
  UrgencyLevel,
  FeedbackSubmission,
} from '../../types/access-point';
import {
  cacheServicePack,
  canUseOfflineStorage,
  enqueueOfflineOperation,
  getCachedServicePack,
} from '../offline/database';
import { canTransitionAssistanceStatus } from '../assistance/lifecycle';

export type AccessPointDataSource = 'network' | 'cache' | 'bundled';

export interface AccessPointDataResult {
  context: AccessPointContext | null;
  pack: ServicePackContent | null;
  error: string | null;
  source: AccessPointDataSource | null;
  cachedAt?: string;
}

async function readCachedAccessPoint(qrToken: string): Promise<AccessPointDataResult | null> {
  try {
    const cached = await getCachedServicePack(qrToken);
    if (!cached) return null;
    return {
      context: { ...cached.context, is_offline_cached: true },
      pack: cached.pack,
      error: null,
      source: 'cache',
      cachedAt: cached.cachedAt,
    };
  } catch {
    return null;
  }
}

async function persistServicePack(
  qrToken: string,
  context: AccessPointContext,
  pack: ServicePackContent
): Promise<void> {
  try {
    await cacheServicePack(qrToken, context, pack);
  } catch {
    // The live pack remains usable if private browsing or storage limits block caching.
  }
}

/**
 * Built-in Service Packs & Access Points for offline resilience / demo fallback
 */
export const DEMO_ACCESS_POINTS: Record<string, { context: AccessPointContext; pack: ServicePackContent }> = {
  'hosp-reg-001': {
    context: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      institution_id: '11111111-1111-1111-1111-111111111111',
      institution_name: 'District General Hospital',
      institution_type: 'hospital',
      service_type: 'registration',
      counter_name: 'Registration Counter #1',
      district: 'Central Delhi',
      qr_token: 'hosp-reg-001',
      is_offline_cached: true,
    },
    pack: {
      id: '44444444-4444-4444-4444-444444444444',
      service_type: 'registration',
      locale: 'en',
      version: 1,
      phrases: [
        {
          id: 'p-1',
          intent: 'need_appointment',
          text: 'I need an appointment with a doctor.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'appointment',
        },
        {
          id: 'p-2',
          intent: 'show_id',
          text: 'Here is my Aadhar / Government ID card.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'documents',
        },
        {
          id: 'p-3',
          intent: 'query_department',
          text: 'Which department should I go to?',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'general',
        },
        {
          id: 'p-4',
          intent: 'opd_ticket',
          text: 'I need an OPD registration ticket.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'appointment',
        },
        {
          id: 'p-5',
          intent: 'emergency_help',
          text: 'URGENT: I need emergency medical assistance.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'emergency',
        },
      ],
      staff_responses: [
        {
          id: 'sr-1',
          intent: 'please_wait',
          text: 'Please wait, your turn will come shortly.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
        },
        {
          id: 'sr-2',
          intent: 'request_id',
          text: 'Please show your ID card or patient number.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
        },
        {
          id: 'sr-3',
          intent: 'goto_counter_3',
          text: 'Please go to Counter #3 for payment.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
        },
        {
          id: 'sr-4',
          intent: 'form_required',
          text: 'Please fill out this registration form.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
        },
      ],
    },
  },
  'col-adm-001': {
    context: {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      institution_id: '22222222-2222-2222-2222-222222222222',
      institution_name: 'State Science College',
      institution_type: 'college',
      service_type: 'admission',
      counter_name: 'Admissions Office Counter',
      district: 'North Delhi',
      qr_token: 'col-adm-001',
      is_offline_cached: true,
    },
    pack: {
      id: '55555555-5555-5555-5555-555555555555',
      service_type: 'admission',
      locale: 'en',
      version: 1,
      phrases: [
        {
          id: 'p-101',
          intent: 'admission_info',
          text: 'I need information about course admission.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'general',
        },
        {
          id: 'p-102',
          intent: 'submit_documents',
          text: 'Where do I submit my certificates and forms?',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'documents',
        },
        {
          id: 'p-103',
          intent: 'fee_structure',
          text: 'What is the fee amount and payment deadline?',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
          category: 'payment',
        },
      ],
      staff_responses: [
        {
          id: 'sr-101',
          intent: 'take_form',
          text: 'Please take this admission form.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
        },
        {
          id: 'sr-102',
          intent: 'verify_original',
          text: 'Please present your original marksheets for verification.',
          isl_asset: 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4',
        },
      ],
    },
  },
};

/**
 * Resolves an Access Point and its contextual Service Pack by QR token.
 */
export async function getAccessPointData(qrToken: string): Promise<AccessPointDataResult> {
  const browserIsOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (browserIsOffline) {
    const cached = await readCachedAccessPoint(qrToken);
    if (cached) return cached;
  }

  try {
    const supabase = createClient();

    // Attempt Supabase database query first
    const { data: ap, error: apErr } = await supabase
      .from('access_points')
      .select('id, service_type, qr_token, active, institutions (id, name, type, district)')
      .eq('qr_token', qrToken)
      .eq('active', true)
      .single();

    if (ap && !apErr && ap.institutions) {
      const inst = ap.institutions as any;
      const context: AccessPointContext = {
        id: ap.id,
        institution_id: inst.id,
        institution_name: inst.name,
        institution_type: inst.type,
        service_type: ap.service_type,
        counter_name: `${inst.name} (${ap.service_type})`,
        district: inst.district,
        qr_token: ap.qr_token,
        is_offline_cached: false,
      };

      // Fetch phrases for this service pack
      const { data: spack } = await supabase
        .from('service_packs')
        .select('id, version, phrases (*)')
        .eq('service_type', ap.service_type)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (spack) {
        const phrases = (spack.phrases || []).map((p: any) => ({
          id: p.id,
          intent: p.intent,
          text: p.text,
          isl_asset: p.isl_asset,
          category: 'general' as any,
        }));

        const demoFallback = DEMO_ACCESS_POINTS[qrToken]?.pack;
        const pack: ServicePackContent = {
          id: spack.id,
          service_type: ap.service_type,
          locale: 'en',
          version: spack.version,
          phrases,
          staff_responses: demoFallback?.staff_responses || [],
        };
        await persistServicePack(qrToken, context, pack);
        return {
          context: { ...context, is_offline_cached: canUseOfflineStorage() },
          pack,
          error: null,
          source: 'network',
        };
      }
    }
  } catch (e) {
    // Suppress network/db errors to trigger offline demo fallback below
  }

  const cached = await readCachedAccessPoint(qrToken);
  if (cached) return cached;

  // Fallback to demo service pack data
  if (DEMO_ACCESS_POINTS[qrToken]) {
    const demo = DEMO_ACCESS_POINTS[qrToken];
    await persistServicePack(qrToken, demo.context, demo.pack);
    return {
      context: demo.context,
      pack: demo.pack,
      error: null,
      source: 'bundled',
    };
  }

  return {
    context: null,
    pack: null,
    error: `Access point QR token "${qrToken}" was not recognized. Please scan a valid location QR code.`,
    source: null,
  };
}

/**
 * Creates a human assistance request for the current access point.
 */
export async function createAssistanceRequest(
  accessPointId: string,
  urgency: UrgencyLevel = 'normal'
): Promise<{ request: AssistanceRequest | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data: rpcData, error } = await supabase.rpc('create_assistance_request', {
      request_access_point_id: accessPointId,
      request_urgency: urgency,
    });
    const data = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!error && data) {
      return {
        request: { ...(data as AssistanceRequest), sync_status: 'synced' },
        error: null,
      };
    }
  } catch (e) {
    // Ignore network error for local fallback return
  }

  const queuedOperation = canUseOfflineStorage()
    ? await enqueueOfflineOperation('assistance', {
      access_point_id: accessPointId,
      urgency,
    })
    : null;

  return {
    request: {
      id: queuedOperation?.id ?? `req-${Date.now()}`,
      access_point_id: accessPointId,
      urgency,
      status: 'pending',
      created_at: new Date().toISOString(),
      sync_status: 'queued',
    },
    error: null,
  };
}

function mapAssistanceRequest(row: Record<string, any>): AssistanceRequest {
  const accessPoint = Array.isArray(row.access_points) ? row.access_points[0] : row.access_points;
  const institution = Array.isArray(accessPoint?.institutions)
    ? accessPoint.institutions[0]
    : accessPoint?.institutions;

  return {
    id: row.id,
    access_point_id: row.access_point_id,
    urgency: row.urgency,
    status: row.status,
    operator_id: row.operator_id ?? null,
    created_at: row.created_at,
    accepted_at: row.accepted_at ?? null,
    started_at: row.started_at ?? null,
    resolved_at: row.resolved_at ?? null,
    updated_at: row.updated_at,
    location: accessPoint
      ? {
          institution_name: institution?.name ?? 'Institution',
          service_type: accessPoint.service_type ?? 'Service point',
        }
      : null,
    sync_status: 'synced',
  };
}

const ASSISTANCE_REQUEST_SELECT = `
  id,
  access_point_id,
  urgency,
  status,
  operator_id,
  created_at,
  accepted_at,
  started_at,
  resolved_at,
  updated_at,
  access_points (service_type, institutions (name))
`;

export async function listAssistanceRequests(): Promise<{
  requests: AssistanceRequest[];
  error: string | null;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('assistance_requests')
      .select(ASSISTANCE_REQUEST_SELECT)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return { requests: [], error: error.message };
    return { requests: (data ?? []).map((row) => mapAssistanceRequest(row)), error: null };
  } catch {
    return { requests: [], error: 'The assistance queue is temporarily unavailable.' };
  }
}

export async function getAssistanceRequest(currentRequest: AssistanceRequest): Promise<{
  request: AssistanceRequest | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    if (currentRequest.tracking_token) {
      const { data, error } = await supabase.rpc('get_assistance_request_status', {
        request_id: currentRequest.id,
        request_tracking_token: currentRequest.tracking_token,
      });
      const status = Array.isArray(data) ? data[0] : data;
      if (error || !status) {
        return { request: null, error: error?.message ?? 'Request not found.' };
      }
      return {
        request: {
          ...currentRequest,
          status: status.status,
          accepted_at: status.accepted_at,
          started_at: status.started_at,
          resolved_at: status.resolved_at,
          updated_at: status.updated_at,
        },
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('assistance_requests')
      .select(ASSISTANCE_REQUEST_SELECT)
      .eq('id', currentRequest.id)
      .single();

    if (error || !data) return { request: null, error: error?.message ?? 'Request not found.' };
    return { request: mapAssistanceRequest(data), error: null };
  } catch {
    return { request: null, error: 'Request status is temporarily unavailable.' };
  }
}

export async function transitionAssistanceRequest(
  request: AssistanceRequest,
  nextStatus: AssistanceStatus,
): Promise<{ request: AssistanceRequest | null; error: string | null }> {
  if (!canTransitionAssistanceStatus(request.status, nextStatus)) {
    return { request: null, error: `Cannot move a ${request.status} request to ${nextStatus}.` };
  }

  try {
    const supabase = createClient();
    const updates: Record<string, string> = { status: nextStatus };

    if (nextStatus === 'accepted') {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        return { request: null, error: 'An authenticated operator is required.' };
      }
      updates.operator_id = authData.user.id;
    }

    const { data, error } = await supabase
      .from('assistance_requests')
      .update(updates)
      .eq('id', request.id)
      .eq('status', request.status)
      .select(ASSISTANCE_REQUEST_SELECT)
      .single();

    if (error || !data) {
      return {
        request: null,
        error: error?.message ?? 'The request changed elsewhere. Refresh the queue and try again.',
      };
    }
    return { request: mapAssistanceRequest(data), error: null };
  } catch {
    return { request: null, error: 'The request could not be updated. Check the connection and try again.' };
  }
}

export function subscribeToAssistanceChanges(onChange: () => void): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`assistance-queue-${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'assistance_requests' },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Submits user rating / feedback for an interaction.
 */
export async function submitInteractionFeedback(
  submission: FeedbackSubmission
): Promise<{ success: boolean; queued: boolean; error: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('feedback').insert({
      access_point_id: submission.access_point_id,
      phrase_id: submission.phrase_id,
      outcome: submission.outcome,
      rating: submission.rating,
      comment: submission.comment,
    });

    if (!error) return { success: true, queued: false, error: null };
  } catch (e) {
    // Local demo fallback return
  }

  if (canUseOfflineStorage()) {
    await enqueueOfflineOperation('feedback', submission);
  }

  return { success: true, queued: true, error: null };
}
