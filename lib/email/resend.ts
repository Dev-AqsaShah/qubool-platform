import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    // No key configured yet (local/dev scaffold) — skip rather than throw.
    return;
  }
  await getClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Qubool <notifications@qubool.app>",
    to,
    subject,
    html,
  });
}
