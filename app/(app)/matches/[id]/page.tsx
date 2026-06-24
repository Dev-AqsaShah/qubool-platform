import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { ChatWindow } from "@/components/app/ChatWindow";
import { BlockReportControls } from "@/components/app/BlockReportControls";

export default async function MatchChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: match } = await supabase.from("matches").select("*").eq("id", id).maybeSingle();
  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    redirect("/matches");
  }

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", otherId).maybeSingle();
  const canSendFirstMessage = match.first_message_sent || match.woman_id === user.id;

  return (
    <div>
      <div className="wrap"><AppNav active="/matches" /></div>
      <div className="wrap" style={{ paddingBottom: 80, maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>{profile?.display_name ?? "Member"}</h1>
          <BlockReportControls targetId={otherId} />
        </div>
        {!match.first_message_sent && (
          <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 14 }}>
            In every match, she sends the first message. {match.woman_id === user.id ? "Go ahead and say hello." : ""}
          </p>
        )}
        <ChatWindow
          matchId={id}
          currentUserId={user.id}
          canSendFirstMessage={canSendFirstMessage}
          otherName={profile?.display_name ?? "they"}
        />
      </div>
    </div>
  );
}
