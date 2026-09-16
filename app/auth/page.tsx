"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a18.2 18.2 0 0 1-3.1 3.8" />
      <path d="M6.2 6.8C3.8 8.2 2.5 12 2.5 12s3.5 6 9.5 6a9.8 9.8 0 0 0 3-.5" />
      <path d="M9.9 9.9a2.5 2.5 0 0 0 3.5 3.5" />
    </svg>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setShowVerification(true);
        setVerificationCode("");
        setMessage("");
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

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const code = verificationCode.trim();

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard";
    }

    setLoading(false);
  }

  async function handleResendCode() {
    setError("");
    setMessage("");
    setResending(true);

    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("A new verification code has been sent to your email.");
    }

    setResending(false);
  }

  function switchMode(login: boolean) {
    setIsLogin(login);
    setError("");
    setMessage("");
    setShowVerification(false);
    setVerificationCode("");
    setShowPassword(false);
    setShowConfirmPassword(false);
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
              {showVerification
                ? "Verify your email"
                : isLogin
                  ? "Welcome back"
                  : "Create your space"}
            </h1>

            <p
              className="font-body mt-3 text-sm leading-6"
              style={{ color: "var(--dark)" }}
            >
              {showVerification
                ? `Enter the 6-digit code sent to ${email}.`
                : isLogin
                  ? "Enter your details to return to your personal space."
                  : "Create an account and start building your personal space."}
            </p>
          </div>

          {!showVerification && (
            <>
              <div
                className="mb-8 flex rounded-full p-1"
                style={{
                  backgroundColor: "rgba(191, 203, 211, 0.35)",
                }}
              >
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className="font-body w-1/2 rounded-full py-3 text-xs font-medium uppercase tracking-[0.15em]"
                  style={{
                    backgroundColor: isLogin
                      ? "var(--dark)"
                      : "transparent",
                    color: isLogin ? "var(--white)" : "var(--dark)",
                  }}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className="font-body w-1/2 rounded-full py-3 text-xs font-medium uppercase tracking-[0.15em]"
                  style={{
                    backgroundColor: !isLogin
                      ? "var(--dark)"
                      : "transparent",
                    color: !isLogin ? "var(--white)" : "var(--dark)",
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

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="font-body w-full rounded-2xl border px-4 py-3.5 pr-12 text-sm outline-none"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        borderColor: "rgba(136, 159, 171, 0.3)",
                        color: "var(--dark)",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                      style={{ color: "var(--blue-gray)" }}
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
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

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Confirm your password"
                        required
                        className="font-body w-full rounded-2xl border px-4 py-3.5 pr-12 text-sm outline-none"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          borderColor: "rgba(136, 159, 171, 0.3)",
                          color: "var(--dark)",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                        style={{ color: "var(--blue-gray)" }}
                      >
                        <EyeIcon visible={showConfirmPassword} />
                      </button>
                    </div>
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
                  onClick={() => switchMode(!isLogin)}
                  className="font-medium underline underline-offset-4"
                  style={{ color: "var(--blue-gray)" }}
                >
                  {isLogin ? "Create one" : "Login"}
                </button>
              </p>
            </>
          )}

          {showVerification && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label
                  htmlFor="verificationCode"
                  className="font-body mb-2 block text-xs font-medium uppercase tracking-[0.12em]"
                  style={{ color: "var(--dark)" }}
                >
                  Verification code
                </label>

                <input
                  id="verificationCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(event) =>
                    setVerificationCode(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter 6-digit code"
                  required
                  className="font-body w-full rounded-2xl border px-4 py-4 text-center text-lg tracking-[0.45em] outline-none"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderColor: "rgba(136, 159, 171, 0.3)",
                    color: "var(--dark)",
                  }}
                />
              </div>

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
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="font-body text-xs font-medium underline underline-offset-4 disabled:opacity-50"
                  style={{ color: "var(--blue-gray)" }}
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => switchMode(false)}
                className="font-body w-full text-center text-xs"
                style={{ color: "var(--dark)" }}
              >
                ← Back to registration
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}