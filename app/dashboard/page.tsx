"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeroScene from "@/app/components/HeroScene";
import { createClient } from "@/lib/supabase/client";

const features = [
  {
    number: "01",
    title: "Notes",
    description: "Capture thoughts, ideas, plans, and everything on your mind.",
    icon: "▤",
    href: "/dashboard/notes",
  },
  {
    number: "02",
    title: "Memories",
    description: "Keep your photos and videos together in your personal space.",
    icon: "▧",
    href: "/dashboard/memories",
  },
  {
    number: "03",
    title: "Reminders",
    description: "Keep track of the things you don't want to forget.",
    icon: "♧",
    href: "/dashboard/reminders",
  },
  {
    number: "04",
    title: "My CV",
    description: "Build and update your personal CV from your information.",
    icon: "▤",
    href: "/dashboard/cv",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("there");
  const [dailyThought, setDailyThought] = useState(
    "You are becoming someone your future self will be proud to meet."
  );
  const [loading, setLoading] = useState(true);
  const [thoughtLoading, setThoughtLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "there";

      setUserName(name);
      setLoading(false);

      try {
        const response = await fetch("/api/daily-thought");

        const data = await response.json();

        if (response.ok && data.thought) {
          setDailyThought(data.thought);
        }
      } catch (error) {
        console.error("Daily thought loading error:", error);
      } finally {
        setThoughtLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FCF8F7]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#BFCBD3] border-t-[#555E6A]" />

          <p className="mt-4 font-body text-sm text-[#889FAB]">
            Entering your universe...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FCF8F7] text-[#555E6A]">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-[#BFCBD3]/30 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#889FAB]/15 blur-[130px]" />

        <div className="absolute left-[40%] top-[30%] h-[300px] w-[300px] rounded-full bg-white/70 blur-[100px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-20 border-b border-[#889FAB]/15 bg-[#FCF8F7]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          {/* Logo */}
          <Link href="/dashboard" className="group">
            <h1 className="font-script text-3xl text-[#555E6A] transition group-hover:text-[#889FAB]">
              Here I Am
            </h1>

            <p className="mt-0.5 font-body text-[9px] tracking-[0.35em] text-[#889FAB]">
              YOUR PERSONAL UNIVERSE
            </p>
          </Link>

          {/* Navigation actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/search"
              className="rounded-full border border-[#889FAB]/25 bg-white/50 px-4 py-2.5 font-body text-xs font-medium text-[#555E6A] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
            >
              <span className="mr-2">⌕</span>
              Web Search
            </Link>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-full border border-[#889FAB]/20 bg-[#555E6A] px-4 py-2.5 font-body text-xs font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4b535f]"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Hero text */}
          <div className="relative z-10">
            <p className="font-script text-3xl text-[#889FAB] sm:text-4xl">
              Welcome,
            </p>

            <h2 className="font-heading mt-1 text-4xl font-semibold tracking-tight text-[#555E6A] sm:text-6xl">
              {userName}
            </h2>

            <p className="mt-5 max-w-xl font-body text-sm leading-7 text-[#889FAB] sm:text-base">
              Everything that matters to you, gathered into one personal
              space — your memories, thoughts, plans, and stories.
            </p>

            <Link
              href="/dashboard/memories"
              className="mt-7 inline-flex items-center rounded-full border border-[#889FAB]/25 bg-white/55 px-5 py-3 font-body text-xs font-semibold text-[#555E6A] shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/80"
            >
              View memories
              <span className="ml-3">→</span>
            </Link>

            {/* Small universe labels */}
            <div className="mt-10 flex items-center gap-7">
              <div>
                <p className="font-body text-[10px] tracking-[0.3em] text-[#889FAB]">
                  01
                </p>
                <p className="mt-1 font-heading text-sm text-[#555E6A]">
                  Your thoughts
                </p>
              </div>

              <div className="h-8 w-px bg-[#889FAB]/20" />

              <div>
                <p className="font-body text-[10px] tracking-[0.3em] text-[#889FAB]">
                  02
                </p>
                <p className="mt-1 font-heading text-sm text-[#555E6A]">
                  Your memories
                </p>
              </div>

              <div className="h-8 w-px bg-[#889FAB]/20" />

              <div>
                <p className="font-body text-[10px] tracking-[0.3em] text-[#889FAB]">
                  03
                </p>
                <p className="mt-1 font-heading text-sm text-[#555E6A]">
                  Your journey
                </p>
              </div>
            </div>
          </div>

          {/* Actual 3D universe */}
          <div className="relative -mt-5 lg:-mt-10">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative min-h-[285px] overflow-hidden rounded-[2rem] border border-white/90 bg-white/55 p-6 shadow-[0_20px_60px_rgba(85,94,106,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-white/75 hover:shadow-[0_28px_70px_rgba(85,94,106,0.14)]"
            >
              {/* Number */}
              <span className="absolute right-6 top-6 font-body text-[10px] tracking-[0.25em] text-[#889FAB]/70">
                {feature.number}
              </span>

              {/* Icon */}
              <div className="flex h-20 w-20 rotate-45 items-center justify-center rounded-[1.2rem] border border-[#889FAB]/20 bg-gradient-to-br from-[#D9D3D5]/60 to-[#BFCBD3]/30 shadow-[0_12px_35px_rgba(85,94,106,0.08)]">
                <span className="-rotate-45 text-2xl text-[#555E6A]">
                  {feature.icon}
                </span>
              </div>

              {/* Content */}
              <div className="mt-8">
                <h3 className="font-heading text-3xl text-[#555E6A]">
                  {feature.title}
                </h3>

                <p className="mt-3 max-w-[250px] font-body text-sm leading-6 text-[#889FAB]">
                  {feature.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#889FAB]/25 bg-white/50 text-[#555E6A] transition group-hover:translate-x-1 group-hover:bg-white">
                →
              </div>

              {/* Decorative crystal */}
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rotate-45 rounded-2xl border border-[#889FAB]/10 bg-[#BFCBD3]/10 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Thought */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#889FAB]/20 bg-white/55 px-7 py-10 shadow-[0_25px_70px_rgba(85,94,106,0.08)] backdrop-blur-2xl sm:px-12 sm:py-12">
          {/* Decorative sparkle */}
          <div className="pointer-events-none absolute right-10 top-[-8px] text-5xl text-[#889FAB]/25">
            ✦
          </div>

          {/* Decorative crystal */}
          <div className="pointer-events-none absolute bottom-[-18px] left-[-8px] h-12 w-12 rotate-45 border-2 border-[#889FAB]/20" />

          <div className="relative z-10">
            <p className="font-body text-[10px] font-medium tracking-[0.4em] text-[#889FAB]">
              A THOUGHT FOR TODAY
            </p>

            <div className="mt-5 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <blockquote className="max-w-4xl border-l-2 border-[#889FAB]/20 pl-7 font-heading text-2xl leading-relaxed text-[#555E6A] sm:text-3xl lg:text-4xl">
                {thoughtLoading ? (
                  <span className="inline-flex items-center gap-3 text-[#889FAB]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#889FAB]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#889FAB] [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#889FAB] [animation-delay:300ms]" />
                  </span>
                ) : (
                  `“${dailyThought}”`
                )}
              </blockquote>

              <p className="shrink-0 font-script text-2xl text-[#889FAB] sm:text-3xl">
                — your space, your story
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-5 pb-8 pt-2 text-center">
        <p className="font-body text-[10px] tracking-[0.35em] text-[#889FAB]">
          HERE I AM · YOUR SPACE, YOUR STORY
        </p>
      </footer>
    </main>
  );
}