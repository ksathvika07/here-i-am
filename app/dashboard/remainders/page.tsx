"use client";

import Link from "next/link";

export default function RemindersPage() {
  return (
    <main className="app-background min-h-screen px-5 py-10">
      <div className="mx-auto max-w-5xl">

        <header className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-script text-4xl"
            style={{ color: "var(--dark)" }}
          >
            Here I Am
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border px-5 py-3 text-sm"
            style={{
              borderColor: "rgba(136,159,171,0.25)",
              backgroundColor: "rgba(255,255,255,0.55)",
              color: "var(--dark)",
            }}
          >
            ← Dashboard
          </Link>
        </header>

        <section className="mt-16">
          <p
            className="font-body text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--blue-gray)" }}
          >
            Stay on track
          </p>

          <h1
            className="font-heading mt-4 text-6xl"
            style={{ color: "var(--dark)" }}
          >
            Reminders
          </h1>

          <p
            className="font-body mt-5 text-sm"
            style={{ color: "var(--blue-gray)" }}
          >
            Your reminders page is working.
          </p>
        </section>

      </div>
    </main>
  );
}