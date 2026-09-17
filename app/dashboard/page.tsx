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
    icon: "◷",
    href: "/dashboard/reminders",
  },
  {
    number: "04",
    title: "My CV",
    description: "Build and update your personal CV from your information.",
    icon: "▥",
    href: "/dashboard/cv",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");

  const [dailyThought, setDailyThought] = useState(
    "You are becoming someone your future self will be proud to meet."
  );

  const [loading, setLoading] = useState(true);
  const [thoughtLoading, setThoughtLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const [quoteTilt, setQuoteTilt] = useState({
    x: 0,
    y: 0,
  });

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
      setUserEmail(user.email || "");
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

  const handleQuotePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = ((y / rect.height) - 0.5) * -8;

    setQuoteTilt({
      x: rotateX,
      y: rotateY,
    });
  };

  const resetQuoteTilt = () => {
    setQuoteTilt({
      x: 0,
      y: 0,
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7efef]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d8c3cb] border-t-[#4a3542]" />

          <p className="mt-4 font-body text-sm text-[#8b7783]">
            Entering your universe...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-background min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      {/* Atmospheric background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="decorative-orb floating-glow left-[10%] top-[12%] h-40 w-40 bg-[#efc8bd]/25 blur-3xl" />

        <div
          className="decorative-orb floating-glow right-[8%] top-[22%] h-64 w-64 bg-[#c9becf]/25 blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />

        <div
          className="decorative-orb floating-glow bottom-[10%] right-[30%] h-52 w-52 bg-[#c5d0d5]/25 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px]">
        {/* Top bar */}

        <header className="relative z-50 mb-5 flex items-center justify-between rounded-[24px] border border-white/70 bg-white/35 px-5 py-3 shadow-[0_15px_45px_rgba(74,53,66,0.06)] backdrop-blur-xl sm:px-7">
          <div>
            <p className="font-body text-[9px] tracking-[0.35em] text-[#8c7785]">
              YOUR PERSONAL UNIVERSE
            </p>

            <p className="font-heading text-xl text-[#4a3542]">
              A little space for everything that matters.
            </p>
          </div>

          <div className="relative z-[100] flex items-center gap-3">
            <Link
              href="/dashboard/search"
              className="hidden rounded-full border border-white/80 bg-white/60 px-5 py-3 font-body text-xs font-medium text-[#554653] shadow-sm transition hover:-translate-y-0.5 hover:bg-white sm:block"
            >
              ⌕ &nbsp; Search anything
            </Link>

            {/* Profile menu */}

            <div className="relative z-[100]">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="relative z-[100] flex items-center gap-3 rounded-full transition hover:opacity-80"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[#d7c8d0] font-heading text-sm text-[#4a3542] shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <span className="hidden font-body text-xs text-[#554653] md:block">
                  {userName}
                </span>
              </button>

              {profileOpen && (
                <div className="pointer-events-auto absolute right-0 top-14 z-[999] w-64 overflow-hidden rounded-[24px] border border-white/80 bg-[#fffaf9]/95 p-2 shadow-[0_25px_70px_rgba(74,53,66,0.18)] backdrop-blur-2xl">
                  <div className="border-b border-[#a88f9d]/10 px-4 py-3">
                    <p className="font-heading text-base text-[#4a3542]">
                      {userName}
                    </p>

                    <p className="mt-1 truncate font-body text-[10px] text-[#927f8a]">
                      {userEmail}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 font-body text-xs text-[#554653] transition hover:bg-[#f4e8e7]"
                  >
                    <span className="text-base">⚙</span>
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 font-body text-xs text-[#554653] transition hover:bg-[#f4e8e7]"
                  >
                    <span className="text-base">✦</span>
                    <span>My Profile</span>
                  </Link>

                  <div className="my-1 border-t border-[#a88f9d]/10" />

                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-body text-xs text-[#8b4a4a] transition hover:bg-[#f7e9e8]"
                    >
                      <span className="text-base">↪</span>
                      <span>Log Out</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Logout */}

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-full bg-[#4a3542] px-5 py-3 font-body text-xs font-medium text-white shadow-[0_10px_25px_rgba(74,53,66,0.18)] transition hover:-translate-y-0.5 hover:bg-[#624957]"
              >
                Log Out
              </button>
            </form>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main column */}

          <div className="min-w-0 space-y-5">
            {/* Hero */}

            <section className="dashboard-hero min-h-[500px] rounded-[34px] px-6 py-7 sm:px-10 sm:py-9">
              <div className="absolute right-[-60px] top-[-80px] h-72 w-72 rounded-full bg-[#efc8bd]/20 blur-3xl" />

              <div className="absolute bottom-[-90px] left-[30%] h-72 w-72 rounded-full bg-[#c9becf]/20 blur-3xl" />

              <div className="relative z-10 grid h-full items-center lg:grid-cols-[0.72fr_1.28fr]">
                {/* Greeting */}

                <div className="relative z-20 pb-4 lg:pb-0">
                  <p className="font-script text-4xl text-[#876d7e] sm:text-5xl">
                    Good Morning,
                  </p>

                  <h1 className="font-heading mt-1 text-5xl font-medium tracking-tight text-[#3e3440] sm:text-6xl xl:text-7xl">
                    {userName}
                    <span className="ml-2 text-[#b88788]">✦</span>
                  </h1>

                  <p className="mt-5 max-w-md font-body text-sm leading-7 text-[#786c76] sm:text-base">
                    A little progress each day adds up to big results.
                  </p>

                  <div className="mt-7 max-w-md rounded-[22px] border border-white/75 bg-white/45 px-5 py-4 shadow-[0_18px_50px_rgba(74,53,66,0.07)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-[#bd8d8d]">✦</span>

                      <p className="font-heading text-base leading-6 text-[#51444f]">
                        You are closer to your dreams than you think.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Existing 3D scene */}

                <div className="relative -my-8 min-h-[420px] lg:-my-2">
                  <HeroScene />

                  {/* Interactive floating quote */}

                  <div
                    className="interactive-quote absolute right-[5%] top-[15%] z-20 hidden w-[155px] rounded-[28px] border border-white/80 bg-white/35 px-5 py-6 shadow-[0_25px_70px_rgba(74,53,66,0.12)] backdrop-blur-2xl xl:block"
                    onPointerMove={handleQuotePointerMove}
                    onPointerLeave={resetQuoteTilt}
                    style={{
                      transform: `perspective(900px) rotateX(${quoteTilt.x}deg) rotateY(${quoteTilt.y}deg) translateZ(0)`,
                    }}
                  >
                    <div className="interactive-quote-glow pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#efc8bd]/30 blur-2xl" />

                    <div className="interactive-quote-content relative z-10">
                      <p className="font-script text-3xl leading-9 text-[#765d6e]">
                        Small
                        <br />
                        Steps
                        <br />
                        Big
                        <br />
                        Changes
                      </p>

                      <div className="mt-4 h-px w-10 bg-[#a98f9e]/40" />

                      <p className="mt-3 font-body text-[8px] uppercase tracking-[0.18em] text-[#927c89]">
                        Move your cursor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature cards */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="dashboard-card group min-h-[235px] p-5 sm:p-6"
                >
                  <span className="absolute right-5 top-5 font-body text-[9px] tracking-[0.25em] text-[#9a8793]">
                    {feature.number}
                  </span>

                  <div className="flex h-16 w-16 rotate-45 items-center justify-center rounded-[17px] border border-white/80 bg-gradient-to-br from-[#eadcdf]/75 to-[#c9becf]/35 shadow-[0_12px_30px_rgba(74,53,66,0.08)]">
                    <span className="-rotate-45 text-xl text-[#645564]">
                      {feature.icon}
                    </span>
                  </div>

                  <div className="mt-8">
                    <h2 className="font-heading text-2xl text-[#4a3d48]">
                      {feature.title}
                    </h2>

                    <p className="mt-2 font-body text-xs leading-5 text-[#877985]">
                      {feature.description}
                    </p>
                  </div>

                  <div className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#bdaab5]/35 bg-white/45 text-[#625362] transition group-hover:translate-x-1 group-hover:bg-white/75">
                    →
                  </div>
                </Link>
              ))}
            </section>

            {/* Daily thought */}

            <section className="dashboard-card relative min-h-[230px] rounded-[30px] px-6 py-7 sm:px-9 sm:py-8">
              <div className="pointer-events-none absolute right-8 top-4 text-5xl text-[#bd9aa5]/30">
                ✦
              </div>

              <div className="pointer-events-none absolute bottom-[-25px] left-[-15px] h-16 w-16 rotate-45 rounded-2xl border border-[#bd9aa5]/20" />

              <p className="font-body text-[9px] font-medium tracking-[0.4em] text-[#9b7e8d]">
                A THOUGHT FOR TODAY
              </p>

              <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <blockquote className="max-w-4xl border-l-2 border-[#bd9aa5]/25 pl-6 font-heading text-2xl leading-relaxed text-[#50434e] sm:text-3xl">
                  {thoughtLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#bd9aa5]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#bd9aa5]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#bd9aa5]" />
                    </span>
                  ) : (
                    `“${dailyThought}”`
                  )}
                </blockquote>

                <p className="font-script text-2xl text-[#957b89]">
                  You are enough
                </p>
              </div>
            </section>

            {/* Recent Activity */}

            <section className="dashboard-card rounded-[30px] px-6 py-7 sm:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[9px] tracking-[0.35em] text-[#9b7e8d]">
                    YOUR SPACE
                  </p>

                  <h2 className="font-heading mt-1 text-2xl text-[#4a3d48]">
                    Recent Activity
                  </h2>
                </div>

                <span className="font-body text-xs text-[#9a8793]">
                  Your universe
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link
                  href="/dashboard/notes"
                  className="rounded-2xl border border-white/75 bg-white/40 p-4 transition hover:bg-white/65"
                >
                  <p className="font-body text-[9px] tracking-[0.2em] text-[#9b7e8d]">
                    NOTES
                  </p>

                  <p className="mt-2 font-heading text-lg text-[#51444f]">
                    Capture your thoughts
                  </p>
                </Link>

                <Link
                  href="/dashboard/memories"
                  className="rounded-2xl border border-white/75 bg-white/40 p-4 transition hover:bg-white/65"
                >
                  <p className="font-body text-[9px] tracking-[0.2em] text-[#9b7e8d]">
                    MEMORIES
                  </p>

                  <p className="mt-2 font-heading text-lg text-[#51444f]">
                    Keep your moments
                  </p>
                </Link>

                <Link
                  href="/dashboard/reminders"
                  className="rounded-2xl border border-white/75 bg-white/40 p-4 transition hover:bg-white/65"
                >
                  <p className="font-body text-[9px] tracking-[0.2em] text-[#9b7e8d]">
                    REMINDERS
                  </p>

                  <p className="mt-2 font-heading text-lg text-[#51444f]">
                    Stay on track
                  </p>
                </Link>
              </div>
            </section>
          </div>

          {/* Right utility column */}

          <aside className="space-y-5">
            {/* Calendar */}

            <section className="glass-soft rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/45 text-[#675663]">
                  ‹
                </button>

                <h2 className="font-heading text-lg text-[#4d404a]">
                  September 2026
                </h2>

                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/45 text-[#675663]">
                  ›
                </button>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-y-4 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map(
                  (day, index) => (
                    <span
                      key={`${day}-${index}`}
                      className="font-body text-[9px] text-[#a18d98]"
                    >
                      {day}
                    </span>
                  )
                )}

                {Array.from({ length: 30 }, (_, index) => {
                  const day = index + 1;

                  return (
                    <span
                      key={day}
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full font-body text-[10px] ${
                        day === 16
                          ? "bg-[#e9b7a9] text-[#4a3542] shadow-sm"
                          : "text-[#675966]"
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </section>

            {/* Today */}

            <section className="glass-soft rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl text-[#4d404a]">
                  Today
                </h2>

                <span className="font-body text-[10px] text-[#a18d98]">
                  Your space
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Continue your project",
                  "Review your notes",
                  "Take a short break",
                  "Work on your goals",
                ].map((task) => (
                  <div
                    key={task}
                    className="flex items-center gap-3 border-b border-[#a88f9d]/10 pb-3"
                  >
                    <span className="h-5 w-5 rounded-full border border-[#bdaab5]/55" />

                    <span className="font-body text-xs text-[#685b66]">
                      {task}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard/reminders"
                className="mt-5 flex items-center justify-center rounded-full border border-white/80 bg-white/50 px-4 py-3 font-body text-xs text-[#625362] transition hover:bg-white/80"
              >
                + &nbsp; Add a reminder
              </Link>
            </section>

            {/* Focus Mode */}

            <section className="overflow-hidden rounded-[30px] border border-white/75 bg-gradient-to-br from-[#665263] to-[#4a3542] p-5 text-white shadow-[0_25px_60px_rgba(74,53,66,0.18)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#efc8bd] to-[#b99eb0] text-2xl text-[#4a3542]">
                  ◐
                </div>

                <div>
                  <p className="font-body text-[9px] tracking-[0.25em] text-white/45">
                    FOCUS MODE
                  </p>

                  <h2 className="font-heading mt-1 text-xl">
                    Your quiet space
                  </h2>
                </div>
              </div>

              <p className="mt-5 font-script text-3xl text-white/80">
                Breathe. Focus. Create.
              </p>

              <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[58%] rounded-full bg-[#e9b7a9]" />
              </div>

              <div className="mt-4 flex items-center justify-between text-white/45">
                <span className="font-body text-[9px]">
                  A moment for you
                </span>

                <span className="text-xl text-white">▶</span>
              </div>
            </section>
          </aside>
        </div>

        <footer className="py-7 text-center">
          <p className="font-body text-[9px] tracking-[0.4em] text-[#9b8492]">
            HERE I AM · YOUR SPACE, YOUR STORY
          </p>
        </footer>
      </div>
    </main>
  );
}