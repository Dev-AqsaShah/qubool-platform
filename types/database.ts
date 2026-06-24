// Hand-written types mirroring db/migrations/0001_init.sql.
// Regenerate/replace with `supabase gen types typescript` once a live project exists.
//
// IMPORTANT: every Row type below must be declared with `type`, not
// `interface`. @supabase/supabase-js's schema inference (the
// `extends GenericSchema` check baked into its default type parameters)
// fails to resolve through `interface` references — every table silently
// collapses to `never`. Type aliases for the same object shape resolve
// correctly. This is a TS/postgrest-js interaction quirk, not a style choice.

export type Gender = "male" | "female";
export type Mode = "pakistan" | "international";
export type SelfieStatus = "not_submitted" | "pending" | "approved" | "rejected";
export type Role = "user" | "admin";
export type UserStatus = "active" | "suspended" | "banned";
export type PhotoPrivacyMode = "match" | "request";
export type PhotoAccessStatus = "requested" | "approved" | "revoked" | "declined";
export type InterestStatus = "interested" | "passed";
export type MessageModerationStatus = "clean" | "pending" | "held" | "removed";
export type WaliAccessLevel = "full" | "summary";
export type WaliStatus = "invited" | "accepted" | "declined" | "removed";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ModerationSourceType = "message" | "profile_text" | "report";
export type ModerationSeverity = "low" | "medium" | "high";
export type ModerationStatus = "open" | "approved" | "removed" | "warned" | "banned";
export type PaymentProvider = "easypaisa" | "jazzcash" | "payoneer";
export type PaymentStatus = "pending" | "success" | "failed";

export type UserRow = {
  id: string;
  email: string | null;
  gender: Gender;
  mode: Mode;
  phone: string | null;
  phone_verified: boolean;
  selfie_verified: boolean;
  selfie_verification_status: SelfieStatus;
  role: Role;
  status: UserStatus;
  onboarding_completed: boolean;
  trial_ends_at: string | null;
  premium_until: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  user_id: string;
  display_name: string;
  dob: string;
  city: string | null;
  country: string | null;
  languages: string[];
  religion: string | null;
  sect: string | null;
  practice_level: string | null;
  marital_status: string | null;
  wants_children: string | null;
  relocate: string | null;
  education: string | null;
  profession: string | null;
  smoking: string | null;
  family_community: string | null;
  about_text: string | null;
  looking_for_text: string | null;
  updated_at: string;
};

export type PreferenceRow = {
  id: string;
  user_id: string;
  field: string;
  value: string;
  is_dealbreaker: boolean;
  weight: number;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  user_id: string;
  storage_path: string;
  privacy_mode: PhotoPrivacyMode;
  is_primary: boolean;
  created_at: string;
};

export type PhotoAccessRow = {
  id: string;
  owner_id: string;
  viewer_id: string;
  status: PhotoAccessStatus;
  created_at: string;
  updated_at: string;
};

export type InterestRow = {
  id: string;
  from_user: string;
  to_user: string;
  status: InterestStatus;
  created_at: string;
};

export type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
  woman_id: string;
  first_message_sent: boolean;
  created_at: string;
};

export type MessageRow = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  moderation_status: MessageModerationStatus;
  created_at: string;
};

export type WaliRow = {
  id: string;
  user_id: string;
  wali_contact: string;
  access_level: WaliAccessLevel;
  status: WaliStatus;
  invited_user_id: string | null;
  created_at: string;
};

export type ReportRow = {
  id: string;
  reporter_id: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
};

export type BlockRow = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

export type ModerationQueueRow = {
  id: string;
  source_type: ModerationSourceType;
  source_id: string | null;
  user_id: string | null;
  reason: string | null;
  severity: ModerationSeverity;
  status: ModerationStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type SuggestionRow = {
  id: string;
  user_id: string;
  suggested_user_id: string;
  score: number;
  reason: string | null;
  date: string;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  txn_id: string;
  status: PaymentStatus;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export type NotificationPreferenceRow = {
  user_id: string;
  email_enabled: boolean;
  types_muted: string[];
};

export type Database = {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow>; Update: Partial<UserRow>; Relationships: [] };
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow>; Relationships: [] };
      preferences: { Row: PreferenceRow; Insert: Partial<PreferenceRow>; Update: Partial<PreferenceRow>; Relationships: [] };
      photos: { Row: PhotoRow; Insert: Partial<PhotoRow>; Update: Partial<PhotoRow>; Relationships: [] };
      photo_access: { Row: PhotoAccessRow; Insert: Partial<PhotoAccessRow>; Update: Partial<PhotoAccessRow>; Relationships: [] };
      interests: { Row: InterestRow; Insert: Partial<InterestRow>; Update: Partial<InterestRow>; Relationships: [] };
      matches: { Row: MatchRow; Insert: Partial<MatchRow>; Update: Partial<MatchRow>; Relationships: [] };
      messages: { Row: MessageRow; Insert: Partial<MessageRow>; Update: Partial<MessageRow>; Relationships: [] };
      walis: { Row: WaliRow; Insert: Partial<WaliRow>; Update: Partial<WaliRow>; Relationships: [] };
      reports: { Row: ReportRow; Insert: Partial<ReportRow>; Update: Partial<ReportRow>; Relationships: [] };
      blocks: { Row: BlockRow; Insert: Partial<BlockRow>; Update: Partial<BlockRow>; Relationships: [] };
      moderation_queue: { Row: ModerationQueueRow; Insert: Partial<ModerationQueueRow>; Update: Partial<ModerationQueueRow>; Relationships: [] };
      suggestions: { Row: SuggestionRow; Insert: Partial<SuggestionRow>; Update: Partial<SuggestionRow>; Relationships: [] };
      payments: { Row: PaymentRow; Insert: Partial<PaymentRow>; Update: Partial<PaymentRow>; Relationships: [] };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow>; Update: Partial<NotificationRow>; Relationships: [] };
      notification_preferences: { Row: NotificationPreferenceRow; Insert: Partial<NotificationPreferenceRow>; Update: Partial<NotificationPreferenceRow>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
