// pup-pantry/frontend/pages/ingredients.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function IngredientsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get("/ingredients?limit=200&sort=name");
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load ingredients");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Ingredients</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        From <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/ingredients</code>
      </p>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {items.length === 0 && <li>No ingredients found.</li>}
          {items.map((ing) => (
            <li
              key={ing._id}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                border: "1px solid #e5e5e5",
                borderRadius: 10
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{ing.name}</div>
              {Array.isArray(ing.synonyms) && ing.synonyms.length > 0 && (
                <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: 6 }}>
                  Synonyms: {ing.synonyms.join(", ")}
                </div>
              )}
              <Link
                href={`/products?ingredientId=${ing._id}`}
                style={{ textDecoration: "underline" }}
              >
                View products with “{ing.name}”
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
