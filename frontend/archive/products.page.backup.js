// pup-pantry/frontend/pages/products.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api, getToken } from "../lib/api";

export default function ProductsPage() {
  const router = useRouter();
  const ingredientId = router.query.ingredientId || "";
  const brandId = router.query.brandId || "";

  // auth / hydration-safe
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // products
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // name resolution for chips
  const [ingredientName, setIngredientName] = useState("");
  const [brandChipName, setBrandChipName] = useState("");

  // dogs + dog filter (client-side) — only when logged in
  const [dogs, setDogs] = useState([]);
  const [dogsErr, setDogsErr] = useState("");
  const [dogsLoading, setDogsLoading] = useState(false);

  const [dogId, setDogId] = useState("");
  const [avoidIds, setAvoidIds] = useState([]);
  const [avoidNames, setAvoidNames] = useState([]);
  const [avoidLoading, setAvoidLoading] = useState(false);

  // map brandId -> brandName (for list display)
  const [brandMap, setBrandMap] = useState({});
  const [brandMapLoading, setBrandMapLoading] = useState(false);

  // mark mounted (for hydration safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // compute hasToken on client and react to changes
  useEffect(() => {
    if (!mounted) return;
    const check = () => setHasToken(!!getToken());
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [mounted]);

  // fetch products whenever query changes
  useEffect(() => {
    let mountedLocal = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const qs = new URLSearchParams({ limit: "100", sort: "name" });
        if (ingredientId) qs.set("ingredientId", String(ingredientId));
        if (brandId) qs.set("brandId", String(brandId));
        const data = await api.get(`/products?${qs.toString()}`);
        const list = Array.isArray(data?.items)
          ? data.items
          : data?.items || data || [];
        if (mountedLocal) setItems(list);

        // resolve chip names
        if (ingredientId) {
          try {
            const ing = await api.get(`/ingredients/${ingredientId}`);
            if (mountedLocal) setIngredientName(ing?.name || "");
          } catch {
            if (mountedLocal) setIngredientName("");
          }
        } else if (mountedLocal) setIngredientName("");

        if (brandId) {
          try {
            const b = await api.get(`/brands/${brandId}`);
            if (mountedLocal) setBrandChipName(b?.name || "");
          } catch {
            if (mountedLocal) setBrandChipName("");
          }
        } else if (mountedLocal) setBrandChipName("");
      } catch (e) {
        if (mountedLocal) setErr(e?.message || "Failed to load products");
      } finally {
        if (mountedLocal) setLoading(false);
      }
    })();
    return () => (mountedLocal = false);
  }, [ingredientId, brandId]);

  // load dogs only when logged in
  useEffect(() => {
    if (!mounted || !hasToken) return;
    let cancelled = false;
    (async () => {
      setDogsLoading(true);
      setDogsErr("");
      try {
        const res = await api.get("/dogs");
        if (cancelled) return;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : [];
        setDogs(list);
      } catch (e) {
        if (!cancelled) setDogsErr(e?.message || "Failed to load dogs");
      } finally {
        if (!cancelled) setDogsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, hasToken]);

  // hydrate dog selection from localStorage only when logged in
  useEffect(() => {
    if (!mounted) return;
    if (!hasToken) {
      setDogId("");
      setAvoidIds([]);
      setAvoidNames([]);
      return;
    }
    const saved = localStorage.getItem("pp_selected_dog");
    setDogId(saved || "");
  }, [mounted, hasToken]);

  // when a dog is picked, load its restrictions + resolve names (only when logged in)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasToken || !dogId) {
        if (!cancelled) {
          setAvoidIds([]);
          setAvoidNames([]);
        }
        return;
      }
      try {
        setAvoidLoading(true);
        const d = await api.get(`/dogs/${dogId}`);
        if (cancelled) return;
        const ids = Array.isArray(d?.restrictions) ? d.restrictions : [];
        setAvoidIds(ids);

        const lookups = await Promise.all(
          ids.map((ingId) => api.get(`/ingredients/${ingId}`).catch(() => null))
        );
        const names = lookups.filter(Boolean).map((ing) => ing.name);
        setAvoidNames(names);
      } catch {
        if (!cancelled) {
          setAvoidIds([]);
          setAvoidNames([]);
        }
      } finally {
        if (!cancelled) setAvoidLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasToken, dogId]);

  // client-side filter: hide products that contain any avoided ingredient
  const displayed = useMemo(() => {
    if (!hasToken || !avoidIds || avoidIds.length === 0) return items;
    const ban = new Set(avoidIds);
    return items.filter((p) => {
      const arr = Array.isArray(p?.ingredients) ? p.ingredients : [];
      return !arr.some((ing) => ban.has(ing));
    });
  }, [items, avoidIds, hasToken]);

  // build brand name map for the displayed list
  useEffect(() => {
    let mountedLocal = true;
    (async () => {
      try {
        setBrandMapLoading(true);
        const ids = [
          ...new Set(displayed.map((p) => p.brandId).filter(Boolean)),
        ];
        const results = await Promise.all(
          ids.map((id) => api.get(`/brands/${id}`).catch(() => null))
        );
        const map = {};
        results.forEach((b) => {
          if (b && b._id) map[b._id] = b.name || b._id;
        });
        if (mountedLocal) setBrandMap(map);
      } finally {
        if (mountedLocal) setBrandMapLoading(false);
      }
    })();
    return () => (mountedLocal = false);
  }, [displayed]);

  function clearIngredient() {
    const q = new URLSearchParams(router.query);
    q.delete("ingredientId");
    router.push(`/products${q.toString() ? `?${q.toString()}` : ""}`);
  }
  function clearBrand() {
    const q = new URLSearchParams(router.query);
    q.delete("brandId");
    router.push(`/products${q.toString() ? `?${q.toString()}` : ""}`);
  }
  function clearDog() {
    setDogId("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("pp_selected_dog");
    }
  }

  return (
    <main
      style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Products</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        From <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/products</code>
      </p>

      {/* Only show the dog picker while logged in */}
      {mounted && hasToken && (
        <>
          <div
            style={{
              marginTop: "0.75rem",
              marginBottom: "0.25rem",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Dog filter:</span>
              <select
                value={dogId}
                onChange={(e) => {
                  const v = e.target.value;
                  setDogId(v);
                  if (typeof window !== "undefined") {
                    if (v) localStorage.setItem("pp_selected_dog", v);
                    else localStorage.removeItem("pp_selected_dog");
                  }
                }}
                style={{
                  padding: "0.4rem 0.5rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">(none)</option>
                {dogs.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            {dogsErr && (
              <span style={{ color: "#999", fontSize: 12 }}>({dogsErr})</span>
            )}
            {dogsLoading && (
              <span style={{ color: "#999", fontSize: 12 }}>
                (loading dogs…)
              </span>
            )}
          </div>

          {/* Dog chip */}
          {dogId && (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #ddd",
                borderRadius: 8,
                display: "inline-flex",
                gap: 10,
                alignItems: "center",
                background: "#fafafa",
              }}
            >
              <span>
                <strong>Dog:</strong>{" "}
                {dogs.find((d) => d._id === dogId)?.name || dogId}
                {" · "}
                <em>avoiding:</em>{" "}
                {avoidLoading
                  ? "loading…"
                  : avoidNames.length > 0
                  ? avoidNames.join(", ")
                  : "none"}
              </span>
              <button
                onClick={clearDog}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: 6,
                  border: "1px solid #222",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </>
      )}

      {/* Ingredient & Brand chips */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: "0.5rem",
        }}
      >
        {ingredientId && (
          <div
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: 8,
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              background: "#fafafa",
            }}
          >
            <span>
              <strong>Filter:</strong>{" "}
              {ingredientName
                ? `Ingredient = ${ingredientName}`
                : `Ingredient ID = ${ingredientId}`}
            </span>
            <button
              onClick={clearIngredient}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 6,
                border: "1px solid #222",
                background: "white",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        )}
        {brandId && (
          <div
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: 8,
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              background: "#fafafa",
            }}
          >
            <span>
              <strong>Filter:</strong>{" "}
              {brandChipName
                ? `Brand = ${brandChipName}`
                : `Brand ID = ${brandId}`}
            </span>
            <button
              onClick={clearBrand}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 6,
                border: "1px solid #222",
                background: "white",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {displayed.length === 0 && <li>No products found.</li>}
          {displayed.map((p) => {
            const name = brandMap[p.brandId] || p.brandId;
            return (
              <li
                key={p._id}
                style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "0.5rem",
                  border: "1px solid #e5e5e5",
                  borderRadius: 10,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  <Link
                    href={`/products/${p._id}`}
                    style={{ textDecoration: "underline" }}
                  >
                    {p.name}
                  </Link>
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  Brand:{" "}
                  <Link
                    href={`/products?brandId=${p.brandId}`}
                    style={{ textDecoration: "underline" }}
                  >
                    {name}
                  </Link>
                  {brandMapLoading && " (…)"}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ marginTop: "1rem", color: "#666" }}>
        Tip: dog filter is client-side. Backend filtering can be added later
        (e.g., <code>excludeIngredientIds=[]</code>).
      </p>
    </main>
  );
}
