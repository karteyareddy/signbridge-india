import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getRouteAccessStatus } from '../auth/roles';
import { UserRole } from '../../types/auth';
import { DEMO_AUTH_COOKIE, DEMO_AUTH_ENABLED } from '../auth/demo';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  let user: { id: string } | null = null;
  let role: UserRole | null = null;
  const demoRole = request.cookies.get(DEMO_AUTH_COOKIE)?.value as UserRole | undefined;
  const validDemoRole = demoRole && ['staff', 'interpreter', 'admin'].includes(demoRole);

  if (DEMO_AUTH_ENABLED && validDemoRole) {
    role = demoRole;
  } else {
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  }

  if (user && !role) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    role = (profile?.role as UserRole) || 'citizen';
  }

  const { pathname } = request.nextUrl;
  const access = getRouteAccessStatus(pathname, role);

  if (!access.allowed) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = access.redirectTo || '/login';
    if (!user && !validDemoRole) {
      redirectUrl.searchParams.set('redirectTo', pathname);
    } else if (access.requiredRole) {
      redirectUrl.searchParams.set('error', 'unauthorized_role');
      redirectUrl.searchParams.set('required', access.requiredRole);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
