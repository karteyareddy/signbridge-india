import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '../components/providers/auth-provider';
import { PWAProvider } from '../components/providers/pwa-provider';

export const metadata: Metadata = {
  title: 'SIGNBRIDGE INDIA - Deaf-First Accessibility Network',
  description: 'Connect Deaf citizens with services through ISL Access Points & role-based micro-learning.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/signbridge.svg',
    apple: '/icons/signbridge.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#4338ca',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <PWAProvider>
          <AuthProvider>
            <header className="border-b border-slate-200 bg-white shadow-sm">
              <div className="mx-auto flex max-w-7xl flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <a href="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                  <span className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white uppercase tracking-wider">
                    ISL
                  </span>
                  <span>SIGNBRIDGE INDIA</span>
                </a>
                <nav className="flex w-full items-center gap-4 overflow-x-auto text-sm font-medium text-slate-600 sm:w-auto" aria-label="Primary navigation">
                  <a href="/learn" className="inline-flex min-h-11 shrink-0 items-center hover:text-indigo-600">
                    Learn
                  </a>
                  <a href="/recognize" className="inline-flex min-h-11 shrink-0 items-center hover:text-indigo-600">
                    Recognize
                  </a>
                  <a href="/access" className="inline-flex min-h-11 shrink-0 items-center hover:text-indigo-600">
                    Access Point
                  </a>
                  <a href="/dashboard" className="inline-flex min-h-11 shrink-0 items-center hover:text-indigo-600">
                    Dashboard
                  </a>
                  <a href="/escalate" className="inline-flex min-h-11 shrink-0 items-center hover:text-indigo-600">
                    Escalation
                  </a>
                  <a href="/admin" className="inline-flex min-h-11 shrink-0 items-center hover:text-indigo-600">
                    Admin
                  </a>
                  <a
                    href="/login"
                    className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 transition"
                  >
                    Sign In
                  </a>
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
