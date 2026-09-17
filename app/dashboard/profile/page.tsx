"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        router.replace("/auth");
        return;
      }

      setFullName(
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : ""
      );

      setEmail(user.email ?? "");

      setPhone(
        typeof user.user_metadata?.phone === "string"
          ? user.user_metadata.phone
          : ""
      );

      setLocation(
        typeof user.user_metadata?.location === "string"
          ? user.user_metadata.location
          : ""
      );

      setBio(
        typeof user.user_metadata?.bio === "string"
          ? user.user_metadata.bio
          : ""
      );

      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanedName = fullName.trim();
    const cleanedPhone = phone.trim();
    const cleanedLocation = location.trim();
    const cleanedBio = bio.trim();

    if (!cleanedName) {
      setError("Please enter your name.");
      return;
    }

    if (cleanedName.length > 80) {
      setError("Your name must be 80 characters or less.");
      return;
    }

    if (cleanedPhone.length > 30) {
      setError("Your phone number must be 30 characters or less.");
      return;
    }

    if (cleanedLocation.length > 100) {
      setError("Your location must be 100 characters or less.");
      return;
    }

    if (cleanedBio.length > 500) {
      setError("Your bio must be 500 characters or less.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { data, error: updateError } =
      await supabase.auth.updateUser({
        data: {
          full_name: cleanedName,
          phone: cleanedPhone,
          location: cleanedLocation,
          bio: cleanedBio,
        },
      });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (data.user) {
      setFullName(
        typeof data.user.user_metadata?.full_name === "string"
          ? data.user.user_metadata.full_name
          : cleanedName
      );

      setPhone(
        typeof data.user.user_metadata?.phone === "string"
          ? data.user.user_metadata.phone
          : cleanedPhone
      );

      setLocation(
        typeof data.user.user_metadata?.location === "string"
          ? data.user.user_metadata.location
          : cleanedLocation
      );

      setBio(
        typeof data.user.user_metadata?.bio === "string"
          ? data.user.user_metadata.bio
          : cleanedBio
      );
    }

    setMessage("Your profile has been saved successfully.");
    setSaving(false);
  }

  function handleReset() {
    setError("");
    setMessage("");
  }

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-[#d8c3cb] border-t-[#4a3542]" />

          <p className="mt-4 font-body text-sm text-[#8b7783]">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  const avatarLetter =
    fullName.trim().charAt(0).toUpperCase() ||
    email.charAt(0).toUpperCase() ||
    "U";

  return (
    <main className="app-background min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-body text-[9px] tracking-[0.35em] text-[#9b7e8d]">
              YOUR PERSONAL UNIVERSE
            </p>

            <h1 className="font-heading mt-1 text-3xl text-[#4a3542] sm:text-4xl">
              Profile
            </h1>

            <p className="mt-2 max-w-xl font-body text-sm leading-6 text-[#877985]">
              Make your personal space feel more like you.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border border-white/80 bg-white/60 px-5 py-3 font-body text-xs font-medium text-[#625362] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/85"
          >
            ← Dashboard
          </Link>
        </header>

        {/* Main profile card */}

        <section className="glass-soft overflow-hidden rounded-[34px]">
          {/* Profile identity */}

          <div className="relative overflow-hidden border-b border-white/65 px-6 py-9 sm:px-10">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#efc8bd]/25 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 left-[35%] h-48 w-48 rounded-full bg-[#c9becf]/25 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/85 bg-gradient-to-br from-[#e5d8dc] to-[#cdbdc6] font-heading text-4xl text-[#4a3542] shadow-[0_18px_45px_rgba(74,53,66,0.12)]">
                {avatarLetter}
              </div>

              <div className="text-center sm:text-left">
                <p className="font-body text-[9px] uppercase tracking-[0.3em] text-[#9b7e8d]">
                  Your personal profile
                </p>

                <h2 className="font-heading mt-1 text-3xl text-[#4a3542]">
                  {fullName || "Your name"}
                </h2>

                <p className="mt-1 font-body text-xs text-[#877985]">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Settings form */}

          <form
            onSubmit={handleSave}
            className="space-y-7 px-6 py-8 sm:px-10 sm:py-10"
          >
            {/* Name */}

            <div>
              <label
                htmlFor="fullName"
                className="font-body mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3542]"
              >
                Display name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setError("");
                  setMessage("");
                }}
                placeholder="Enter your name"
                autoComplete="name"
                maxLength={80}
                className="font-body w-full rounded-2xl border border-white/85 bg-white/55 px-4 py-3.5 text-sm text-[#4a3542] outline-none transition placeholder:text-[#a18d98] focus:border-[#b99aaa] focus:bg-white/80 focus:ring-2 focus:ring-[#d9c3cc]/35"
              />
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="font-body mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3542]"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                readOnly
                className="font-body w-full cursor-not-allowed rounded-2xl border border-white/70 bg-[#eadfe2]/45 px-4 py-3.5 text-sm text-[#877985] outline-none"
              />

              <p className="mt-2 font-body text-[10px] leading-5 text-[#a18d98]">
                This is your login email. It is not changed from this profile
                page.
              </p>
            </div>

            {/* Phone + Location */}

            <div className="grid gap-7 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className="font-body mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3542]"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  maxLength={30}
                  className="font-body w-full rounded-2xl border border-white/85 bg-white/55 px-4 py-3.5 text-sm text-[#4a3542] outline-none transition placeholder:text-[#a18d98] focus:border-[#b99aaa] focus:bg-white/80 focus:ring-2 focus:ring-[#d9c3cc]/35"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="font-body mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3542]"
                >
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  placeholder="City, country"
                  autoComplete="address-level2"
                  maxLength={100}
                  className="font-body w-full rounded-2xl border border-white/85 bg-white/55 px-4 py-3.5 text-sm text-[#4a3542] outline-none transition placeholder:text-[#a18d98] focus:border-[#b99aaa] focus:bg-white/80 focus:ring-2 focus:ring-[#d9c3cc]/35"
                />
              </div>
            </div>

            {/* Bio */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="bio"
                  className="font-body block text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3542]"
                >
                  About you
                </label>

                <span className="font-body text-[10px] text-[#a18d98]">
                  {bio.length}/500
                </span>
              </div>

              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(event) => {
                  setBio(event.target.value);
                  setError("");
                  setMessage("");
                }}
                placeholder="Write a little something about yourself..."
                rows={6}
                maxLength={500}
                className="font-body w-full resize-none rounded-2xl border border-white/85 bg-white/55 px-4 py-3.5 text-sm leading-6 text-[#4a3542] outline-none transition placeholder:text-[#a18d98] focus:border-[#b99aaa] focus:bg-white/80 focus:ring-2 focus:ring-[#d9c3cc]/35"
              />
            </div>

            {/* Messages */}

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200/70 bg-red-50/60 px-4 py-3 font-body text-xs leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="rounded-2xl border border-green-200/70 bg-green-50/60 px-4 py-3 font-body text-xs leading-5 text-green-700"
              >
                {message}
              </div>
            )}

            {/* Actions */}

            <div className="flex flex-col gap-3 border-t border-white/60 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  router.push("/dashboard");
                }}
                className="rounded-full border border-white/85 bg-white/55 px-7 py-3 font-body text-xs font-medium text-[#625362] transition hover:-translate-y-0.5 hover:bg-white/80"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#4a3542] px-8 py-3 font-body text-xs font-semibold text-white shadow-[0_14px_35px_rgba(74,53,66,0.2)] transition hover:-translate-y-0.5 hover:bg-[#624957] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        <p className="py-7 text-center font-body text-[9px] tracking-[0.35em] text-[#9b8492]">
          HERE I AM · YOUR SPACE, YOUR STORY
        </p>
      </div>
    </main>
  );
}