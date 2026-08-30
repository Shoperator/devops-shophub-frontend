"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/services/api";
import { authService } from "@/services/authService";
import type { UserDto } from "@/services/dto/user.dto";

function AccountDetails() {
  const { user } = useAuth();
  // The stored session is shown right away, then confirmed against the backend:
  // it is the one place that proves the token this browser holds still works.
  const [profile, setProfile] = useState<UserDto | null>(user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    authService
      .me()
      .then((fresh) => {
        if (active) {
          setProfile(fresh);
          setError(null);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Could not refresh your profile.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (profile === null) {
    return null;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Account</h1>
        <p className="page-subtitle">
          The account your shop sites are created under.
        </p>
      </header>

      <div className="card">
        <h2 className="section-title">Profile</h2>
        {error !== null && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="detail-row">
          <span className="detail-label">Username</span>
          <span className="detail-value">{profile.username}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">User id</span>
          <span className="detail-value font-mono text-sm">{profile.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Member since</span>
          <span className="detail-value">
            {formatDateTime(profile.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountDetails />
    </RequireAuth>
  );
}
