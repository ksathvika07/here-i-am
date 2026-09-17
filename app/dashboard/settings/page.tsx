"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      setEmail(user.email || "");

      setFullName(
        user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          ""
      );

      setLocation(user.user_metadata?.location || "");
      setBio(user.user_metadata?.bio || "");

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        location: location.trim(),
        bio: bio.trim(),
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Your profile has been updated successfully.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d8c3cb] border-t-[#4a3542]" />

          <p className="mt-4 font-body text-sm text-[#8b7783]">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-background min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-body text-[9px] tracking-[0.35em] text-[#9b7e8d]">
              YOUR PERSONAL UNIVERSE
            </p>

            <h1 className="font-heading mt-2 text-4xl text-[#4a3542] sm:text-5xl">
              Settings
            </h1>

            <p className="mt-2 font-body text-sm text-[#81737d]">
              Make your space feel a little more like you.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-full border border-white/80 bg-white/55 px-5 py-3 font-body text-xs font-medium text-[#554653] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Profile card */}

        <section className="dashboard-card rounded-[32px] p-6 sm:p-9">
          <div className="flex flex-col items-start gap-5 border-b border-[#a88f9d]/10 pb-7 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/90 bg-[#d7c8d0] font-heading text-3xl text-[#4a3542] shadow-[0_15px_35px_rgba(74,53,66,0.1)]">
              {fullName.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <p className="font-body text-[9px] tracking-[0.3em] text-[#9b7e8d]">
                PROFILE
              </p>

              <h2 className="font-heading mt-1 text-2xl text-[#4a3542]">
                Your personal details
              </h2>

              <p className="mt-1 font-body text-xs text-[#887985]">
                These details personalize your Here I Am experience.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            {/* Full name */}

            <div>
              <label
                htmlFor="fullName"
                className="font-body mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#675966]"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your name"
                required
                className="font-body w-full rounded-2xl border border-white/80 bg-white/55 px-5 py-4 text-sm text-[#4a3542] outline-none backdrop-blur-xl transition focus:border-[#b99eab] focus:bg-white/75"
              />
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="font-body mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#675966]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="font-body w-full cursor-not-allowed rounded-2xl border border-white/70 bg-[#eee5e7]/60 px-5 py-4 text-sm text-[#81737d] outline-none"
              />

              <p className="mt-2 font-body text-[10px] text-[#9a8793]">
                Your email is managed by your authentication account.
              </p>
            </div>

            {/* Location */}

            <div>
              <label
                htmlFor="location"
                className="font-body mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#675966]"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Where are you based?"
                className="font-body w-full rounded-2xl border border-white/80 bg-white/55 px-5 py-4 text-sm text-[#4a3542] outline-none backdrop-blur-xl transition focus:border-[#b99eab] focus:bg-white/75"
              />
            </div>

            {/* Bio */}

            <div>
              <label
                htmlFor="bio"
                className="font-body mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#675966]"
              >
                About You
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell your future self a little about you..."
                rows={5}
                className="font-body w-full resize-none rounded-2xl border border-white/80 bg-white/55 px-5 py-4 text-sm leading-6 text-[#4a3542] outline-none backdrop-blur-xl transition focus:border-[#b99eab] focus:bg-white/75"
              />
            </div>

            {/* Messages */}

            {error && (
              <div className="rounded-2xl border border-[#d9b4b4]/40 bg-[#f5e5e5]/70 px-5 py-4 font-body text-xs text-[#8b4a4a]">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-[#b9c8cf]/40 bg-[#e9f0f2]/70 px-5 py-4 font-body text-xs text-[#566d78]">
                {message}
              </div>
            )}

            {/* Save */}

            <div className="flex flex-col gap-3 border-t border-[#a88f9d]/10 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="rounded-full border border-white/80 bg-white/50 px-7 py-4 text-center font-body text-xs font-medium uppercase tracking-[0.15em] text-[#625362] transition hover:bg-white/80"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#4a3542] px-8 py-4 font-body text-xs font-medium uppercase tracking-[0.18em] text-white shadow-[0_15px_35px_rgba(74,53,66,0.18)] transition hover:-translate-y-0.5 hover:bg-[#624957] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Account section */}

        <section className="dashboard-card mt-5 rounded-[32px] p-6 sm:p-9">
          <p className="font-body text-[9px] tracking-[0.3em] text-[#9b7e8d]">
            ACCOUNT
          </p>

          <h2 className="font-heading mt-1 text-2xl text-[#4a3542]">
            Account settings
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/70 bg-white/40 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-heading text-lg text-[#51444f]">
                  Password
                </p>

                <p className="mt-1 font-body text-xs text-[#887985]">
                  Your password is securely managed by Supabase Auth.
                </p>
              </div>

              <span className="rounded-full border border-[#bdaab5]/25 bg-white/50 px-4 py-2 font-body text-[10px] text-[#776874]">
                Secured
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/70 bg-white/40 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-heading text-lg text-[#51444f]">
                  Email verification
                </p>

                <p className="mt-1 font-body text-xs text-[#887985]">
                  Your account uses email verification before registration is completed.
                </p>
              </div>

              <span className="rounded-full bg-[#e5eee9] px-4 py-2 font-body text-[10px] text-[#597263]">
                Verified account
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}

        <footer className="py-8 text-center">
          <p className="font-body text-[9px] tracking-[0.4em] text-[#9b8492]">
            HERE I AM · YOUR SPACE, YOUR STORY
          </p>
        </footer>
      </div>
    </main>
  );
}