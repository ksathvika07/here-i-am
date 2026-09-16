import Link from "next/link";
import HeroScene from "./components/HeroScene";

export default function Home() {
  return (
    <main className="app-background min-h-screen px-6 py-12">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center text-center">

        <p className="font-body mb-4 text-sm uppercase tracking-[0.35em]">
          Welcome to
        </p>

        <h1 className="font-heading text-6xl font-medium tracking-tight sm:text-7xl md:text-8xl">
          Here I Am
        </h1>

        <p className="font-script mt-5 text-4xl sm:text-5xl">
          your space, your story
        </p>

        <HeroScene />

        <p className="font-body max-w-xl text-sm leading-7 tracking-wide sm:text-base">
          A personal space to keep your memories, thoughts, goals, reminders,
          and everything that makes you who you are.
        </p>

        <Link
          href="/auth"
          className="font-body mt-8 inline-block rounded-full px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] transition-transform duration-300 hover:scale-105"
          style={{
            backgroundColor: "var(--dark)",
            color: "var(--white)",
          }}
        >
          Enter Your Space
        </Link>

      </div>
    </main>
  );
}