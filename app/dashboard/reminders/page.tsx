"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  remind_at: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

const supabase = createClient();

export default function RemindersPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remindAt, setRemindAt] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    loadReminders();

    function handleMouseMove(event: MouseEvent) {
      const x =
        (event.clientX / window.innerWidth - 0.5) * 2;

      const y =
        (event.clientY / window.innerHeight - 0.5) * 2;

      setMouseX(x);
      setMouseY(y);
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  async function loadReminders() {
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
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("completed", { ascending: true })
      .order("remind_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setReminders(data || []);
    }

    setLoading(false);
  }

  async function createReminder() {
    setError("");
    setMessage("");

    if (!userId) return;

    if (!title.trim()) {
      setError("Please enter a reminder title.");
      return;
    }

    if (!remindAt) {
      setError("Please select a date and time.");
      return;
    }

    const selectedDate = new Date(remindAt);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getTime() <= Date.now()
    ) {
      setError("Please choose a future date and time.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        remind_at: selectedDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setReminders((current) =>
        [...current, data].sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }

          return (
            new Date(a.remind_at).getTime() -
            new Date(b.remind_at).getTime()
          );
        })
      );

      setTitle("");
      setDescription("");
      setRemindAt("");

      setMessage("Reminder created successfully.");
    }

    setSaving(false);
  }

  async function toggleReminder(reminder: Reminder) {
    setError("");
    setMessage("");

    const { data, error } = await supabase
      .from("reminders")
      .update({
        completed: !reminder.completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reminder.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    if (data) {
      setReminders((current) =>
        current
          .map((item) =>
            item.id === reminder.id ? data : item
          )
          .sort((a, b) => {
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }

            return (
              new Date(a.remind_at).getTime() -
              new Date(b.remind_at).getTime()
            );
          })
      );

      setMessage(
        data.completed
          ? "Reminder completed."
          : "Reminder reopened."
      );
    }
  }

  async function deleteReminder(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setReminders((current) =>
      current.filter((reminder) => reminder.id !== id)
    );

    setMessage("Reminder deleted.");
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getTimeParts(date: string) {
    const value = new Date(date);

    return {
      hour: value.getHours(),
      minute: value.getMinutes(),
    };
  }

  const pending = reminders.filter(
    (reminder) => !reminder.completed
  ).length;

  const completed = reminders.filter(
    (reminder) => reminder.completed
  ).length;

  const tiltX = mouseY * -3;
  const tiltY = mouseX * 5;

  return (
    <main className="app-background min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="relative z-30 flex items-center justify-between gap-4">
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
            className="font-body rounded-full border px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.15em] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: "rgba(255,255,255,0.55)",
              borderColor: "rgba(136,159,171,0.22)",
              color: "var(--dark)",
            }}
          >
            ← Dashboard
          </Link>
        </header>

        {/* HERO */}
        <section className="relative mt-8 overflow-hidden rounded-[2.5rem] border">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 72% 45%, rgba(191,203,211,0.30), transparent 34%), radial-gradient(circle at 90% 80%, rgba(217,211,213,0.35), transparent 38%)",
            }}
          />

          <div
            className="pointer-events-none absolute left-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full blur-3xl"
            style={{
              backgroundColor:
                "rgba(191,203,211,0.22)",
            }}
          />

          <div className="relative grid min-h-[520px] items-center lg:grid-cols-[0.9fr_1.1fr]">

            {/* LEFT */}
            <div className="relative z-20 px-7 py-12 sm:px-12 lg:px-14">
              <p
                className="font-body text-[10px] uppercase tracking-[0.38em]"
                style={{ color: "var(--blue-gray)" }}
              >
                Stay on track
              </p>

              <h1
                className="font-heading mt-4 text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-[5rem]"
                style={{ color: "var(--dark)" }}
              >
                Reminders
              </h1>

              <p
                className="font-body mt-6 max-w-xl text-sm leading-7 sm:text-base"
                style={{ color: "var(--dark)" }}
              >
                Give your future self a little help.
                Keep important tasks, plans, and moments
                close.
              </p>

              <div className="mt-8 flex gap-8">
                <div>
                  <p
                    className="font-heading text-3xl"
                    style={{ color: "var(--dark)" }}
                  >
                    {pending}
                  </p>

                  <p
                    className="font-body mt-1 text-[9px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--blue-gray)" }}
                  >
                    Pending
                  </p>
                </div>

                <div>
                  <p
                    className="font-heading text-3xl"
                    style={{ color: "var(--dark)" }}
                  >
                    {completed}
                  </p>

                  <p
                    className="font-body mt-1 text-[9px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--blue-gray)" }}
                  >
                    Completed
                  </p>
                </div>
              </div>
            </div>

            {/* 3D INTERACTIVE CLOCK UNIVERSE */}
            <div className="relative flex min-h-[430px] items-center justify-center perspective-[1200px]">

              <div
                className="absolute h-[340px] w-[340px] rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(191,203,211,0.38), rgba(217,211,213,0.12), transparent 70%)",
                }}
              />

              {/* FLOATING NOTE */}
              <div
                className="absolute left-[9%] top-[17%] z-20 w-32 rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-transform duration-200 sm:w-40"
                style={{
                  backgroundColor:
                    "rgba(255,255,255,0.58)",
                  borderColor:
                    "rgba(136,159,171,0.20)",
                  transform: `
                    translate3d(${mouseX * -14}px, ${mouseY * -10}px, 35px)
                    rotateX(${mouseY * -5}deg)
                    rotateY(${mouseX * 7}deg)
                    rotateZ(-7deg)
                  `,
                  boxShadow:
                    "0 20px 40px rgba(85,94,106,0.12)",
                }}
              >
                <div className="text-xl">✦</div>

                <p
                  className="font-heading mt-3 text-sm"
                  style={{ color: "var(--dark)" }}
                >
                  Remember
                </p>

                <p
                  className="font-body mt-1 text-[9px] leading-4"
                  style={{ color: "var(--blue-gray)" }}
                >
                  Your future self will thank you.
                </p>
              </div>

              {/* MAIN CLOCK */}
              <div
                className="relative z-10 flex h-64 w-64 items-center justify-center rounded-full border transition-transform duration-200 sm:h-72 sm:w-72"
                style={{
                  transform: `
                    rotateX(${tiltX}deg)
                    rotateY(${tiltY}deg)
                    translateZ(30px)
                  `,
                  background:
                    "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.88), rgba(191,203,211,0.45) 48%, rgba(136,159,171,0.20))",
                  borderColor:
                    "rgba(255,255,255,0.75)",
                  boxShadow:
                    "inset -20px -20px 50px rgba(85,94,106,0.10), inset 20px 20px 45px rgba(255,255,255,0.8), 0 35px 80px rgba(85,94,106,0.15)",
                }}
              >
                {/* CLOCK FACE */}
                <div
                  className="relative flex h-[78%] w-[78%] items-center justify-center rounded-full border"
                  style={{
                    backgroundColor:
                      "rgba(252,248,247,0.72)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    boxShadow:
                      "inset 0 5px 20px rgba(85,94,106,0.08)",
                  }}
                >
                  {/* CLOCK MARKS */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
                    (number) => (
                      <span
                        key={number}
                        className="absolute h-2 w-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            "var(--blue-gray)",
                          transform: `rotate(${number * 30}deg) translateY(-72px)`,
                          opacity:
                            number % 3 === 0
                              ? 0.85
                              : 0.35,
                        }}
                      />
                    )
                  )}

                  {/* HANDS */}
                  <div
                    className="absolute bottom-1/2 left-1/2 h-16 w-1 origin-bottom rounded-full"
                    style={{
                      backgroundColor: "var(--dark)",
                      transform:
                        "translateX(-50%) rotate(35deg)",
                    }}
                  />

                  <div
                    className="absolute bottom-1/2 left-1/2 h-20 w-0.5 origin-bottom rounded-full"
                    style={{
                      backgroundColor:
                        "var(--blue-gray)",
                      transform:
                        "translateX(-50%) rotate(125deg)",
                    }}
                  />

                  <div
                    className="absolute h-3 w-3 rounded-full border-2"
                    style={{
                      backgroundColor:
                        "var(--dark)",
                      borderColor:
                        "rgba(255,255,255,0.8)",
                    }}
                  />

                  <p
                    className="font-heading absolute bottom-9 text-lg"
                    style={{ color: "var(--dark)" }}
                  >
                    your time
                  </p>
                </div>
              </div>

              {/* FLOATING SMALL CLOCK */}
              <div
                className="absolute bottom-[14%] right-[12%] z-20 flex h-24 w-24 items-center justify-center rounded-full border shadow-xl transition-transform duration-200"
                style={{
                  transform: `
                    translate3d(${mouseX * 18}px, ${mouseY * 14}px, 70px)
                    rotateX(${mouseY * 10}deg)
                    rotateY(${mouseX * -10}deg)
                  `,
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(191,203,211,0.38))",
                  borderColor:
                    "rgba(255,255,255,0.75)",
                }}
              >
                <div
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor:
                      "rgba(252,248,247,0.7)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                  }}
                >
                  <span
                    className="absolute bottom-1/2 left-1/2 h-6 w-0.5 origin-bottom rounded-full"
                    style={{
                      backgroundColor:
                        "var(--dark)",
                      transform:
                        "translateX(-50%) rotate(20deg)",
                    }}
                  />

                  <span
                    className="absolute bottom-1/2 left-1/2 h-5 w-0.5 origin-bottom rounded-full"
                    style={{
                      backgroundColor:
                        "var(--blue-gray)",
                      transform:
                        "translateX(-50%) rotate(130deg)",
                    }}
                  />

                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        "var(--dark)",
                    }}
                  />
                </div>
              </div>

              {/* FLOATING SPARKLES */}
              <span
                className="absolute left-[22%] bottom-[18%] text-xl"
                style={{
                  color: "var(--blue-gray)",
                  transform: `translate(${mouseX * -12}px, ${mouseY * -8}px)`,
                }}
              >
                ✦
              </span>

              <span
                className="absolute right-[22%] top-[17%] text-2xl"
                style={{
                  color: "var(--blue-gray)",
                  transform: `translate(${mouseX * 10}px, ${mouseY * 7}px)`,
                }}
              >
                ◇
              </span>

              <span
                className="absolute right-[8%] top-[45%] text-sm"
                style={{
                  color: "var(--blue-gray)",
                  transform: `translate(${mouseX * 16}px, ${mouseY * 10}px)`,
                }}
              >
                ✦
              </span>
            </div>
          </div>
        </section>

        {/* CREATE REMINDER */}
        <section
          className="relative mt-7 overflow-hidden rounded-[2rem] border p-6 sm:p-8"
          style={{
            backgroundColor:
              "rgba(255,255,255,0.50)",
            borderColor:
              "rgba(136,159,171,0.20)",
            boxShadow:
              "0 20px 60px rgba(85,94,106,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl"
            style={{
              backgroundColor:
                "rgba(191,203,211,0.28)",
            }}
          />

          <div className="relative">

            <p
              className="font-body text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "var(--blue-gray)" }}
            >
              Create a reminder
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* TITLE */}
              <div>
                <label
                  className="font-body text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--blue-gray)" }}
                >
                  What do you need to remember?
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Submit assignment"
                  className="font-body mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    color: "var(--dark)",
                  }}
                />
              </div>

              {/* DATE */}
              <div>
                <label
                  className="font-body text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--blue-gray)" }}
                >
                  When?
                </label>

                <input
                  type="datetime-local"
                  value={remindAt}
                  onChange={(event) =>
                    setRemindAt(event.target.value)
                  }
                  className="font-body mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor:
                      "rgba(255,255,255,0.5)",
                    borderColor:
                      "rgba(136,159,171,0.18)",
                    color: "var(--dark)",
                  }}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="md:col-span-2">
                <label
                  className="font-body text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--blue-gray)" }}
                >
                  Details
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Add some details..."
                  rows={4}
                  className="font-body mt-2 w-full resize-none rounded-2xl border p-4 text-sm leading-6 outline-none"
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

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={createReminder}
                disabled={saving}
                className="font-body rounded-full px-7 py-3.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                style={{
                  backgroundColor:
                    "var(--dark)",
                  color: "var(--white)",
                }}
              >
                {saving
                  ? "Creating..."
                  : "Create Reminder →"}
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

        {/* REMINDERS */}
        <section className="mt-12 pb-10">

          <div className="mb-6 flex items-end justify-between">
            <div>
              <p
                className="font-body text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "var(--blue-gray)" }}
              >
                Your schedule
              </p>

              <h2
                className="font-heading mt-2 text-3xl"
                style={{ color: "var(--dark)" }}
              >
                Your reminders
              </h2>
            </div>

            <p
              className="font-body text-xs"
              style={{ color: "var(--blue-gray)" }}
            >
              {reminders.length}{" "}
              {reminders.length === 1
                ? "reminder"
                : "reminders"}
            </p>
          </div>

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
                Loading your reminders...
              </p>
            </div>
          )}

          {!loading && reminders.length === 0 && (
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
                }}
              >
                ◷
              </div>

              <h3
                className="font-heading mt-6 text-2xl"
                style={{ color: "var(--dark)" }}
              >
                Nothing scheduled yet
              </h3>

              <p
                className="font-body mt-3 text-sm"
                style={{ color: "var(--blue-gray)" }}
              >
                Create your first reminder above.
              </p>
            </div>
          )}

          {!loading && reminders.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">

              {reminders.map((reminder) => {
                const time = getTimeParts(
                  reminder.remind_at
                );

                return (
                  <article
                    key={reminder.id}
                    className="group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      backgroundColor:
                        "rgba(255,255,255,0.52)",
                      borderColor:
                        "rgba(136,159,171,0.18)",
                      opacity:
                        reminder.completed
                          ? 0.62
                          : 1,
                    }}
                  >
                    {/* CARD DECORATION */}
                    <div
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        backgroundColor:
                          "rgba(191,203,211,0.32)",
                      }}
                    />

                    <div className="relative flex gap-5">

                      {/* MINI CLOCK */}
                      <div
                        className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border shadow-md"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(191,203,211,0.38))",
                          borderColor:
                            "rgba(255,255,255,0.8)",
                        }}
                      >
                        <div
                          className="relative h-11 w-11 rounded-full border"
                          style={{
                            backgroundColor:
                              "rgba(252,248,247,0.7)",
                            borderColor:
                              "rgba(136,159,171,0.18)",
                          }}
                        >
                          <span
                            className="absolute bottom-1/2 left-1/2 h-4 w-0.5 origin-bottom rounded-full"
                            style={{
                              backgroundColor:
                                "var(--dark)",
                              transform: `translateX(-50%) rotate(${time.hour * 30 + time.minute * 0.5}deg)`,
                            }}
                          />

                          <span
                            className="absolute bottom-1/2 left-1/2 h-5 w-0.5 origin-bottom rounded-full"
                            style={{
                              backgroundColor:
                                "var(--blue-gray)",
                              transform: `translateX(-50%) rotate(${time.minute * 6}deg)`,
                            }}
                          />

                          <span
                            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{
                              backgroundColor:
                                "var(--dark)",
                            }}
                          />
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <h3
                            className={`font-heading break-words text-2xl ${
                              reminder.completed
                                ? "line-through"
                                : ""
                            }`}
                            style={{
                              color: "var(--dark)",
                            }}
                          >
                            {reminder.title}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              deleteReminder(
                                reminder.id
                              )
                            }
                            className="shrink-0 text-sm opacity-60 transition-opacity hover:opacity-100"
                            style={{
                              color: "#8B4A4A",
                            }}
                            aria-label="Delete reminder"
                          >
                            ×
                          </button>
                        </div>

                        {reminder.description && (
                          <p
                            className="font-body mt-2 whitespace-pre-wrap break-words text-sm leading-6"
                            style={{
                              color:
                                "var(--blue-gray)",
                            }}
                          >
                            {reminder.description}
                          </p>
                        )}

                        <p
                          className="font-body mt-4 text-xs"
                          style={{
                            color:
                              "var(--blue-gray)",
                          }}
                        >
                          ◷{" "}
                          {formatDateTime(
                            reminder.remind_at
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            toggleReminder(
                              reminder
                            )
                          }
                          className="font-body mt-5 rounded-full border px-5 py-2.5 text-[9px] font-medium uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                          style={{
                            backgroundColor:
                              reminder.completed
                                ? "var(--dark)"
                                : "rgba(255,255,255,0.45)",
                            borderColor:
                              "rgba(136,159,171,0.22)",
                            color:
                              reminder.completed
                                ? "var(--white)"
                                : "var(--dark)",
                          }}
                        >
                          {reminder.completed
                            ? "✓ Completed"
                            : "Mark complete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer
          className="pb-6 text-center"
          style={{
            color: "var(--blue-gray)",
          }}
        >
          <p className="font-body text-[9px] uppercase tracking-[0.28em]">
            Here I Am · your space, your story
          </p>
        </footer>

      </div>
    </main>
  );
}