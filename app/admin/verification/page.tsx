import { createServiceRoleClient } from "@/lib/supabase/server";
import { VerificationReviewCard } from "@/components/admin/VerificationReviewCard";

export default async function AdminVerificationPage() {
  const service = createServiceRoleClient();
  const { data: pendingUsers } = await service
    .from("users")
    .select("id, email, created_at")
    .eq("selfie_verification_status", "pending");

  const ids = (pendingUsers ?? []).map((u) => u.id);
  const { data: profiles } = ids.length
    ? await service.from("profiles").select("user_id, display_name").in("user_id", ids)
    : { data: [] };
  const nameMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Verification review</h1>
      {(pendingUsers ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>No pending verifications.</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {(pendingUsers ?? []).map((u) => (
          <VerificationReviewCard key={u.id} userId={u.id} email={u.email} name={nameMap.get(u.id) ?? "Unnamed"} />
        ))}
      </div>
    </div>
  );
}
