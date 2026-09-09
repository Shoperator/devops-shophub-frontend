"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import {
  AVAILABILITY_OPTIONS,
  DATABASE_OPTIONS,
  SHOP_NAME_PATTERN,
} from "@/lib/shopOptions";
import { ApiError } from "@/services/api";
import type { ShopAvailability, ShopDatabase } from "@/services/dto/shop.dto";
import { shopService } from "@/services/shopService";

function NewShopForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [availability, setAvailability] =
    useState<ShopAvailability>("standard");
  const [walletAddress, setWalletAddress] = useState("");
  const [database, setDatabase] = useState<ShopDatabase>("postgresql");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await shopService.create({
        name,
        availability,
        walletAddress,
        database,
      });
      router.push("/shops");
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
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">New shop</h1>
        <p className="page-subtitle">
          ShopHub deploys the site and everything it runs on.
        </p>
      </header>

      <div className="card form-card-wide">
        <form className="form-fields" onSubmit={handleSubmit} noValidate>
          {error !== null && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-field">
            <label className="form-label" htmlFor="name">
              Shop name
            </label>
            <input
              id="name"
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              pattern={SHOP_NAME_PATTERN}
              minLength={3}
              maxLength={64}
              required
            />
            <span className="form-hint">
              Latin letters, digits and single spaces, for example “Prodavnica
              zdrave hrane”.
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="availability">
              Availability
            </label>
            <select
              id="availability"
              className="form-input"
              value={availability}
              onChange={(event) =>
                setAvailability(event.target.value as ShopAvailability)
              }
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="form-hint">
              How many copies of the shop run side by side.
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="database">
              Database
            </label>
            <select
              id="database"
              className="form-input"
              value={database}
              onChange={(event) =>
                setDatabase(event.target.value as ShopDatabase)
              }
            >
              {DATABASE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="form-hint">
              Chosen once: a deployed shop cannot be moved to the other engine.
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="walletAddress">
              Wallet address
            </label>
            <input
              id="walletAddress"
              className="form-input font-mono text-sm"
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              placeholder="0x…"
              pattern="0x[a-fA-F0-9]{40}"
              maxLength={42}
              required
            />
            <span className="form-hint">
              Where the payments your customers make are collected. An address
              on the chain the shops settle on: 0x and 40 hex characters.
            </span>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-filled"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating shop…" : "Create shop"}
            </button>
            <Link href="/shops" className="btn btn-outlined">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewShopPage() {
  return (
    <RequireAuth>
      <NewShopForm />
    </RequireAuth>
  );
}
