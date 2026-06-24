# Qubool — Full Build Requirements Document

**For:** Claude Code (hand this whole file over to build the product, top to bottom)
**Product:** Qubool — a verified, privacy-first **matrimonial / rishta** platform with values-based matching, safe chat, wali oversight, AI moderation, and monthly subscriptions.
**Reference design:** Build the UI to match `qubool-design.html` exactly — same colors, fonts, the union motif, the photo-blur profile card, calm animations, and the scroll-highlight statement.

> **Positioning is critical (read first).** In Pakistan, "dating" apps have been blocked by the regulator (PTA) for "immoral content," and local law restricts extra-marital relationships. Qubool must be built and positioned as a **marriage-focused matrimonial platform** for the Pakistan/Muslim audience — not a casual dating app. A separate, more open "International" mode is allowed for members abroad, but the Pakistan experience stays marriage-first, modest, and heavily moderated. This positioning keeps the product legal and culturally accepted.

---

## 1. What we are building (one paragraph)

A web app where adults seeking marriage create a verified, privacy-first profile (photo optional and never public by default), state their values and what they want in a partner via guided options, and receive match suggestions from a matching model. Photos stay blurred until a mutual match or an approved "request to view." Women control who may start a conversation. Users may add a wali (guardian) to oversee chats. All user content is moderated by AI. There is a **3-day free trial** with full access, then a **$5/month** subscription.

---

## 2. Audience & modes

- **Pakistan · Rishta mode (primary):** marriage-minded only, modesty-first, wali mode, full privacy controls, strict moderation.
- **International mode:** a more open experience for members abroad, with the **same** verification, reporting, and moderation.
- Mode is set by the user's location/choice at signup. Keep the two experiences separated in copy and matching, but on one codebase. A Pakistan-mode user is matched only within compatible pools.

---

## 3. Tech stack (recommended)

- **Framework:** Next.js (App Router) + TypeScript + React
- **Styling:** Tailwind CSS, reproducing the exact design tokens in Section 5 (no default Tailwind palette)
- **Database:** PostgreSQL via **Supabase**
- **Auth:** Supabase Auth — email+password and Google; **phone (OTP) verification mandatory**
- **File storage:** Supabase Storage, **private buckets** for photos (Section 6.2)
- **AI moderation & matching assist:** Anthropic Claude API (server-side only)
- **Realtime chat:** Supabase Realtime (or WebSocket)
- **Hosting:** Vercel; scheduled jobs via Vercel Cron (trial/subscription expiry, daily suggestions, reminders)
- **Email:** a transactional email provider (e.g. Resend) for notifications
- **Payments:** Easypaisa + JazzCash (Pakistan), Payoneer (international) — Section 9

All secrets live in environment variables only — never client-side, never in git.

---

## 4. Pages / screens

1. **Landing page** — exactly as `qubool-design.html`.
2. **Sign up / Log in** — email+password / Google, then mandatory phone OTP.
3. **Verification** — selfie verification → "Verified" badge.
4. **Onboarding form** — basic info, values, partner preferences (Section 6.1).
5. **Discover / Suggestions** — daily curated match suggestions with reasons.
6. **Profile view** — another member's profile with blurred photo + request-to-view.
7. **Interests** — who you've shown interest in / who's interested in you.
8. **Matches & Chat** — post-match conversations (women-initiated), optional wali view.
9. **My profile** — edit info, manage photo privacy, manage wali.
10. **Safety center** — block list, reports, privacy settings.
11. **Membership** — trial status, subscribe, manage/cancel.
12. **Settings** — account, mode, notifications, delete account & data.
13. **Admin panel** — moderation, users, reports, verification, payments (Section 10).

---

## 5. Design system (must match the design file)

**Colors (CSS variables):**
- `--ivory:#FBF6EE` (background) · `--paper:#FFFFFF` · `--sand:#F3EADA` (surfaces)
- `--henna:#7C2B3D` (primary) · `--henna-deep:#5E1F2E`
- `--gold:#B8893C` · `--gold-soft:#E4C98A` (accents)
- `--ink:#2B211E` (text) · `--muted:#8C7B6E` (secondary text)
- `--green:#3E7C5A` (verified / safe) · `--line:rgba(124,43,61,.16)` (hairlines)

