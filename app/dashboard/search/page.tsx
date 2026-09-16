"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SearchResult = {
  title: string;
  url: string;
  content: string;
};

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      setUserEmail(user.email ?? "");
    };

    checkUser();
  }, [router]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter something to search.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setResults([]);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmedQuery,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to search the web right now."
        );
      }

      setResults(data.results ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while searching."
      );
    } finally {
      setLoading(false);
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <main className="min-h-screen bg-[#FCF8F7] text-[#555E6A]">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#BFCBD3]/30 blur-3xl" />

        <div className="absolute right-[-100px] top-[45%] h-80 w-80 rounded-full bg-[#D9D3D5]/45 blur-3xl" />

        <div className="absolute bottom-[-120px] left-[35%] h-72 w-72 rounded-full bg-[#889FAB]/15 blur-3xl" />

        {/* Floating crystal shapes */}
        <div className="absolute left-[8%] top-[28%] h-5 w-5 rotate-45 rounded-sm border border-[#889FAB]/30 bg-[#BFCBD3]/30" />

        <div className="absolute right-[12%] top-[20%] h-7 w-7 rotate-45 rounded-sm border border-[#889FAB]/25 bg-white/30" />

        <div className="absolute bottom-[20%] right-[8%] h-4 w-4 rotate-45 rounded-sm border border-[#555E6A]/15 bg-[#BFCBD3]/30" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-[#889FAB]/20 bg-[#FCF8F7]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/dashboard"
            className="font-heading text-2xl font-semibold tracking-wide text-[#555E6A]"
          >
            Here I Am
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-xs text-[#889FAB] sm:block">
              {userEmail}
            </span>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#889FAB]/30 bg-white/55 px-4 py-2 text-sm font-medium text-[#555E6A] shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/80"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-script text-3xl text-[#889FAB]">
            explore the world
          </p>

          <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-[#555E6A] sm:text-6xl">
            Web Search
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#889FAB] sm:text-base">
            Search the web without leaving your personal space.
            Discover articles, resources, ideas, tutorials, and more.
          </p>
        </div>

        {/* Search area */}
        <div className="mx-auto mt-10 max-w-4xl">
          <form onSubmit={handleSearch}>
            <div className="rounded-[2rem] border border-white/80 bg-white/55 p-2 shadow-[0_25px_70px_rgba(85,94,106,0.12)] backdrop-blur-2xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 items-center rounded-[1.5rem] border border-[#889FAB]/20 bg-[#FCF8F7]/70 px-5">
                  <span className="mr-3 text-xl">⌕</span>

                  <input
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="What would you like to search?"
                    className="h-14 w-full bg-transparent text-sm text-[#555E6A] outline-none placeholder:text-[#889FAB]/70 sm:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 rounded-[1.5rem] bg-[#555E6A] px-7 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4b535f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-2xl border border-[#889FAB]/20 bg-white/60 px-5 py-4 text-sm text-[#555E6A] shadow-sm backdrop-blur-xl">
              {error}
            </div>
          )}
        </div>

        {/* Decorative orb */}
        {!searched && (
          <div className="mx-auto mt-14 flex justify-center">
            <div className="relative h-44 w-44">
              <div className="absolute inset-5 rounded-full border border-[#889FAB]/30" />

              <div className="absolute inset-9 rounded-full border border-[#BFCBD3]/70 bg-[#BFCBD3]/25 shadow-[0_0_60px_rgba(136,159,171,0.18)] backdrop-blur-xl" />

              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.9)]" />

              <div className="absolute left-2 top-12 h-3 w-3 rotate-45 border border-[#889FAB]/40 bg-[#889FAB]/20" />

              <div className="absolute bottom-8 right-2 h-4 w-4 rotate-45 border border-[#889FAB]/30 bg-[#D9D3D5]/40" />

              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-[#889FAB]/20" />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mx-auto mt-12 max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#889FAB]/20 bg-white/60 shadow-lg backdrop-blur-xl">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#BFCBD3] border-t-[#555E6A]" />
            </div>

            <p className="mt-4 text-sm text-[#889FAB]">
              Searching the web...
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <div className="mt-12">
            {results.length > 0 ? (
              <>
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#889FAB]">
                      Search results
                    </p>

                    <h2 className="font-heading mt-1 text-2xl font-semibold text-[#555E6A]">
                      Results for “{query}”
                    </h2>
                  </div>

                  <span className="hidden rounded-full border border-[#889FAB]/20 bg-white/55 px-4 py-2 text-xs text-[#889FAB] sm:block">
                    {results.length} results
                  </span>
                </div>

                <div className="space-y-5">
                  {results.map((result, index) => (
                    <article
                      key={`${result.url}-${index}`}
                      className="group rounded-[1.75rem] border border-white/80 bg-white/55 p-6 shadow-[0_20px_60px_rgba(85,94,106,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-[0_25px_70px_rgba(85,94,106,0.13)]"
                    >
                      <div className="flex gap-4">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#889FAB]/20 bg-[#BFCBD3]/20 text-lg sm:flex">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[#889FAB]">
                            {getDomain(result.url)}
                          </p>

                          <h3 className="font-heading mt-1 text-xl font-semibold leading-snug text-[#555E6A] transition group-hover:text-[#4b535f]">
                            {result.title}
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-[#889FAB]">
                            {result.content}
                          </p>

                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center rounded-full border border-[#889FAB]/25 bg-[#FCF8F7]/70 px-5 py-2.5 text-xs font-semibold text-[#555E6A] transition hover:bg-white"
                          >
                            Open Result
                            <span className="ml-2 transition-transform group-hover:translate-x-1">
                              →
                            </span>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/80 bg-white/55 p-10 text-center shadow-[0_20px_60px_rgba(85,94,106,0.08)] backdrop-blur-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#BFCBD3]/25 text-3xl">
                  ⌕
                </div>

                <h2 className="font-heading mt-5 text-2xl font-semibold text-[#555E6A]">
                  No results found
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#889FAB]">
                  Try using different or more specific search words.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#889FAB]/15 px-5 py-8 text-center">
        <p className="font-script text-2xl text-[#889FAB]">
          here, in your own little universe.
        </p>

        <p className="mt-2 text-xs text-[#889FAB]/70">
          Here I Am · Web Search
        </p>
      </footer>
    </main>
  );
}