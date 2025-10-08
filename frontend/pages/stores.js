// pup-pantry/frontend/pages/stores.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function StoresPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // GET /stores is public
        const data = await api.get(`/stores?limit=100&sort=name`);
        const list = Array.isArray(data?.items)
          ? data.items
          : data?.items || data || [];
        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load stores");
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
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Stores</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        From <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/stores</code>
      </p>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.length === 0 && <li>No stores yet.</li>}
          {items.map((s) => (
            <li
              key={s._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: "#666", fontSize: 14 }}>
                {s.location ? <>Location: {s.location}</> : "Location: N/A"}
              </div>
              {s.url && (
                <div style={{ marginTop: 4 }}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    Visit store
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 12, color: "#666" }}>
        Tip: as an admin you can add stores via the API, then we’ll surface
        availability on product pages.
      </p>

      <p style={{ marginTop: 8 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Back to Home
        </Link>
      </p>
    </main>
  );
}
