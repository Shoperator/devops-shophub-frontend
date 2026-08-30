"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";
import { authService } from "@/services/authService";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Registration answers with a session, so the new account never has to
      // type the password it just chose a second time.
      const session = await authService.register({ username, password });
      signIn(session.user, session.accessToken);
      router.push("/");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <div className="card form-card">
        <h1 className="form-title">Create account</h1>
        <p className="form-lead">
          One account manages every shop site you deploy.
        </p>

        <form className="form-fields" onSubmit={handleSubmit} noValidate>
          {error !== null && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-field">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="form-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              pattern="[a-zA-Z0-9._\-]+"
              minLength={3}
              maxLength={64}
              required
            />
            <span className="form-hint">
              Letters, digits, dot, dash and underscore.
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
            <span className="form-hint">
              At least {MIN_PASSWORD_LENGTH} characters.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-filled form-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="form-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
