"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();

    if (!isLogin) {
      if (!name.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Account created! Check your email to verify your account."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    }

    setLoading(false);
  }

  return (
    <main className="app-background min-h-screen px-6 py-10">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div
          className="w-full rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl sm:p-10"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.58)",
            borderColor: "rgba(136, 159, 171, 0.25)",
          }}
        >
          <div className="mb-8 text-center">
            <p
              className="font-script text-4xl"
              style={{ color: "var(--blue-gray)" }}
            >
              Here I Am
            </p>

            <h1
              className="font-heading mt-3 text-3xl font-medium"
              style={{ color: "var(--dark)" }}
            >
              {isLogin ? "Welcome back" : "Create your space"}
            </h1>

            <p
              className="font-body mt-3 text-sm leading-6"
              style={{ color: "var(--dark)" }}
            >
              {isLogin
                ? "Enter your details to return to your personal space."
                : "Create an account and start building your personal space."}
            </p>
          </div>

          <div
            className="mb-8 flex rounded-full p-1"
            style={{
              backgroundColor: "rgba(191, 203, 211, 0.35)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
                setMessage("");
              }}
              className="font-body w-1/2 rounded-full py-3 text-xs font-medium uppercase tracking-[0.15em]"
              style={{
                backgroundColor: isLogin
                  ? "var(--dark)"
                  : "transparent",
                color: isLogin
                  ? "var(--white)"
                  : "var(--dark)",
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
                setMessage("");
              }}
              className="font-body w-1/2 rounded-full py-3 text-xs font-medium uppercase tracking-[0.15em]"
              style={{
                backgroundColor: !isLogin
                  ? "var(--dark)"
                  : "transparent",
                color: !isLogin
                  ? "var(--white)"
                  : "var(--dark)",
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="font-body mb-2 block text-xs font-medium uppercase tracking-[0.12em]"
                  style={{ color: "var(--dark)" }}
                >
                  Your name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderColor: "rgba(136, 159, 171, 0.3)",
                    color: "var(--dark)",
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="font-body mb-2 block text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--dark)" }}
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderColor: "rgba(136, 159, 171, 0.3)",
                  color: "var(--dark)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="font-body mb-2 block text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--dark)" }}
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderColor: "rgba(136, 159, 171, 0.3)",
                  color: "var(--dark)",
                }}
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="font-body mb-2 block text-xs font-medium uppercase tracking-[0.12em]"
                  style={{ color: "var(--dark)" }}
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  required
                  className="font-body w-full rounded-2xl border px-4 py-3.5 text-sm outline-none"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderColor: "rgba(136, 159, 171, 0.3)",
                    color: "var(--dark)",
                  }}
                />
              </div>
            )}

            {error && (
              <p
                className="font-body rounded-2xl px-4 py-3 text-center text-xs"
                style={{
                  backgroundColor: "rgba(180, 100, 100, 0.1)",
                  color: "#8B4A4A",
                }}
              >
                {error}
              </p>
            )}

            {message && (
              <p
                className="font-body rounded-2xl px-4 py-3 text-center text-xs"
                style={{
                  backgroundColor: "rgba(136, 159, 171, 0.12)",
                  color: "var(--dark)",
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-body w-full rounded-full px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
              style={{
                backgroundColor: "var(--dark)",
                color: "var(--white)",
              }}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Enter Your Space"
                  : "Create Account"}
            </button>
          </form>

          <p
            className="font-body mt-7 text-center text-xs"
            style={{ color: "var(--dark)" }}
          >
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
              }}
              className="font-medium underline underline-offset-4"
              style={{ color: "var(--blue-gray)" }}
            >
              {isLogin ? "Create one" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}