**Typography (Google Fonts):**
- Display / headings: **Fraunces** (large, weight 500, occasional italic for emphasis)
- Body / UI: **Mulish**

**Signature elements to carry through the app:**
- Two interlocking rings inside a geometric star (the "union" motif) — logo, loaders, empty states.
- Calm motion only: fade-up on scroll, scroll-word-highlight on key statements, soft hover lifts. Respect `prefers-reduced-motion`.
- The blurred-photo profile card with "request to view" is a core, recognizable UI pattern.
- **Quality floor:** mobile-responsive, visible keyboard focus, reduced-motion respected.
- **Tone:** warm, respectful, plain-spoken. Never the cheesy red-heart dating look.

**Imagery note:** do not use scraped photos of real people. Use illustrated/geometric placeholders (as in the design) or properly licensed / AI-generated images the founder supplies. Real member photos are user-uploaded and private (Section 6.2).

---

## 6. Detailed feature requirements

### 6.1 Onboarding form (guided options, basic info only)
Keep required info minimal so privacy-conscious users aren't forced to over-share.
- **Basic:** display name, age/DOB, gender, city/country, languages.
- **Values & lifestyle (select from options):** religion; for Muslims, sect/maslak and practice level; marital status; wants children; willingness to relocate; education; profession; smoking; (subcontinent-relevant, optional) family/community preferences.
- **What you're looking for:** the same fields as preferences, each marked **hard dealbreaker** or **soft preference**, plus free-text "about me" and "what I'm looking for."
- **Photo:** optional; default privacy = blurred-until-match (Section 6.2).
- Mode (Pakistan/International) confirmed here.
- Onboarding must be completed before Discover is accessible.

### 6.2 Photo privacy
- Photos stored in **private** storage; no public URLs, never indexed; served via short-lived signed URLs only to permitted viewers.
- Default display: **blurred** to non-matched viewers.
- Two owner-chosen modes: (a) auto-reveal on mutual match, or (b) **request to view** — viewer requests, owner approves per person.
- Owner can revoke access anytime; revoking invalidates signed URLs.

### 6.3 Matching model
- **Hard filters (dealbreakers):** must all pass or the profile is not shown — religion, sect, age range, location/mode, marital intent, language, and any other field the user marks as a dealbreaker.
- **Soft preferences (weighted score 0–100):** education, profession, lifestyle (practice level, smoking), family plans, interests, and free-text compatibility.
- **AI assist:** Claude reads the free-text fields to refine compatibility and produce a short, honest "why you matched" line; also flags contradictions / red flags for review.
- **Two-way:** only suggest/connect when both sides' dealbreakers are satisfied.
- **Daily curated suggestions** (quality over endless swiping), each with its match reason. Generated by a daily cron per user and stored.

### 6.4 Interest & connection flow
- A user expresses interest in a suggestion (or passes).
- **Mutual** interest creates a match → chat unlocks.
- **Women's control:** in any match involving a woman, only she can send the first message (or pre-approve who may message her). Enforce this **server-side**, not just in the UI.

