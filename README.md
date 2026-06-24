# Qubool

A verified, privacy-first matrimonial platform (Pakistan/Rishta + International modes). Built with Next.js, Supabase, and the Anthropic API. Full spec in `docs/qubool-requirements.md`; reference design in `docs/qubool-design.html`.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # already done if you're reading this in the repo
npm run dev
```

The landing page (`/`) works with no configuration. Everything else (auth, Discover, matches, chat, admin) needs the environment variables below.

## Required environment variables

Fill these into `.env.local` (never commit real values):

- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Create a project at supabase.com, then run `db/migrations/0001_init.sql` in the SQL Editor, and create two **private** storage buckets: `profile-photos` and `selfie-verifications`.
- **Anthropic** — `ANTHROPIC_API_KEY` for AI moderation and match explanations. Without it, moderation fails open (logs as clean) and match reasons fall back to a generic line.
- **Resend** — `RESEND_API_KEY`, `RESEND_FROM_EMAIL` for transactional email. Without it, emails are silently skipped (in-app notifications still work).
- **Payments** — `JAZZCASH_*`, `EASYPAISA_*`, `PAYONEER_*` for the real provider dashboards. Without them, payment creation still works but signs with `"unsigned"` and webhook verification will fail (by design — never extend access without a verified signature).
- **Cron** — `CRON_SECRET` to protect `/api/cron/*` routes; set the same value as the `Authorization: Bearer <secret>` header Vercel Cron sends.

See `.env.local.example` for the full list and defaults (trial length, subscription price).

## Build order this was built in

Phase 1 (MVP) → Phase 2 (verification, wali, payments) → Phase 3 (admin, polish) — all implemented in one pass per `docs/qubool-requirements.md`. `npm run build` and `npx tsc --noEmit` both pass.
