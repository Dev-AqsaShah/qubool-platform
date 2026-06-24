"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  EDUCATION_OPTIONS,
  LANGUAGE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PRACTICE_LEVEL_OPTIONS,
  PREFERENCE_FIELDS,
  RELIGION_OPTIONS,
  RELOCATE_OPTIONS,
  SECT_OPTIONS,
  SMOKING_OPTIONS,
  WANTS_CHILDREN_OPTIONS,
} from "@/lib/onboardingOptions";

type PreferenceValue = { value: string; isDealbreaker: boolean };

const STEPS = ["Basics", "Values & lifestyle", "Partner preferences", "About & photo"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"pakistan" | "international">("pakistan");
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);

  const [religion, setReligion] = useState("");
  const [sect, setSect] = useState("");
  const [practiceLevel, setPracticeLevel] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [wantsChildren, setWantsChildren] = useState("");
  const [relocate, setRelocate] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [smoking, setSmoking] = useState("");
  const [familyCommunity, setFamilyCommunity] = useState("");

  const [preferences, setPreferences] = useState<Record<string, PreferenceValue>>({});
  const [ageMin, setAgeMin] = useState("21");
  const [ageMax, setAgeMax] = useState("40");
  const [ageDealbreaker, setAgeDealbreaker] = useState(true);

  const [aboutText, setAboutText] = useState("");
  const [lookingForText, setLookingForText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPrivacyMode, setPhotoPrivacyMode] = useState<"match" | "request">("request");

  function toggleLanguage(lang: string) {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  }

  function setPreference(field: string, value: string) {
    setPreferences((prev) => ({ ...prev, [field]: { value, isDealbreaker: prev[field]?.isDealbreaker ?? false } }));
  }

  function toggleDealbreaker(field: string) {
    setPreferences((prev) => ({
      ...prev,
      [field]: { value: prev[field]?.value ?? "", isDealbreaker: !prev[field]?.isDealbreaker },
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const preferenceRows = [
      { field: "age_min", value: ageMin, is_dealbreaker: ageDealbreaker, weight: 80 },
      { field: "age_max", value: ageMax, is_dealbreaker: ageDealbreaker, weight: 80 },
      ...Object.entries(preferences)
        .filter(([, v]) => v.value)
        .map(([field, v]) => ({
          field,
          value: v.value,
          is_dealbreaker: v.isDealbreaker,
          weight: v.isDealbreaker ? 100 : 50,
        })),
    ];

    const payload = {
      mode,
      display_name: displayName,
      dob,
      city,
      country,
      languages,
      religion,
      sect,
      practice_level: practiceLevel,
      marital_status: maritalStatus,
      wants_children: wantsChildren,
      relocate,
      education,
      profession,
      smoking,
      family_community: familyCommunity,
      about_text: aboutText,
      looking_for_text: lookingForText,
      preferences: preferenceRows,
      photo_privacy_mode: photoPrivacyMode,
    };

    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    if (photo) form.append("photo", photo);

    const res = await fetch("/api/onboarding", { method: "POST", body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(typeof body.error === "string" ? body.error : "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/discover");
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="wrap" style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 80 }}>
      <span className="eyebrow">Step {step + 1} of {STEPS.length}</span>
      <h1 style={{ margin: "10px 0 6px" }}>{STEPS[step]}</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>
        Keep it brief — you can always edit this later from your profile.
      </p>

      {step === 0 && (
        <div>
          <div className="field">
            <label htmlFor="mode">Mode</label>
            <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as "pakistan" | "international")}>
              <option value="pakistan">Pakistan · Rishta mode</option>
              <option value="international">International mode</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="display_name">Display name</label>
            <input id="display_name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dob">Date of birth</label>
            <input id="dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="country">Country</label>
            <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="field">
            <label>Languages</label>
            <div className="option-grid">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  className={`option-pill${languages.includes(lang) ? " selected" : ""}`}
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="field">
            <label htmlFor="religion">Religion</label>
            <select id="religion" value={religion} onChange={(e) => setReligion(e.target.value)}>
              <option value="">Select…</option>
              {RELIGION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {religion === "Islam" && (
            <>
              <div className="field">
                <label htmlFor="sect">Sect / maslak</label>
                <select id="sect" value={sect} onChange={(e) => setSect(e.target.value)}>
                  <option value="">Select…</option>
                  {SECT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="practice_level">Practice level</label>
                <select id="practice_level" value={practiceLevel} onChange={(e) => setPracticeLevel(e.target.value)}>
                  <option value="">Select…</option>
                  {PRACTICE_LEVEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="field">
            <label htmlFor="marital_status">Marital status</label>
            <select id="marital_status" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
              <option value="">Select…</option>
              {MARITAL_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="wants_children">Wants children</label>
            <select id="wants_children" value={wantsChildren} onChange={(e) => setWantsChildren(e.target.value)}>
              <option value="">Select…</option>
              {WANTS_CHILDREN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="relocate">Willing to relocate</label>
            <select id="relocate" value={relocate} onChange={(e) => setRelocate(e.target.value)}>
              <option value="">Select…</option>
              {RELOCATE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="education">Education</label>
            <select id="education" value={education} onChange={(e) => setEducation(e.target.value)}>
              <option value="">Select…</option>
              {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="profession">Profession</label>
            <input id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="smoking">Smoking</label>
            <select id="smoking" value={smoking} onChange={(e) => setSmoking(e.target.value)}>
              <option value="">Select…</option>
              {SMOKING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="family_community">Family / community preferences (optional)</label>
            <input id="family_community" value={familyCommunity} onChange={(e) => setFamilyCommunity(e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p style={{ color: "var(--muted)", fontSize: ".92rem", marginBottom: 18 }}>
            Tell us what you&apos;re looking for in a partner. Mark anything you
            won&apos;t compromise on as a dealbreaker — we&apos;ll only suggest
            matches where every dealbreaker is satisfied on both sides.
          </p>
          <div className="field">
            <label>Age range</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="number" min={18} max={90} value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
              <span>to</span>
              <input type="number" min={18} max={90} value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
            </div>
            <label className="dealbreaker-toggle">
              <input type="checkbox" checked={ageDealbreaker} onChange={() => setAgeDealbreaker((v) => !v)} /> Dealbreaker
            </label>
          </div>
          {PREFERENCE_FIELDS.map(({ field, label, options }) => (
            <div className="field" key={field}>
              <label htmlFor={`pref_${field}`}>{label}</label>
              <select
                id={`pref_${field}`}
                value={preferences[field]?.value ?? ""}
                onChange={(e) => setPreference(field, e.target.value)}
              >
                <option value="">No preference</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {preferences[field]?.value && (
                <label className="dealbreaker-toggle">
                  <input
                    type="checkbox"
                    checked={preferences[field]?.isDealbreaker ?? false}
                    onChange={() => toggleDealbreaker(field)}
                  />{" "}
                  Dealbreaker
                </label>
              )}
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="field">
            <label htmlFor="about_text">About me</label>
            <textarea id="about_text" value={aboutText} onChange={(e) => setAboutText(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="looking_for_text">What I&apos;m looking for</label>
            <textarea id="looking_for_text" value={lookingForText} onChange={(e) => setLookingForText(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="photo">Photo (optional)</label>
            <input id="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            <span className="hint">Never public by default — you choose how it&apos;s revealed below.</span>
          </div>
          {photo && (
            <div className="field">
              <label>Photo privacy</label>
              <select value={photoPrivacyMode} onChange={(e) => setPhotoPrivacyMode(e.target.value as "match" | "request")}>
                <option value="request">Request to view — I approve each viewer</option>
                <option value="match">Auto-reveal on mutual match</option>
              </select>
            </div>
          )}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading}
          onClick={() => (isLastStep ? handleSubmit() : setStep((s) => s + 1))}
        >
          {isLastStep ? (loading ? "Saving…" : "Finish") : "Continue"}
        </button>
      </div>
    </div>
  );
}
