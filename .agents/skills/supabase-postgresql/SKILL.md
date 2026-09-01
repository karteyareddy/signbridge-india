---
name: supabase-postgresql
description: Triggered when modifying the database schema, RLS policies, Authentication, or Realtime WebSockets.
---
# Supabase & Database Strategy

**Core Rules:**
- **Source of Truth**: Refer to `DATABASE.md` for exact schema requirements.
- **Security via RLS**: Never bypass RLS. Ensure anonymous caching reads are allowed for public tables, but restrict writes.
- **No Raw SQL from Client**: Use the typed Supabase JS client.
- **Versioning**: Service packs and phrases rely on explicit version integers to trigger offline PWA syncs. Do not mutate existing critical rows.
- **Realtime**: Use Supabase Realtime for the `assistance_requests` escalation queue.

**Authentication:**
- Basic Access Point features must remain accessible to unauthenticated/anonymous users.
- Use Supabase Auth for Staff and Admins.
