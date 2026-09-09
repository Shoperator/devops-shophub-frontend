"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { formatDateTime } from "@/lib/format";
import { AVAILABILITY_OPTIONS, databaseLabel } from "@/lib/shopOptions";
import { ApiError } from "@/services/api";
import type {
  ShopAvailability,
  ShopDto,
  UpdateShopRequestDto,
} from "@/services/dto/shop.dto";
import { shopService } from "@/services/shopService";

/** The name is not here: a shop keeps the one it was created with. */
interface Draft {
  availability: ShopAvailability;
  walletAddress: string;
}

function draftOf(shop: ShopDto): Draft {
  return {
    availability: shop.availability,
    walletAddress: shop.walletAddress,
  };
}

/** Only what the owner actually touched, so an unchanged field is left as is. */
function changesBetween(shop: ShopDto, draft: Draft): UpdateShopRequestDto {
  return {
    ...(draft.availability !== shop.availability && {
      availability: draft.availability,
    }),
    ...(draft.walletAddress !== shop.walletAddress && {
      walletAddress: draft.walletAddress,
    }),
  };
}

function ShopSettings({ shopId }: { shopId: string }) {
  const router = useRouter();

  const [shop, setShop] = useState<ShopDto | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    shopService
      .get(shopId)
      .then((loaded) => {
        if (active) {
          setShop(loaded);
          setDraft(draftOf(loaded));
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Could not load this shop.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [shopId]);

  if (shop === null || draft === null) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty-state">
            {error !== null ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="empty-state-text">Loading the shop…</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const changes = changesBetween(shop, draft);
  const hasChanges = Object.keys(changes).length > 0;

  function update(patch: Partial<Draft>) {
    setDraft((current) =>
      current === null ? current : { ...current, ...patch },
    );
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const reconfigured = await shopService.update(shopId, changes);
      setShop(reconfigured);
      setDraft(draftOf(reconfigured));
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not save your changes.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      await shopService.remove(shopId);
      router.push("/shops");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not delete this shop.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header page-header-row">
        <div>
          <h1 className="page-title">{shop.name}</h1>
          <p className="page-subtitle">Configure how this shop is deployed.</p>
        </div>
        {shop.url !== null && (
          <a
            className="btn btn-outlined"
            href={shop.url}
            target="_blank"
            rel="noreferrer"
          >
            Open shop
          </a>
        )}
      </header>

      <div className="card">
        <h2 className="section-title">Deployment</h2>
        <div className="detail-row">
          <span className="detail-label">Name</span>
          <span className="detail-value">{shop.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Address</span>
          <span className="detail-value">
            {shop.url ?? "Waiting for the deployment…"}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Cluster resources</span>
          <span className="detail-value font-mono text-sm">{shop.slug}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Database</span>
          <span className="detail-value">{databaseLabel(shop.database)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Created</span>
          <span className="detail-value">{formatDateTime(shop.createdAt)}</span>
        </div>
      </div>

      <div className="card card-stacked">
        <h2 className="section-title">Settings</h2>

        <form className="form-fields" onSubmit={handleSubmit} noValidate>
          {error !== null && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p className="form-notice" role="status">
              Saved. The shop is being reconfigured.
            </p>
          )}

          <div className="form-field">
            <label className="form-label" htmlFor="availability">
              Availability
            </label>
            <select
              id="availability"
              className="form-input"
              value={draft.availability}
              onChange={(event) =>
                update({ availability: event.target.value as ShopAvailability })
              }
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="walletAddress">
              Wallet address
            </label>
            <input
              id="walletAddress"
              className="form-input font-mono text-sm"
              value={draft.walletAddress}
              onChange={(event) =>
                update({ walletAddress: event.target.value })
              }
              placeholder="0x…"
              pattern="0x[a-fA-F0-9]{40}"
              maxLength={42}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-filled"
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
            <Link href="/shops" className="btn btn-outlined">
              Back to my shops
            </Link>
          </div>
        </form>
      </div>

      <div className="card card-stacked danger-zone">
        <h2 className="section-title">Delete this shop</h2>
        <p className="empty-state-text danger-zone-text">
          The site and everything it runs on are removed from the cluster. This
          cannot be undone.
        </p>

        {isConfirmingDelete ? (
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : `Yes, delete ${shop.name}`}
            </button>
            <button
              type="button"
              className="btn btn-outlined"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
            >
              Keep it
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setIsConfirmingDelete(true)}
          >
            Delete shop
          </button>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <ShopSettings shopId={id} />
    </RequireAuth>
  );
}
