-- Qubool initial schema
-- Run against a Supabase Postgres project (SQL editor or `supabase db push`).
-- Auth users live in auth.users (Supabase Auth). public.users extends them.

create extension if not exists "pgcrypto";

-- =========================================================
-- users
-- =========================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  gender text check (gender in ('male', 'female')) not null,
  mode text check (mode in ('pakistan', 'international')) not null default 'pakistan',
  phone text,
  phone_verified boolean not null default false,
  selfie_verified boolean not null default false,
  selfie_verification_status text check (selfie_verification_status in ('not_submitted', 'pending', 'approved', 'rejected')) not null default 'not_submitted',
  role text check (role in ('user', 'admin')) not null default 'user',
  status text check (status in ('active', 'suspended', 'banned')) not null default 'active',
  onboarding_completed boolean not null default false,
  trial_ends_at timestamptz,
  premium_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- profiles
-- =========================================================
create table public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null,
  dob date not null,
  city text,
  country text,
  languages text[] default '{}',
  religion text,
  sect text,
  practice_level text,
  marital_status text,
  wants_children text,
  relocate text,
  education text,
  profession text,
  smoking text,
  family_community text,
  about_text text,
  looking_for_text text,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- preferences (partner preferences, each flagged dealbreaker or soft)
-- =========================================================
create table public.preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  field text not null,
  value text not null,
  is_dealbreaker boolean not null default false,
  weight int not null default 50 check (weight between 0 and 100),
  created_at timestamptz not null default now()
);
create index preferences_user_id_idx on public.preferences(user_id);

-- =========================================================
-- photos
-- =========================================================
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  storage_path text not null,
  privacy_mode text check (privacy_mode in ('match', 'request')) not null default 'request',
  is_primary boolean not null default true,
  created_at timestamptz not null default now()
);
create index photos_user_id_idx on public.photos(user_id);

create table public.photo_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  viewer_id uuid not null references public.users(id) on delete cascade,
  status text check (status in ('requested', 'approved', 'revoked', 'declined')) not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, viewer_id)
);

-- =========================================================
-- interests / matches / messages
-- =========================================================
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.users(id) on delete cascade,
  to_user uuid not null references public.users(id) on delete cascade,
  status text check (status in ('interested', 'passed')) not null default 'interested',
  created_at timestamptz not null default now(),
  unique (from_user, to_user)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.users(id) on delete cascade,
  user_b uuid not null references public.users(id) on delete cascade,
  woman_id uuid not null references public.users(id),
  first_message_sent boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);
create index matches_user_a_idx on public.matches(user_a);
create index matches_user_b_idx on public.matches(user_b);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  moderation_status text check (moderation_status in ('clean', 'pending', 'held', 'removed')) not null default 'pending',
  created_at timestamptz not null default now()
);
create index messages_match_id_idx on public.messages(match_id);

-- =========================================================
-- wali / guardian mode
-- =========================================================
create table public.walis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wali_contact text not null,
  access_level text check (access_level in ('full', 'summary')) not null default 'summary',
  status text check (status in ('invited', 'accepted', 'declined', 'removed')) not null default 'invited',
  invited_user_id uuid references public.users(id),
  created_at timestamptz not null default now()
);
create index walis_user_id_idx on public.walis(user_id);

-- =========================================================
-- safety: reports / blocks
-- =========================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  details text,
  status text check (status in ('open', 'reviewing', 'resolved', 'dismissed')) not null default 'open',
  created_at timestamptz not null default now()
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

-- =========================================================
-- AI moderation queue (flags from automated moderation + escalations)
-- =========================================================
create table public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  source_type text check (source_type in ('message', 'profile_text', 'report')) not null,
  source_id uuid,
  user_id uuid references public.users(id) on delete cascade,
  reason text,
  severity text check (severity in ('low', 'medium', 'high')) not null default 'low',
  status text check (status in ('open', 'approved', 'removed', 'warned', 'banned')) not null default 'open',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id)
);

-- =========================================================
-- suggestions (daily curated matches)
-- =========================================================
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  suggested_user_id uuid not null references public.users(id) on delete cascade,
  score int not null check (score between 0 and 100),
  reason text,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, suggested_user_id, date)
);
create index suggestions_user_id_date_idx on public.suggestions(user_id, date);

