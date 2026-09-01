---
name: nextjs-frontend
description: Triggered when building or modifying the Next.js frontend, React components, Tailwind styling, or UI flows.
---
# Next.js Frontend Development

**Stack & Conventions:**
- **Framework**: Next.js 14+ (App Router).
- **Language**: TypeScript (Strict typing required).
- **Styling**: Tailwind CSS + shadcn/ui. Avoid ad-hoc CSS unless necessary.
- **State**: React Context for global (Auth, Service Context), local state otherwise.

**Rules:**
- **Mobile-First**: Always design for portrait mobile screens first (low-end Android devices).
- **States**: EVERY feature must explicitly handle: Loading, Success, Empty, and Error states.
- **API**: Use `@supabase/supabase-js` for data access.
- **No Server Secrets on Client**: Ensure only `NEXT_PUBLIC_` env vars are used in client components.
