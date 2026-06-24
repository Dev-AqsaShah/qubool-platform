import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";

const EMAIL_COPY: Record<string, { subject: string; body: string }> = {
  new_match: { subject: "You have a new match on Qubool", body: "Someone you were interested in is interested too. Open Qubool to say hello." },
  new_message: { subject: "New message on Qubool", body: "You have a new message waiting in your matches." },
  interest_received: { subject: "Someone is interested in you", body: "Check Discover or Interests to see who." },
  photo_request_received: { subject: "Someone requested to see your photo", body: "Review the request from My Profile." },
  photo_request_approved: { subject: "Your photo request was approved", body: "You can now view their photo." },
  trial_ending_soon: { subject: "Your Qubool trial ends tomorrow", body: "Subscribe to keep your suggestions and chats active." },
  trial_ended: { subject: "Your Qubool trial has ended", body: "Subscribe any time to regain full access." },
  subscription_renewal_reminder: { subject: "Your Qubool subscription renews soon", body: "Renew from the Membership page to avoid losing access." },
  payment_confirmed: { subject: "Payment received — thank you", body: "Your Qubool membership is active for another 30 days." },
  payment_failed: { subject: "Your Qubool payment didn't go through", body: "Please try again from the Membership page." },
  wali_invite_received: { subject: "You've been invited as a wali on Qubool", body: "Sign in to accept or decline." },
  wali_invite_accepted: { subject: "Your wali invite was accepted", body: "Your wali can now follow your match chats." },
  moderation_outcome: { subject: "An update on your Qubool account", body: "Visit Safety Center for details on a recent moderation action." },
};

// Single entry point for every notification in the app (Section 11): writes
// the in-app row and, unless the user has muted that type or disabled email,
// sends the matching transactional email. Prefer this over inserting into
// `notifications` directly so email delivery and preferences stay consistent.
export async function notify(userId: string, type: string, payload: Record<string, unknown> = {}) {
  const service = createServiceRoleClient();

  await service.from("notifications").insert({ user_id: userId, type, payload });

  const { data: prefs } = await service
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (prefs && (!prefs.email_enabled || prefs.types_muted.includes(type))) return;

  const copy = EMAIL_COPY[type];
  if (!copy) return;

  const { data: authUser } = await service.auth.admin.getUserById(userId).catch(() => ({ data: null }));
  const email = authUser?.user?.email;
  if (!email) return;

  await sendEmail(email, copy.subject, `<p>${copy.body}</p>`);
}
