import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { uploadProfilePhoto } from "@/lib/photos/signedUrl";

const preferenceSchema = z.object({
  field: z.string(),
  value: z.string(),
  is_dealbreaker: z.boolean(),
  weight: z.number().min(0).max(100),
});

const onboardingSchema = z.object({
  mode: z.enum(["pakistan", "international"]),
  display_name: z.string().min(1),
  dob: z.string(),
  city: z.string().optional(),
  country: z.string().optional(),
  languages: z.array(z.string()).default([]),
  religion: z.string().optional(),
  sect: z.string().optional(),
  practice_level: z.string().optional(),
  marital_status: z.string().optional(),
  wants_children: z.string().optional(),
  relocate: z.string().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  smoking: z.string().optional(),
  family_community: z.string().optional(),
  about_text: z.string().optional(),
  looking_for_text: z.string().optional(),
  preferences: z.array(preferenceSchema).default([]),
  photo_privacy_mode: z.enum(["match", "request"]).default("request"),
});

export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await request.formData();
  const raw = form.get("data");
  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Missing onboarding data" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const service = createServiceRoleClient();

  const { error: profileError } = await service.from("profiles").upsert({
    user_id: user.id,
    display_name: body.display_name,
    dob: body.dob,
    city: body.city ?? null,
    country: body.country ?? null,
    languages: body.languages,
    religion: body.religion ?? null,
    sect: body.sect ?? null,
    practice_level: body.practice_level ?? null,
    marital_status: body.marital_status ?? null,
    wants_children: body.wants_children ?? null,
    relocate: body.relocate ?? null,
    education: body.education ?? null,
    profession: body.profession ?? null,
    smoking: body.smoking ?? null,
    family_community: body.family_community ?? null,
    about_text: body.about_text ?? null,
    looking_for_text: body.looking_for_text ?? null,
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await service.from("preferences").delete().eq("user_id", user.id);
  if (body.preferences.length > 0) {
    const { error: prefError } = await service.from("preferences").insert(
      body.preferences.map((p) => ({ user_id: user.id, ...p }))
    );
    if (prefError) {
      return NextResponse.json({ error: prefError.message }, { status: 500 });
    }
  }

  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const path = await uploadProfilePhoto(user.id, photo);
    await service.from("photos").insert({
      user_id: user.id,
      storage_path: path,
      privacy_mode: body.photo_privacy_mode,
      is_primary: true,
    });
  }

  const { error: userError } = await service
    .from("users")
    .update({ mode: body.mode, onboarding_completed: true })
    .eq("id", user.id);
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
