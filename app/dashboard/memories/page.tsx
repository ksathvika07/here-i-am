"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Memory = {
  name: string;
  path: string;
  url: string;
  type: "image" | "video";
  createdAt: string;
};

const supabase = createClient();

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function MemoriesPage() {
  const router = useRouter();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
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

    const { data, error } = await supabase.storage
      .from("memories")
      .list(user.id, {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const files = (data || []).filter(
      (file) => file.name !== ".emptyFolderPlaceholder"
    );

    const memoryItems = await Promise.all(
      files.map(async (file) => {
        const path = `${user.id}/${file.name}`;

        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("memories")
            .createSignedUrl(path, 60 * 60);

        if (signedError || !signedData?.signedUrl) {
          return null;
        }

        const mimeType =
          file.metadata?.mimetype ||
          "";

        const type = mimeType.startsWith("video/")
          ? "video"
          : "image";

        return {
          name: file.name,
          path,
          url: signedData.signedUrl,
          type,
          createdAt: file.created_at || new Date().toISOString(),
        } as Memory;
      })
    );

    setMemories(
      memoryItems.filter(
        (item): item is Memory => item !== null
      )
    );

    setLoading(false);
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files || files.length === 0 || !userId) {
      return;
    }

    setMessage("");
    setError("");
    setUploading(true);

    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      if (
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/")
      ) {
        setError(
          `"${file.name}" is not an image or video.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `"${file.name}" is larger than 50 MB.`
        );
        continue;
      }

      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

      const filePath = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}-${safeName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("memories")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        setError(
          `Could not upload "${file.name}": ${uploadError.message}`
        );
        continue;
      }

      uploadedCount++;
    }

    if (uploadedCount > 0) {
      setMessage(
        uploadedCount === 1
          ? "Memory uploaded successfully."
          : `${uploadedCount} memories uploaded successfully.`
      );

      await loadMemories();
    }

    event.target.value = "";
    setUploading(false);
  }

  async function deleteMemory(memory: Memory) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this memory?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const { error: deleteError } =
      await supabase.storage
        .from("memories")
        .remove([memory.path]);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMemories((current) =>
      current.filter(
        (item) => item.path !== memory.path
      )
    );

    setMessage("Memory deleted.");
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
      <div className="mx-auto max-w-7xl">

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

        {/* INTRO */}
        <section className="mt-10">
          <p
            className="font-body text-[10px] uppercase tracking-[0.35em]"
            style={{ color: "var(--blue-gray)" }}
          >
            Your memories
          </p>

          <h1
            className="font-heading mt-3 text-5xl font-medium sm:text-6xl"
            style={{ color: "var(--dark)" }}
          >
            Memories
          </h1>

          <p
            className="font-body mt-4 max-w-2xl text-sm leading-7"
            style={{ color: "var(--dark)" }}
          >
            Keep the moments that matter to you.
            photos,videos, little memories, and pieces of your story.
          </p>
        </section>

        {/* UPLOAD AREA */}
        <section
          className="relative mt-10 overflow-hidden rounded-[2rem] border p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(191,203,211,0.22))",
            borderColor: "rgba(136,159,171,0.2)",
            boxShadow:
              "0 20px 60px rgba(85,94,106,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
          }}
        >
          {/* DECORATIVE GLOW */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
            style={{
              backgroundColor:
                "rgba(191,203,211,0.3)",
            }}
          />

          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">

            <div>
              <p
                className="font-body text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "var(--blue-gray)" }}
              >
                Add a memory
              </p>

              <h2
                className="font-heading mt-3 text-3xl"
                style={{ color: "var(--dark)" }}
              >
                Save a moment
              </h2>

              <p
                className="font-body mt-2 max-w-lg text-sm leading-6"
                style={{ color: "var(--blue-gray)" }}
              >
                Upload photos or videos from your device.
                Each file can be up to 50 MB.
              </p>
            </div>

            {/* UPLOAD BUTTON */}
            <label
              className={`font-body flex shrink-0 cursor-pointer items-center gap-3 rounded-full px-7 py-4 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                uploading
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
              style={{
                backgroundColor: "var(--dark)",
                color: "var(--white)",
                boxShadow:
                  "0 12px 30px rgba(85,94,106,0.18)",
              }}
            >
              <span className="text-lg">＋</span>

              {uploading
                ? "Uploading..."
                : "Upload memories"}

              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
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

        {/* GALLERY */}
        <section className="mt-12 pb-10">

          <div className="mb-6 flex items-end justify-between">
            <div>
              <p
                className="font-body text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "var(--blue-gray)" }}
              >
                Your collection
              </p>

              <h2
                className="font-heading mt-2 text-3xl"
                style={{ color: "var(--dark)" }}
              >
                Saved memories
              </h2>
            </div>

            <p
              className="font-body text-xs"
              style={{ color: "var(--blue-gray)" }}
            >
              {memories.length}{" "}
              {memories.length === 1
                ? "memory"
                : "memories"}
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div
              className="rounded-[2rem] border p-12 text-center"
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
                Loading your memories...
              </p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && memories.length === 0 && (
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
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] text-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(191,203,211,0.4), rgba(217,211,213,0.35))",
                  color: "var(--dark)",
                  boxShadow:
                    "0 12px 30px rgba(136,159,171,0.1)",
                }}
              >
                ▧
              </div>

              <h3
                className="font-heading mt-6 text-2xl"
                style={{ color: "var(--dark)" }}
              >
                Your memories will live here
              </h3>

              <p
                className="font-body mx-auto mt-3 max-w-md text-sm leading-6"
                style={{ color: "var(--blue-gray)" }}
              >
                Upload your first photo or video and start
                building your personal collection.
              </p>
            </div>
          )}

          {/* MEMORY GRID */}
          {!loading && memories.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {memories.map((memory) => (
                <article
                  key={memory.path}
                  className="group relative overflow-hidden rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                  }}
                >
                  {/* MEDIA */}
                  <div className="relative aspect-square overflow-hidden">

                    {memory.type === "image" ? (
                      <img
                        src={memory.url}
                        alt={memory.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <video
                        src={memory.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    )}

                    {/* TYPE BADGE */}
                    <div
                      className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border text-sm backdrop-blur-xl"
                      style={{
                        backgroundColor:
                          "rgba(255,255,255,0.72)",
                        borderColor:
                          "rgba(255,255,255,0.8)",
                        color: "var(--dark)",
                      }}
                    >
                      {memory.type === "image"
                        ? "▧"
                        : "▶"}
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="p-5">

                    <p
                      className="font-body truncate text-xs"
                      style={{ color: "var(--dark)" }}
                      title={memory.name}
                    >
                      {memory.name}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">

                      <p
                        className="font-body text-[9px] uppercase tracking-[0.12em]"
                        style={{
                          color:
                            "var(--blue-gray)",
                        }}
                      >
                        {formatDate(memory.createdAt)}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          deleteMemory(memory)
                        }
                        className="font-body rounded-full border px-4 py-2 text-[9px] font-medium uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
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