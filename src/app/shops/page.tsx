"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { availabilityLabel, databaseLabel } from "@/lib/shopOptions";
import { ApiError } from "@/services/api";
import type { ShopDto } from "@/services/dto/shop.dto";
import { shopService } from "@/services/shopService";

function ShopCard({ shop }: { shop: ShopDto }) {
  return (
    <article className="card shop-card">
      <header>
        <h2 className="shop-name">{shop.name}</h2>
        <p className="shop-slug">{shop.slug}</p>
      </header>

      <div className="shop-badges">
        <span className="badge">{availabilityLabel(shop.availability)}</span>
        <span className="badge">{databaseLabel(shop.database)}</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Wallet</span>
        <span className="detail-value font-mono text-sm">
          {shop.walletAddress}
        </span>
      </div>

      <div className="shop-card-actions">
        {shop.url === null ? (
          <span className="form-hint">Waiting for the deployment…</span>
        ) : (
          // A shop site is its own application, so it opens in its own tab.
          <a
            className="btn btn-filled"
            href={shop.url}
            target="_blank"
            rel="noreferrer"
          >
            Open shop
          </a>
        )}
        <Link className="btn btn-outlined" href={`/shops/${shop.id}`}>
          Configure
        </Link>
      </div>
    </article>
  );
}

function ShopsOverview() {
  const [shops, setShops] = useState<ShopDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    shopService
      .list()
      .then((listed) => {
        if (active) {
          setShops(listed);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setShops([]);
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Could not load your shops.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <header className="page-header page-header-row">
        <div>
          <h1 className="page-title">My shops</h1>
          <p className="page-subtitle">
            Every shop site you have had ShopHub deploy.
          </p>
        </div>
        <Link href="/shops/new" className="btn btn-filled">
          New shop
        </Link>
      </header>

      {error !== null && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {shops === null ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-text">Loading your shops…</p>
          </div>
        </div>
      ) : shops.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-text">
              No shops yet. Create one and ShopHub deploys it, with the
              availability, wallet and database you pick.
            </p>
          </div>
        </div>
      ) : (
        <div className="shop-grid">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopsPage() {
  return (
    <RequireAuth>
      <ShopsOverview />
    </RequireAuth>
  );
}