### 6.5 Chat
- Available **only after a mutual match**.
- Realtime text. Block & report available in every chat.
- **Screenshot deterrence:** best-effort on web (overlay + watermark with the viewer's id); note true prevention is limited on web.
- **AI moderation on every message** (Section 7): detect harassment, sexual content, scams, off-platform phishing; warn/withhold and flag for admin review.

### 6.6 Wali / Guardian mode
- A user may invite a trusted family member (wali) by email/phone.
- The wali gets **read access** to that user's match chats (configurable: full visibility or summary).
- The other party is clearly told a wali may be present (honesty + trust).
- User can add/remove a wali anytime.

### 6.7 Verification (mandatory)
- **Phone OTP** at signup.
- **Selfie verification** → "Verified" badge (start as manual admin review; can automate with a KYC vendor later).
- Unverified accounts cannot message or appear in suggestions.

### 6.8 Safety center
- Block list, report history, and privacy settings in one place.
- Reports route to the **admin moderation queue** (Section 10).
- All profiles are **noindex** — never appear in search engines.

---

## 7. AI moderation & matching (Anthropic Claude API)

- The founder has a **paid Anthropic API key** → environment variable, **server-side only**.
- **Moderation:** every chat message and free-text profile field is screened (cheap first pass, escalate borderline cases) for sexual/explicit content, harassment/abuse, scams, and off-platform fraud attempts. Action: block or hold + flag to admin. This also protects against the "immoral content" regulatory trigger.
- **Matching assist:** Claude reads free-text to improve compatibility scoring and generate the "why you matched" explanation.
- **Cost control:** cache profile-text analysis; cap calls; only escalate borderline cases to a larger model.

---

## 8. Free trial & subscription

- **3-day free trial with full access** (match suggestions + chatting, no limits).
- After trial: **$5/month** — make the charged amount configurable; show PKR equivalent for Pakistani users.
- On trial start, set `trial_ends_at = now + 3 days`. Access is full while `trial_ends_at` OR `premium_until` is in the future.
- Reminders before expiry (in-app + email).
- When both dates are past: downgrade gracefully (can log in; suggestions/chat limited) and prompt to subscribe.

---

## 9. Payments

Use one internal, provider-agnostic interface: `createPayment → confirmPayment(webhook/callback, verified server-side) → extend premium_until by 30 days`. All providers plug into it.

- **Pakistan:** Easypaisa + JazzCash. These are weak at automatic recurring billing, so implement subscriptions as **manual monthly renewal** (pay → 30 days access → reminder → pay again). Funds settle to the founder's National Bank of Pakistan account.
- **International:** Payoneer (international card payments; also manual renewal given limited recurring support).
- Verify every payment **server-side** with the provider secret (env vars) before extending access.
- Store payment records (user, provider, amount, currency, txn id, status, date).
- Keep the layer provider-agnostic so a Merchant of Record (Paddle / Lemon Squeezy) or Stripe-via-foreign-company can be added later for smoother global recurring billing.
- **Security:** real merchant/Payoneer credentials and bank settlement details go into deployment env vars / each provider's dashboard — never in code, this doc, or chat.

---

## 10. Admin panel

A protected admin area (admin role only) with:
- **Moderation queue:** flagged messages/profiles from AI moderation and user reports; approve / remove / warn / ban actions.
- **Verification review:** approve or reject selfie verifications; grant/revoke "Verified" badge.
- **User management:** search users, view status, suspend/ban, handle account-deletion requests.
- **Reports & blocks:** review reports, see history, take action, message the reporter if needed.
- **Payments view:** list of payments and active subscriptions/trials (read-only records).
- **Basic metrics:** signups, verified users, active subscribers, reports open/closed.

---

## 11. Notifications (email + in-app)

Trigger notifications for:
- New match (mutual interest)
- New message (for women: a new approved-to-message request; for both: new chat message)
- Someone showed interest in you
- Photo "request to view" received / approved
- Trial ending soon (e.g. 1 day left) and trial ended
- Subscription renewal reminder and payment confirmed/failed
- Wali invite received / accepted
- Moderation outcome (warning/removal) where appropriate

Users can manage notification preferences in Settings. Keep email transactional and respectful in tone.

---

## 12. Database schema (starting point)

- **users:** id, email, auth_provider, gender, mode (pk/intl), phone_verified, selfie_verified, role (user/admin), status (active/suspended/banned), created_at, `trial_ends_at`, `premium_until`.
- **profiles:** user_id, display_name, dob, city, country, languages, religion, sect, practice_level, marital_status, wants_children, relocate, education, profession, smoking, about_text, looking_for_text.
- **preferences:** user_id, field, value, is_dealbreaker (bool), weight.
- **photos:** user_id, storage_path (private), privacy_mode (match/request), created_at.
- **photo_access:** owner_id, viewer_id, status (requested/approved/revoked).
- **interests:** from_user, to_user, status (interested/passed), created_at.
- **matches:** id, user_a, user_b, created_at (on mutual interest).
- **messages:** id, match_id, sender_id, content, moderation_status, created_at.
- **walis:** user_id, wali_contact, access_level (full/summary), status.
- **reports:** reporter_id, target_id, reason, status, created_at.
- **blocks:** blocker_id, blocked_id, created_at.
- **suggestions:** user_id, suggested_user_id, score, reason, date.
- **payments:** id, user_id, provider, amount, currency, txn_id, status, created_at.
- **notifications:** id, user_id, type, payload, read (bool), created_at.

Enforce row-level security: users can only read their own data, their matches, and permitted photos.

---

## 13. Environment variables (server-side only)

- `ANTHROPIC_API_KEY` — AI moderation & matching
- `ANTHROPIC_MODEL_MODERATION`, `ANTHROPIC_MODEL_MATCHING` — model strings (configurable)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (or chosen email provider)
- `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT`
- `EASYPAISA_MERCHANT_ID`, `EASYPAISA_SECRET`
- `PAYONEER_*` (program/client credentials per Payoneer's integration)
- `SUBSCRIPTION_PRICE_USD`, `SUBSCRIPTION_PRICE_PKR`, `TRIAL_DAYS=3`
- `APP_URL`

The founder adds the real values directly in the deployment environment — not in code or this document.

---

## 14. Key user flows (step by step)

**A. New user → first match**
1. Sign up → verify phone (OTP) → selfie verification submitted.
2. Complete onboarding (basic info, values, preferences, optional photo).
3. 3-day trial starts automatically; Discover unlocks.
4. See daily suggestions with reasons → express interest.
5. On mutual interest → match created → chat unlocks (woman messages first).
6. Optionally add a wali to oversee the chat.

**B. Photo privacy**
1. Viewer opens a profile → photo is blurred.
2. If owner uses "request to view," viewer taps Request → owner gets a notification → approves/declines.
3. On mutual match (if owner uses auto-reveal), photo unblurs automatically.

**C. Subscription**
1. Trial ends in 1 day → reminder.
2. User opens Membership → pays via Easypaisa/JazzCash/Payoneer.
3. Server verifies payment → `premium_until = now + 30 days` → full access continues.
4. Near expiry → renewal reminder → repeat.

**D. Safety**
1. User reports/blocks someone in chat.
2. Report enters admin queue; AI-flagged content also lands there.
3. Admin reviews → warn / remove content / suspend / ban.

---

## 15. Build order (phases)

**Phase 1 — MVP:** landing page; auth + phone OTP + onboarding; photo upload with privacy; matching model + daily suggestions; interest flow + mutual match + women-initiated chat; AI moderation on chat & profile text; block/report + admin moderation queue + noindex.

**Phase 2 — Trust & money:** selfie verification + verified badge; wali/guardian mode; 3-day trial + $5/month via Easypaisa/JazzCash/Payoneer (manual renewal); notifications.

**Phase 3 — Depth:** "why you matched" explanations, success stories, profile prompts, admin metrics, International-mode refinements, polish.

---

## 16. Non-negotiables / quality bar

- Pakistan experience is **marriage-first and modesty-first**; strong moderation everywhere (legal + trust).
- Match exactly the reference design's look and feel.
- Mobile-responsive, keyboard-accessible, `prefers-reduced-motion` respected.
- All secrets server-side / env vars only; photos private and noindex.
- Women's first-message control enforced **server-side**.
- Clear footer + community rules: adults seeking marriage / serious connections; verified; moderated.

---

## 17. Open decisions for the founder

1. Final brand name — **Qubool** (alternatives: Naseeb, Humsafar).
2. Exact Premium price in **PKR** ($5 is the display value).
3. Which Anthropic model strings for moderation vs matching.
4. Selfie verification: manual admin review to start, or an automated KYC vendor.
5. Whether to register the company/hosting outside Pakistan to reduce regulatory exposure (get legal advice).
6. Domain name.

---

*End of requirements. Build Phase 1 first, confirm it works, then proceed to Phase 2 and 3.*
