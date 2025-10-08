// pup-pantry/frontend/pages/favorites.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const favs = await api.get("/favorites"); // array
        if (!mounted) return;
        setItems(Array.isArray(favs) ? favs : []);
      } catch (e) {
        setErr(e?.message || "Failed to load favorites");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <main
      style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Favorites</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        From <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/favorites</code>
      </p>

      {loading && <p>Loading…</p>}

      {err && (
        <p style={{ color: "crimson" }}>
          {err === "Not authenticated." ? (
            <>
              You need to{" "}
              <Link href="/login" style={{ textDecoration: "underline" }}>
                log in
              </Link>{" "}
              to see favorites.
            </>
          ) : (
            err
          )}
        </p>
      )}

      {!loading && !err && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {items.length === 0 && <li>No favorites yet.</li>}
          {items.map((f) => {
            const p = f.productId;
            const pid = typeof p === "object" ? p._id : p;
            const pname = typeof p === "object" ? p.name : `Product ${pid}`;
            return (
              <li
                key={f._id}
                style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "0.5rem",
                  border: "1px solid #e5e5e5",
                  borderRadius: 10,
                }}
              >
                <Link
                  href={`/products/${pid}`}
                  style={{ textDecoration: "underline", fontWeight: 600 }}
                >
                  {pname}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
