// pup-pantry/frontend/pages/dogs.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function DogsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/dogs"); // requires auth
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : [];
      setItems(list);
    } catch (e) {
      setErr(e?.message || "Failed to load dogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  async function removeDog(id) {
    if (!id) return;
    setMsg("");
    const ok = window.confirm("Delete this dog?");
    if (!ok) return;
    setBusyId(id);
    try {
      await api.del(`/dogs/${id}`);
      setItems((prev) => prev.filter((d) => d._id !== id));
      setMsg("Dog deleted.");
    } catch (e) {
      setErr(e?.message || "Failed to delete dog");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main
      style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Dogs</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        From <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/dogs</code>
      </p>

      <div
        style={{
          marginTop: "0.75rem",
          marginBottom: "0.75rem",
          display: "flex",
          gap: 10,
        }}
      >
        <Link
          href="/dogs/new"
          style={{
            display: "inline-block",
            padding: "0.5rem 0.75rem",
            borderRadius: 8,
            border: "1px solid #222",
            background: "white",
            textDecoration: "none",
          }}
        >
          + Add Dog
        </Link>
        {msg && (
          <span style={{ alignSelf: "center", color: "green" }}>{msg}</span>
        )}
      </div>

      {loading && <p>Loading…</p>}

      {err && (
        <p style={{ color: "crimson" }}>
          {err === "Not authenticated." ? (
            <>
              You need to{" "}
              <Link href="/login" style={{ textDecoration: "underline" }}>
                log in
              </Link>{" "}
              to see your dogs.
            </>
          ) : (
            err
          )}
        </p>
      )}

      {!loading && !err && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {items.length === 0 && <li>No dogs yet.</li>}
          {items.map((d) => (
            <li
              key={d._id}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                border: "1px solid #e5e5e5",
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {d.breed || "Unknown breed"} ·{" "}
                  {typeof d.age === "number" ? `${d.age} yrs` : "Age n/a"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/dogs/${d._id}/edit`}
                  style={{
                    padding: "0.4rem 0.65rem",
                    borderRadius: 8,
                    border: "1px solid #222",
                    background: "white",
                    textDecoration: "none",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => removeDog(d._id)}
                  disabled={busyId === d._id}
                  style={{
                    padding: "0.4rem 0.65rem",
                    borderRadius: 8,
                    border: "1px solid #222",
                    background: "white",
                    cursor: busyId === d._id ? "not-allowed" : "pointer",
                  }}
                >
                  {busyId === d._id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
