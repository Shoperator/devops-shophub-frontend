"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="hero">
      <div className="hero-container">
        <span className="hero-eyebrow">ShopHub</span>
        <h1 className="hero-title">
          {isAuthenticated
            ? `Welcome back, ${user?.username}`
            : "Your shops, deployed"}
        </h1>
        <p className="hero-subtitle">
          Create a shop site, pick how it runs, and ShopHub deploys it for you.
          Sign in to manage the shops you own.
        </p>
        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link href="/shops" className="btn btn-filled">
                My shops
              </Link>
              <Link href="/account" className="btn btn-outlined">
                My account
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-filled">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-outlined">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
