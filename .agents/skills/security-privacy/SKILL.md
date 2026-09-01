---
name: security-privacy
description: Triggered when working on data protection, privacy measures, sensitive information, or environment variables.
---
# Security & Privacy

**Privacy Rules:**
- **Zero Raw Video**: Never store or transmit raw camera frames. Use local landmark extraction to preserve user privacy.
- **Identity Protection**: Do not expose individual Deaf users' identities or interactions on public institutional dashboards. Aggregated, anonymized data only.
- **Consent**: Explicit consent is required before using any session data for model improvement.

**Security Rules:**
- **Secrets Management**: Never expose service-role keys or backend secrets to the Next.js client. Only `NEXT_PUBLIC_` variables are safe.
- **Data Access**: Enforce Row Level Security (RLS) strictly. Ensure users can only read/write their own transactional data.