-- =========================================================
-- payments
-- =========================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text check (provider in ('easypaisa', 'jazzcash', 'payoneer')) not null,
  amount numeric(10, 2) not null,
  currency text not null,
  txn_id text not null,
  status text check (status in ('pending', 'success', 'failed')) not null default 'pending',
  created_at timestamptz not null default now(),
  unique (provider, txn_id)
);
create index payments_user_id_idx on public.payments(user_id);

-- =========================================================
-- notifications
-- =========================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_id_idx on public.notifications(user_id, read);

-- =========================================================
-- notification preferences
-- =========================================================
create table public.notification_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  email_enabled boolean not null default true,
  types_muted text[] not null default '{}'
);

-- =========================================================
-- updated_at triggers
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger photo_access_set_updated_at before update on public.photo_access
  for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.photos enable row level security;
alter table public.photo_access enable row level security;
alter table public.interests enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.walis enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.moderation_queue enable row level security;
alter table public.suggestions enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

-- users: read own row, or any row if admin. Update own row only.
create policy users_select_own_or_admin on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy users_update_own on public.users
  for update using (id = auth.uid());

-- profiles: owner full access; other verified users can read (gated further
-- in app logic by mode/dealbreaker filters); admin full read.
create policy profiles_select on public.profiles
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.users u where u.id = auth.uid() and u.status = 'active')
  );
create policy profiles_upsert_own on public.profiles
  for insert with check (user_id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (user_id = auth.uid());

-- preferences: owner only (+ admin)
create policy preferences_owner on public.preferences
  for all using (user_id = auth.uid() or public.is_admin());

-- photos: owner manages; viewing/signed-url issuance handled server-side
-- with the service role, so no broad select policy for other users here.
create policy photos_owner on public.photos
  for all using (user_id = auth.uid() or public.is_admin());

-- photo_access: owner and viewer can see/manage their own request rows.
create policy photo_access_parties on public.photo_access
  for all using (owner_id = auth.uid() or viewer_id = auth.uid() or public.is_admin());

-- interests: either party can see; only the "from" party can create.
create policy interests_parties_select on public.interests
  for select using (from_user = auth.uid() or to_user = auth.uid() or public.is_admin());
create policy interests_from_user_insert on public.interests
  for insert with check (from_user = auth.uid());

-- matches: either party (or admin) can read.
create policy matches_parties_select on public.matches
  for select using (user_a = auth.uid() or user_b = auth.uid() or public.is_admin());

-- messages: only match participants (or their accepted wali, or admin).
create policy messages_parties_select on public.messages
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
    or exists (
      select 1 from public.matches m
      join public.walis w on w.user_id in (m.user_a, m.user_b)
      where m.id = messages.match_id
        and w.invited_user_id = auth.uid()
        and w.status = 'accepted'
    )
  );
create policy messages_sender_insert on public.messages
  for insert with check (sender_id = auth.uid());

-- walis: the user who owns the wali relationship, or the invited wali, or admin.
create policy walis_parties on public.walis
  for all using (user_id = auth.uid() or invited_user_id = auth.uid() or public.is_admin());

-- reports: reporter can create/read own reports; admin reads all.
create policy reports_reporter on public.reports
  for select using (reporter_id = auth.uid() or public.is_admin());
create policy reports_reporter_insert on public.reports
  for insert with check (reporter_id = auth.uid());

-- blocks: blocker manages their own block list.
create policy blocks_owner on public.blocks
  for all using (blocker_id = auth.uid() or public.is_admin());

-- moderation_queue: admin only.
create policy moderation_queue_admin on public.moderation_queue
  for all using (public.is_admin());

-- suggestions: owner reads own suggestions; admin reads all.
create policy suggestions_owner on public.suggestions
  for select using (user_id = auth.uid() or public.is_admin());

-- payments: owner reads own payments; admin reads all. Writes are
-- server-side only via the service role (no insert/update policy for users).
create policy payments_owner_select on public.payments
  for select using (user_id = auth.uid() or public.is_admin());

-- notifications: owner only.
create policy notifications_owner on public.notifications
  for all using (user_id = auth.uid() or public.is_admin());

-- notification_preferences: owner only.
create policy notification_preferences_owner on public.notification_preferences
  for all using (user_id = auth.uid());
