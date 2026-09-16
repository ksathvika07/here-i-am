"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CVProfile = {
  id?: string;
  user_id: string;

  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;

  summary: string;

  education: string;
  skills: string;
  projects: string;
  experience: string;
  certifications: string;
  achievements: string;
};

const emptyProfile: CVProfile = {
  user_id: "",

  full_name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",

  summary: "",

  education: "",
  skills: "",
  projects: "",
  experience: "",
  certifications: "",
  achievements: "",
};

const supabase = createClient();

export default function CVPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<CVProfile>(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("cv_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setProfile(data);
    } else {
      setProfile({
        ...emptyProfile,
        user_id: user.id,
        full_name:
          user.user_metadata?.full_name || "",
        email: user.email || "",
      });
    }

    setLoading(false);
  }

  function updateField(
    field: keyof CVProfile,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveProfile() {
    setError("");
    setMessage("");

    if (!profile.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    const profileData = {
      user_id: user.id,

      full_name: profile.full_name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      location: profile.location.trim(),
      linkedin: profile.linkedin.trim(),
      github: profile.github.trim(),
      portfolio: profile.portfolio.trim(),

      summary: profile.summary.trim(),

      education: profile.education.trim(),
      skills: profile.skills.trim(),
      projects: profile.projects.trim(),
      experience: profile.experience.trim(),
      certifications:
        profile.certifications.trim(),
      achievements:
        profile.achievements.trim(),

      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("cv_profiles")
      .upsert(profileData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setProfile(data);
      setMessage("Your CV has been saved.");
    }

    setSaving(false);
  }

  function printCV() {
    window.print();
  }

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center">
        <p
          className="font-script text-4xl"
          style={{ color: "var(--blue-gray)" }}
        >
          Loading your CV...
        </p>
      </main>
    );
  }

  return (
    <main className="app-background min-h-screen px-5 py-6 sm:px-8 lg:px-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 print:hidden">
          <Link href="/dashboard" className="group">
            <p
              className="font-script text-3xl transition-opacity duration-300 group-hover:opacity-70 sm:text-4xl"
              style={{ color: "var(--dark)" }}
            >
              Here I Am
            </p>

            <p
              className="font-body mt-1 hidden text-[9px] uppercase tracking-[0.35em] sm:block"
              style={{ color: "var(--blue-gray)" }}
            >
              Your personal universe
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="font-body rounded-full border px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor:
                "rgba(255,255,255,0.55)",
              borderColor:
                "rgba(136,159,171,0.22)",
              color: "var(--dark)",
            }}
          >
            ← Dashboard
          </Link>
        </header>

        {/* TITLE */}
        <section className="mt-10 print:hidden">
          <p
            className="font-body text-[10px] uppercase tracking-[0.35em]"
            style={{ color: "var(--blue-gray)" }}
          >
            Your professional story
          </p>

          <h1
            className="font-heading mt-3 text-5xl font-medium sm:text-6xl"
            style={{ color: "var(--dark)" }}
          >
            My CV
          </h1>

          <p
            className="font-body mt-4 max-w-2xl text-sm leading-7"
            style={{ color: "var(--dark)" }}
          >
            Add your information once and build a clean,
            professional CV that you can update whenever
            you need.
          </p>
        </section>

        {/* MESSAGES */}
        {error && (
          <div
            className="font-body mt-6 rounded-2xl border px-5 py-4 text-sm print:hidden"
            style={{
              backgroundColor:
                "rgba(180,100,100,0.08)",
              borderColor:
                "rgba(180,100,100,0.18)",
              color: "#8B4A4A",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="font-body mt-6 rounded-2xl border px-5 py-4 text-sm print:hidden"
            style={{
              backgroundColor:
                "rgba(136,159,171,0.08)",
              borderColor:
                "rgba(136,159,171,0.18)",
              color: "var(--dark)",
            }}
          >
            {message}
          </div>
        )}

        {/* BUILDER + PREVIEW */}
        <div className="mt-8 grid gap-7 lg:grid-cols-[0.8fr_1.2fr] print:block">

          {/* FORM */}
          <section
            className="rounded-[2rem] border p-6 sm:p-8 print:hidden"
            style={{
              backgroundColor:
                "rgba(255,255,255,0.50)",
              borderColor:
                "rgba(136,159,171,0.20)",
              boxShadow:
                "0 20px 60px rgba(85,94,106,0.06)",
            }}
          >
            <p
              className="font-body text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "var(--blue-gray)" }}
            >
              CV information
            </p>

            {/* PERSONAL */}
            <div className="mt-7">
              <h2
                className="font-heading text-2xl"
                style={{ color: "var(--dark)" }}
              >
                Personal details
              </h2>

              <div className="mt-4 space-y-4">

                <input
                  value={profile.full_name}
                  onChange={(e) =>
                    updateField(
                      "full_name",
                      e.target.value
                    )
                  }
                  placeholder="Full name *"
                  className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    color: "var(--dark)",
                  }}
                />

                <input
                  value={profile.email}
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="Email"
                  type="email"
                  className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    color: "var(--dark)",
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">

                  <input
                    value={profile.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="Phone"
                    className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                    style={{
                      backgroundColor:
                        "rgba(255,255,255,0.5)",
                      borderColor:
                        "rgba(136,159,171,0.18)",
                      color: "var(--dark)",
                    }}
                  />

                  <input
                    value={profile.location}
                    onChange={(e) =>
                      updateField(
                        "location",
                        e.target.value
                      )
                    }
                    placeholder="Location"
                    className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                    style={{
                      backgroundColor:
                        "rgba(255,255,255,0.5)",
                      borderColor:
                        "rgba(136,159,171,0.18)",
                      color: "var(--dark)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* LINKS */}
            <div className="mt-8">
              <h2
                className="font-heading text-2xl"
                style={{ color: "var(--dark)" }}
              >
                Professional links
              </h2>

              <div className="mt-4 space-y-4">

                <input
                  value={profile.linkedin}
                  onChange={(e) =>
                    updateField(
                      "linkedin",
                      e.target.value
                    )
                  }
                  placeholder="LinkedIn URL"
                  className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    color: "var(--dark)",
                  }}
                />

                <input
                  value={profile.github}
                  onChange={(e) =>
                    updateField(
                      "github",
                      e.target.value
                    )
                  }
                  placeholder="GitHub URL"
                  className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    color: "var(--dark)",
                  }}
                />

                <input
                  value={profile.portfolio}
                  onChange={(e) =>
                    updateField(
                      "portfolio",
                      e.target.value
                    )
                  }
                  placeholder="Portfolio URL"
                  className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    color: "var(--dark)",
                  }}
                />
              </div>
            </div>

            {/* SUMMARY */}
            <div className="mt-8">
              <h2
                className="font-heading text-2xl"
                style={{ color: "var(--dark)" }}
              >
                Professional summary
              </h2>

              <textarea
                value={profile.summary}
                onChange={(e) =>
                  updateField(
                    "summary",
                    e.target.value
                  )
                }
                placeholder="Write a short professional introduction..."
                rows={5}
                className="font-body mt-4 w-full resize-none rounded-2xl border p-4 text-sm leading-6 outline-none"
                style={{
                  backgroundColor:
                    "rgba(255,255,255,0.5)",
                  borderColor:
                    "rgba(136,159,171,0.18)",
                  color: "var(--dark)",
                }}
              />
            </div>

            {/* EDUCATION */}
            <CVTextarea
              title="Education"
              value={profile.education}
              placeholder={
                "Example:\nB.Tech Software Engineering — University Name\n2024 – 2028\nCGPA: 8.5"
              }
              onChange={(value) =>
                updateField("education", value)
              }
            />

            {/* SKILLS */}
            <CVTextarea
              title="Skills"
              value={profile.skills}
              placeholder={
                "Example:\nJava, Python, SQL, React, Next.js, Git, MongoDB"
              }
              onChange={(value) =>
                updateField("skills", value)
              }
            />

            {/* PROJECTS */}
            <CVTextarea
              title="Projects"
              value={profile.projects}
              placeholder={
                "Example:\nHere I Am — Personal productivity web application\nBuilt with Next.js, Supabase and PostgreSQL."
              }
              onChange={(value) =>
                updateField("projects", value)
              }
            />

            {/* EXPERIENCE */}
            <CVTextarea
              title="Experience"
              value={profile.experience}
              placeholder={
                "Example:\nSoftware Engineering Intern — Company Name\nJune 2026 – August 2026\nWorked on..."
              }
              onChange={(value) =>
                updateField("experience", value)
              }
            />

            {/* CERTIFICATIONS */}
            <CVTextarea
              title="Certifications"
              value={profile.certifications}
              placeholder={
                "Example:\nAWS Cloud Practitioner\nGoogle Data Analytics"
              }
              onChange={(value) =>
                updateField(
                  "certifications",
                  value
                )
              }
            />

            {/* ACHIEVEMENTS */}
            <CVTextarea
              title="Achievements"
              value={profile.achievements}
              placeholder={
                "Example:\nHackathon finalist\nAcademic achievement\nLeadership experience"
              }
              onChange={(value) =>
                updateField(
                  "achievements",
                  value
                )
              }
            />

            {/* BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="font-body rounded-full px-7 py-3.5 text-xs font-medium uppercase tracking-[0.14em] transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                style={{
                  backgroundColor:
                    "var(--dark)",
                  color: "var(--white)",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save CV →"}
              </button>

              <button
                type="button"
                onClick={printCV}
                className="font-body rounded-full border px-7 py-3.5 text-xs font-medium uppercase tracking-[0.14em] transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor:
                    "rgba(255,255,255,0.45)",
                  borderColor:
                    "rgba(136,159,171,0.22)",
                  color: "var(--dark)",
                }}
              >
                Print / Save PDF
              </button>
            </div>
          </section>

          {/* CV PREVIEW */}
          <section className="print:w-full">

            <div
              id="cv-preview"
              className="mx-auto min-h-[1100px] w-full max-w-[850px] rounded-[1rem] border p-8 shadow-xl sm:p-12 print:min-h-0 print:max-w-none print:rounded-none print:border-0 print:p-12 print:shadow-none"
              style={{
                backgroundColor: "#ffffff",
                borderColor:
                  "rgba(136,159,171,0.15)",
                color: "var(--dark)",
              }}
            >

              {/* CV HEADER */}
              <div
                className="border-b pb-7"
                style={{
                  borderColor:
                    "rgba(136,159,171,0.25)",
                }}
              >
                <h1
                  className="font-heading text-4xl font-medium sm:text-5xl"
                  style={{ color: "var(--dark)" }}
                >
                  {profile.full_name ||
                    "Your Name"}
                </h1>

                <div
                  className="font-body mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px]"
                  style={{
                    color: "var(--blue-gray)",
                  }}
                >
                  {profile.email && (
                    <span>
                      {profile.email}
                    </span>
                  )}

                  {profile.phone && (
                    <span>
                      {profile.phone}
                    </span>
                  )}

                  {profile.location && (
                    <span>
                      {profile.location}
                    </span>
                  )}
                </div>

                {(profile.linkedin ||
                  profile.github ||
                  profile.portfolio) && (
                  <div
                    className="font-body mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px]"
                    style={{
                      color:
                        "var(--blue-gray)",
                    }}
                  >
                    {profile.linkedin && (
                      <span>
                        LinkedIn:{" "}
                        {profile.linkedin}
                      </span>
                    )}

                    {profile.github && (
                      <span>
                        GitHub:{" "}
                        {profile.github}
                      </span>
                    )}

                    {profile.portfolio && (
                      <span>
                        Portfolio:{" "}
                        {profile.portfolio}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* SUMMARY */}
              {profile.summary && (
                <CVSection title="Profile">
                  <p className="whitespace-pre-wrap">
                    {profile.summary}
                  </p>
                </CVSection>
              )}

              {/* EDUCATION */}
              {profile.education && (
                <CVSection title="Education">
                  <FormattedText
                    text={profile.education}
                  />
                </CVSection>
              )}

              {/* SKILLS */}
              {profile.skills && (
                <CVSection title="Skills">
                  <FormattedText
                    text={profile.skills}
                  />
                </CVSection>
              )}

              {/* PROJECTS */}
              {profile.projects && (
                <CVSection title="Projects">
                  <FormattedText
                    text={profile.projects}
                  />
                </CVSection>
              )}

              {/* EXPERIENCE */}
              {profile.experience && (
                <CVSection title="Experience">
                  <FormattedText
                    text={profile.experience}
                  />
                </CVSection>
              )}

              {/* CERTIFICATIONS */}
              {profile.certifications && (
                <CVSection title="Certifications">
                  <FormattedText
                    text={profile.certifications}
                  />
                </CVSection>
              )}

              {/* ACHIEVEMENTS */}
              {profile.achievements && (
                <CVSection title="Achievements">
                  <FormattedText
                    text={profile.achievements}
                  />
                </CVSection>
              )}

              {!profile.summary &&
                !profile.education &&
                !profile.skills &&
                !profile.projects &&
                !profile.experience &&
                !profile.certifications &&
                !profile.achievements && (
                  <div className="py-24 text-center">
                    <p
                      className="font-script text-3xl"
                      style={{
                        color:
                          "var(--blue-gray)",
                      }}
                    >
                      Your story starts here.
                    </p>

                    <p
                      className="font-body mt-3 text-xs"
                      style={{
                        color:
                          "var(--blue-gray)",
                      }}
                    >
                      Fill in your information to
                      build your CV.
                    </p>
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer
          className="py-8 text-center print:hidden"
          style={{ color: "var(--blue-gray)" }}
        >
          <p className="font-body text-[9px] uppercase tracking-[0.28em]">
            Here I Am · your space, your story
          </p>
        </footer>
      </div>
    </main>
  );
}

function CVTextarea({
  title,
  value,
  placeholder,
  onChange,
}: {
  title: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-8">
      <h2
        className="font-heading text-2xl"
        style={{ color: "var(--dark)" }}
      >
        {title}
      </h2>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="font-body mt-4 w-full resize-y rounded-2xl border p-4 text-sm leading-6 outline-none"
        style={{
          backgroundColor:
            "rgba(255,255,255,0.5)",
          borderColor:
            "rgba(136,159,171,0.18)",
          color: "var(--dark)",
        }}
      />
    </div>
  );
}

function CVSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2
        className="font-heading border-b pb-2 text-lg font-medium uppercase tracking-[0.08em]"
        style={{
          color: "var(--dark)",
          borderColor:
            "rgba(136,159,171,0.25)",
        }}
      >
        {title}
      </h2>

      <div
        className="font-body mt-3 whitespace-pre-wrap text-[11px] leading-6"
        style={{
          color: "var(--dark)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function FormattedText({
  text,
}: {
  text: string;
}) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <p key={index} className="min-h-[1.5rem]">
          {line}
        </p>
      ))}
    </>
  );
}