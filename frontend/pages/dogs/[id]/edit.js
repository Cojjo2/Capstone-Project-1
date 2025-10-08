// pup-pantry/frontend/pages/dogs/[id]/edit.js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";

export default function EditDogPage() {
  const router = useRouter();
  const { id } = router.query;

  // dog basics
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // restrictions
  const [restrictionIds, setRestrictionIds] = useState([]); // current saved ids
  const [selectedIds, setSelectedIds] = useState([]); // editable selection
  const [restrictionNames, setRestrictionNames] = useState([]); // display for saved ids
  const [restrictionsLoading, setRestrictionsLoading] = useState(false);

  // ingredients catalog
  const [ingredients, setIngredients] = useState([]);
  const [ingredientsErr, setIngredientsErr] = useState("");
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [ingSearch, setIngSearch] = useState("");

  const filteredIngredients = useMemo(() => {
    const q = ingSearch.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((ing) => {
      const inName = ing.name?.toLowerCase().includes(q);
      const inSyn =
        Array.isArray(ing.synonyms) &&
        ing.synonyms.some((s) => s?.toLowerCase().includes(q));
      return inName || inSyn;
    });
  }, [ingredients, ingSearch]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setErr("");
      setOk("");
      setLoading(true);
      try {
        // load dog
        const d = await api.get(`/dogs/${id}`);
        if (!mounted) return;
        setName(d?.name || "");
        setBreed(d?.breed || "");
        setAge(typeof d?.age === "number" ? String(d.age) : "");
        const ids = Array.isArray(d?.restrictions) ? d.restrictions : [];
        setRestrictionIds(ids);
        setSelectedIds(ids); // init editable selection

        // names for current saved restrictions
        setRestrictionsLoading(true);
        try {
          const lookups = await Promise.all(
            ids.map((ingId) =>
              api.get(`/ingredients/${ingId}`).catch(() => null)
            )
          );
          const names = lookups.filter(Boolean).map((ing) => ing.name);
          if (mounted) setRestrictionNames(names);
        } finally {
          if (mounted) setRestrictionsLoading(false);
        }

        // ingredients catalog
        setIngredientsLoading(true);
        setIngredientsErr("");
        try {
          const data = await api.get("/ingredients?limit=200&sort=name");
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : [];
          if (mounted) setIngredients(list);
        } catch (e) {
          if (mounted)
            setIngredientsErr(e?.message || "Failed to load ingredients list");
        } finally {
          if (mounted) setIngredientsLoading(false);
        }
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load dog");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  function toggleSelection(ingId) {
    setSelectedIds((prev) =>
      prev.includes(ingId)
        ? prev.filter((x) => x !== ingId)
        : prev.concat(ingId)
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    setSaving(true);
    try {
      const body = {
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(breed.trim() ? { breed: breed.trim() } : { breed: "" }),
        ...(age !== "" ? { age: Number(age) } : { age: undefined }),
        restrictions: selectedIds, // << save restrictions
      };
      await api.patch(`/dogs/${id}`, body);
      setOk("Dog updated. Redirecting…");
      setTimeout(() => router.push("/dogs"), 700);
    } catch (e) {
      setErr(e?.message || "Failed to update dog");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, Arial, sans-serif",
        maxWidth: 900,
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Edit Dog</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        GET{" "}
        <code>
          {process.env.NEXT_PUBLIC_API_BASE_URL}/dogs/{id}
        </code>{" "}
        &nbsp;|&nbsp; PATCH{" "}
        <code>
          {process.env.NEXT_PUBLIC_API_BASE_URL}/dogs/{id}
        </code>
      </p>

      <p>
        <Link href="/dogs" style={{ textDecoration: "underline" }}>
          ← Back to Dogs
        </Link>
      </p>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <>
          {/* Saved restrictions summary */}
          <section
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              background: "#fafafa",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>
              Current Restrictions (saved)
            </h3>
            {restrictionsLoading ? (
              <p>Loading restrictions…</p>
            ) : restrictionIds.length === 0 ? (
              <p style={{ color: "#666" }}>None</p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {restrictionNames.map((n, i) => (
                  <li
                    key={`${restrictionIds[i]}-${i}`}
                    style={{
                      border: "1px solid #ddd",
                      padding: "0.25rem 0.5rem",
                      borderRadius: 8,
                    }}
                  >
                    {n || restrictionIds[i]}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Edit form */}
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              <span>Name *</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Buddy"
                style={{
                  padding: "0.5rem",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.25rem" }}>
              <span>Breed</span>
              <input
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Labrador Retriever"
                style={{
                  padding: "0.5rem",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.25rem" }}>
              <span>Age (years)</span>
              <input
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="4"
                style={{
                  padding: "0.5rem",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  width: 120,
                }}
              />
            </label>

            {/* Editable restrictions */}
            <section
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                marginTop: "0.5rem",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Edit Restrictions</h3>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <input
                  placeholder="Search ingredients…"
                  value={ingSearch}
                  onChange={(e) => setIngSearch(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    flex: "0 0 280px",
                  }}
                />
                <span style={{ color: "#666", fontSize: 12 }}>
                  {selectedIds.length} selected
                </span>
              </div>

              {ingredientsLoading && <p>Loading ingredients…</p>}
              {ingredientsErr && (
                <p style={{ color: "crimson" }}>{ingredientsErr}</p>
              )}

              {!ingredientsLoading && !ingredientsErr && (
                <div
                  style={{
                    display: "grid",
                    gap: 6,
                    maxHeight: 240,
                    overflow: "auto",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  {filteredIngredients.length === 0 && (
                    <div style={{ color: "#666" }}>No ingredients.</div>
                  )}
                  {filteredIngredients.map((ing) => (
                    <label
                      key={ing._id}
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ing._id)}
                        onChange={() => toggleSelection(ing._id)}
                      />
                      <span style={{ fontWeight: 600 }}>{ing.name}</span>
                      {Array.isArray(ing.synonyms) &&
                        ing.synonyms.length > 0 && (
                          <span style={{ color: "#777", fontSize: 12 }}>
                            (Synonyms: {ing.synonyms.join(", ")})
                          </span>
                        )}
                    </label>
                  ))}
                </div>
              )}
              <p style={{ color: "#666", fontSize: 12, marginTop: 8 }}>
                These ingredients will be treated as **avoid** for this dog.
              </p>
            </section>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: 10,
                border: "1px solid #222",
                background: "white",
                cursor: saving ? "not-allowed" : "pointer",
                width: "fit-content",
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            {ok && <p style={{ color: "green", margin: 0 }}>{ok}</p>}
            <p style={{ color: "#666", fontSize: 12, margin: 0 }}>
              You must be logged in. If you see “Not authenticated.”,{" "}
              <Link href="/login" style={{ textDecoration: "underline" }}>
                log in
              </Link>{" "}
              and try again.
            </p>
          </form>
        </>
      )}
    </main>
  );
}
