// pup-pantry/frontend/pages/dogs.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function DogsPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dogs, setDogs] = useState([]);
  const [ingMap, setIngMap] = useState({}); // ingredientId -> name
  const [namesLoading, setNamesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get("/dogs");
        if (cancelled) return;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : [];
        setDogs(list);

        // Build a set of all ingredient IDs to resolve names once
        const allIds = new Set();
        list.forEach((d) => {
          const r = Array.isArray(d?.restrictions) ? d.restrictions : [];
          r.forEach((id) => allIds.add(id));
        });

        if (allIds.size > 0) {
          setNamesLoading(true);
          const pairs = await Promise.all(
            Array.from(allIds).map((id) =>
              api
                .get(`/ingredients/${id}`)
                .then((ing) => [id, ing?.name || id])
                .catch(() => [id, id])
            )
          );
          if (!cancelled) setIngMap(Object.fromEntries(pairs));
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e?.message || "Failed to load dogs.";
          if (/401|unauthor/i.test(msg)) {
            setErr("Please log in to view your dogs.");
          } else {
            setErr(msg);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setNamesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Dogs</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        From <code>{API}/dogs</code>
      </p>

      {/* Instruction banner */}
      <div
        style={{
          margin: "12px 0 16px",
          padding: "10px 12px",
          border: "1px solid #e5e5e5",
          borderRadius: 10,
          background: "#fafafa",
          color: "#333",
          fontSize: 14,
        }}
      >
        <strong>Tip:</strong> Click <em>Edit</em> on your dog's profile to
        change the diet filter.
      </div>

      <div style={{ marginBottom: "12px" }}>
        <Link
          href="/dogs/new"
          style={{
            display: "inline-block",
            padding: "0.45rem 0.75rem",
            borderRadius: 8,
            border: "1px solid #222",
            background: "white",
            textDecoration: "none",
          }}
        >
          + Add Dog
        </Link>
      </div>

      {loading && <p>Loading…</p>}
      {err && (
        <p style={{ color: "crimson", marginTop: "0.5rem" }}>
          {err}{" "}
          {err.toLowerCase().includes("log in") && (
            <>
              <Link href="/login" style={{ textDecoration: "underline" }}>
                Login
              </Link>
              {" · "}
              <Link href="/register" style={{ textDecoration: "underline" }}>
                Register
              </Link>
            </>
          )}
        </p>
      )}

      {!loading && !err && (
        <>
          {dogs.length === 0 ? (
            <p style={{ color: "#666" }}>You don’t have any dogs yet.</p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              }}
            >
              {dogs.map((d) => {
                const breed = d.breed || d.breedName || "—";
                const ageYears =
                  typeof d.ageYears === "number"
                    ? d.ageYears
                    : typeof d.age === "number"
                    ? d.age
                    : null;
                const ageText =
                  ageYears != null
                    ? `${ageYears} yr${ageYears === 1 ? "" : "s"}`
                    : null;
                const restrictions = Array.isArray(d.restrictions)
                  ? d.restrictions
                  : [];
                const restrictionNames = restrictions
                  .map((id) => ingMap[id])
                  .filter(Boolean);

                return (
                  <li
                    key={d._id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: "0.9rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      background: "white",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                      {d.name || "(unnamed)"}
                    </div>

                    <div style={{ color: "#555" }}>
                      {breed}
                      {ageText ? ` · ${ageText}` : ""}
                    </div>

                    <div style={{ color: "#777", fontSize: 13 }}>
                      Avoiding:{" "}
                      {namesLoading && restrictions.length > 0
                        ? "loading…"
                        : restrictionNames.length > 0
                        ? restrictionNames.join(", ")
                        : "none"}
                    </div>

                    <div style={{ marginTop: 4 }}>
                      <Link
                        href={`/dogs/${d._id}/edit`}
                        style={{
                          display: "inline-block",
                          padding: "0.35rem 0.65rem",
                          borderRadius: 8,
                          border: "1px solid #222",
                          background: "white",
                          textDecoration: "none",
                        }}
                      >
                        Edit
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
