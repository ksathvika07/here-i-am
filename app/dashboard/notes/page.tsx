"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const supabase = createClient();

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setNotes(data || []);
    }

    setLoading(false);
  }

  async function createNote() {
    if (!userId) return;

    setMessage("");
    setError("");

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setNotes((current) => [data, ...current]);
      setTitle("");
      setContent("");
      setMessage("Note saved.");
    }

    setSaving(false);
  }

  function startEditing(note: Note) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setMessage("");
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  }

  async function updateNote(id: string) {
    setMessage("");
    setError("");

    if (!editTitle.trim()) {
      setError("Please enter a title.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("notes")
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setNotes((current) =>
        current.map((note) =>
          note.id === id ? data : note
        )
      );

      cancelEditing();
      setMessage("Note updated.");
    }

    setSaving(false);
  }

  async function deleteNote(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setNotes((current) =>
        current.filter((note) => note.id !== id)
      );
      setMessage("Note deleted.");
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="app-background min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-4">
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
              backgroundColor: "rgba(255,255,255,0.55)",
              borderColor: "rgba(136,159,171,0.22)",
              color: "var(--dark)",
            }}
          >
            ← Dashboard
          </Link>
        </header>

        {/* TITLE */}
        <section className="mt-10">
          <p
            className="font-body text-[10px] uppercase tracking-[0.35em]"
            style={{ color: "var(--blue-gray)" }}
          >
            Your thoughts
          </p>

          <h1
            className="font-heading mt-3 text-5xl font-medium sm:text-6xl"
            style={{ color: "var(--dark)" }}
          >
            Notes
          </h1>

          <p
            className="font-body mt-4 max-w-xl text-sm leading-7"
            style={{ color: "var(--dark)" }}
          >
            A quiet place for your thoughts, ideas, plans,
            reminders, and everything you want to remember.
          </p>
        </section>

        {/* CREATE NOTE */}
        <section
          className="relative mt-10 overflow-hidden rounded-[2rem] border p-6 sm:p-8"
          style={{
            backgroundColor: "rgba(255,255,255,0.5)",
            borderColor: "rgba(136,159,171,0.2)",
            boxShadow:
              "0 20px 60px rgba(85,94,106,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl"
            style={{
              backgroundColor:
                "rgba(191,203,211,0.25)",
            }}
          />

          <div className="relative">
            <p
              className="font-body text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "var(--blue-gray)" }}
            >
              Create something
            </p>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your note a title..."
              className="font-heading mt-5 w-full border-b bg-transparent pb-3 text-2xl outline-none sm:text-3xl"
              style={{
                borderColor:
                  "rgba(136,159,171,0.22)",
                color: "var(--dark)",
              }}
            />

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write whatever is on your mind..."
              rows={6}
              className="font-body mt-5 w-full resize-none rounded-2xl border p-4 text-sm leading-7 outline-none"
              style={{
                backgroundColor:
                  "rgba(255,255,255,0.45)",
                borderColor:
                  "rgba(136,159,171,0.18)",
                color: "var(--dark)",
              }}
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

              <p
                className="font-body text-xs"
                style={{ color: "var(--blue-gray)" }}
              >
                Your note is private to your account.
              </p>

              <button
                type="button"
                onClick={createNote}
                disabled={saving}
                className="font-body rounded-full px-7 py-3.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                style={{
                  backgroundColor: "var(--dark)",
                  color: "var(--white)",
                }}
              >
                {saving ? "Saving..." : "Save Note →"}
              </button>
            </div>
          </div>
        </section>

        {/* MESSAGES */}
        {error && (
          <div
            className="font-body mt-5 rounded-2xl border px-5 py-4 text-sm"
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
            className="font-body mt-5 rounded-2xl border px-5 py-4 text-sm"
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

        {/* NOTES */}
        <section className="mt-12 pb-10">

          <div className="mb-6 flex items-end justify-between">
            <div>
              <p
                className="font-body text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "var(--blue-gray)" }}
              >
                Saved thoughts
              </p>

              <h2
                className="font-heading mt-2 text-3xl"
                style={{ color: "var(--dark)" }}
              >
                Your notes
              </h2>
            </div>

            <p
              className="font-body text-xs"
              style={{ color: "var(--blue-gray)" }}
            >
              {notes.length}{" "}
              {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div
              className="rounded-[2rem] border p-10 text-center"
              style={{
                backgroundColor:
                  "rgba(255,255,255,0.42)",
                borderColor:
                  "rgba(136,159,171,0.18)",
              }}
            >
              <p
                className="font-script text-3xl"
                style={{ color: "var(--blue-gray)" }}
              >
                Loading your thoughts...
              </p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && notes.length === 0 && (
            <div
              className="rounded-[2rem] border p-12 text-center"
              style={{
                backgroundColor:
                  "rgba(255,255,255,0.42)",
                borderColor:
                  "rgba(136,159,171,0.18)",
              }}
            >
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
                style={{
                  backgroundColor:
                    "rgba(191,203,211,0.3)",
                  color: "var(--dark)",
                }}
              >
                ✦
              </div>

              <h3
                className="font-heading mt-5 text-2xl"
                style={{ color: "var(--dark)" }}
              >
                Nothing here yet
              </h3>

              <p
                className="font-body mx-auto mt-3 max-w-md text-sm leading-6"
                style={{ color: "var(--blue-gray)" }}
              >
                Your first thought is waiting to be written.
              </p>
            </div>
          )}

          {/* NOTE GRID */}
          {!loading && notes.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">

              {notes.map((note) => (
                <article
                  key={note.id}
                  className="group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                  }}
                >

                  {/* DECORATIVE GLOW */}
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      backgroundColor:
                        "rgba(191,203,211,0.35)",
                    }}
                  />

                  {editingId === note.id ? (
                    /* EDIT MODE */
                    <div className="relative">

                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(event.target.value)
                        }
                        className="font-heading w-full border-b bg-transparent pb-3 text-2xl outline-none"
                        style={{
                          borderColor:
                            "rgba(136,159,171,0.22)",
                          color: "var(--dark)",
                        }}
                      />

                      <textarea
                        value={editContent}
                        onChange={(event) =>
                          setEditContent(event.target.value)
                        }
                        rows={7}
                        className="font-body mt-5 w-full resize-none rounded-2xl border p-4 text-sm leading-7 outline-none"
                        style={{
                          backgroundColor:
                            "rgba(255,255,255,0.45)",
                          borderColor:
                            "rgba(136,159,171,0.18)",
                          color: "var(--dark)",
                        }}
                      />

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateNote(note.id)
                          }
                          disabled={saving}
                          className="font-body rounded-full px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] disabled:opacity-50"
                          style={{
                            backgroundColor:
                              "var(--dark)",
                            color: "var(--white)",
                          }}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="font-body rounded-full border px-5 py-3 text-xs font-medium uppercase tracking-[0.12em]"
                          style={{
                            borderColor:
                              "rgba(136,159,171,0.25)",
                            color: "var(--dark)",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE */
                    <div className="relative">

                      <div className="flex items-start justify-between gap-4">

                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
                          style={{
                            backgroundColor:
                              "rgba(191,203,211,0.32)",
                            color: "var(--dark)",
                          }}
                        >
                          ✦
                        </div>

                        <p
                          className="font-body text-[9px] uppercase tracking-[0.15em]"
                          style={{
                            color:
                              "rgba(136,159,171,0.7)",
                          }}
                        >
                          {formatDate(note.updated_at)}
                        </p>
                      </div>

                      <h3
                        className="font-heading mt-6 break-words text-2xl"
                        style={{ color: "var(--dark)" }}
                      >
                        {note.title}
                      </h3>

                      <p
                        className="font-body mt-4 whitespace-pre-wrap break-words text-sm leading-7"
                        style={{
                          color: "var(--blue-gray)",
                        }}
                      >
                        {note.content || "No content."}
                      </p>

                      <div
                        className="mt-7 flex gap-3 border-t pt-5"
                        style={{
                          borderColor:
                            "rgba(136,159,171,0.14)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            startEditing(note)
                          }
                          className="font-body rounded-full border px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-transform duration-300 hover:-translate-y-0.5"
                          style={{
                            borderColor:
                              "rgba(136,159,171,0.22)",
                            color: "var(--dark)",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteNote(note.id)
                          }
                          className="font-body rounded-full border px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-transform duration-300 hover:-translate-y-0.5"
                          style={{
                            borderColor:
                              "rgba(180,100,100,0.18)",
                            color: "#8B4A4A",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}

            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer
          className="pb-6 text-center"
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