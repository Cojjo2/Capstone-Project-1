// pup-pantry/frontend/pages/products/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api, getToken } from "../../lib/api";

export default function ProductsPage() {
  const router = useRouter();
  const { brandId, ingredientId } = router.query;
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // --- auth / hydration ---
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const sync = () => setHasToken(!!getToken());
    sync();
    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  // --- data: products / brands / availability ---
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [products, setProducts] = useState([]);
  const [brandNames, setBrandNames] = useState({}); // brandId -> name

  // availability map: productId -> { hasStock, minPrice, stores }
  const [availMap, setAvailMap] = useState({});
  const [inStockOnly, setInStockOnly] = useState(false);

  // search + sort
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name-asc"); // name-asc | name-desc | stock | price-asc

  // --- dogs / dog filter (client-side) ---
  const [dogs, setDogs] = useState([]);
  const [dogsErr, setDogsErr] = useState("");
  const [dogsLoading, setDogsLoading] = useState(false);

  const [dogId, setDogId] = useState("");
  const [avoidIds, setAvoidIds] = useState([]);
  const [avoidNames, setAvoidNames] = useState([]);
  const [avoidLoading, setAvoidLoading] = useState(false);

  // --- load products (respect brandId / ingredientId) ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const qs = new URLSearchParams();
        if (brandId) qs.set("brandId", String(brandId));
        if (ingredientId) qs.set("ingredientId", String(ingredientId));
        qs.set("limit", "200");
        qs.set("sort", "name");

        const data = await api.get(`/products?${qs.toString()}`);
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        if (cancelled) return;
        setProducts(list);

        // fetch brand names (dedup)
        const distinctBrandIds = [
          ...new Set(list.map((p) => p.brandId).filter(Boolean)),
        ];
        const brandPairs = await Promise.all(
          distinctBrandIds.map((id) =>
            api
              .get(`/brands/${id}`)
              .then((b) => [id, b?.name || id])
              .catch(() => [id, id])
          )
        );
        if (cancelled) return;
        setBrandNames(Object.fromEntries(brandPairs));

        // fetch availability summary for each product
        const availResults = await Promise.all(
          list.map((p) =>
            api
              .get(`/inventory?productId=${p._id}&limit=100`)
              .then((res) => {
                const items = Array.isArray(res?.items)
                  ? res.items
                  : Array.isArray(res)
                  ? res
                  : [];
                if (items.length === 0) return [p._id, { hasStock: false }];
                const normalized = items.map((r) => {
                  const populated =
                    r && typeof r.storeId === "object" && r.storeId !== null;
                  const store = populated ? r.storeId : null;
                  return {
                    ...r,
                    store,
                    storeName:
                      store?.name ||
                      (typeof r.storeId === "string" ? r.storeId : "Store"),
                    storeUrl: store?.url || null,
                  };
                });
                const hasStock = normalized.some((r) => !!r.inStock);
                const prices = normalized
                  .filter((r) => typeof r.price === "number")
                  .map((r) => r.price);
                const minPrice = prices.length
                  ? Math.min(...prices)
                  : undefined;
                return [p._id, { hasStock, minPrice, stores: normalized }];
              })
              .catch(() => [p._id, { hasStock: false }])
          )
        );
        if (cancelled) return;
        setAvailMap(Object.fromEntries(availResults));
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brandId, ingredientId]);

  // --- load dogs when logged in ---
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

  // --- hydrate dog selection from localStorage when logged in ---
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

  // --- when a dog is picked, load its restrictions + resolve names (when logged in) ---
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

  // --- filtering pipeline ---
  const byDog = useMemo(() => {
    if (!hasToken || !avoidIds?.length) return products;
    const ban = new Set(avoidIds);
    return products.filter((p) => {
      const arr = Array.isArray(p?.ingredients) ? p.ingredients : [];
      return !arr.some((ing) => ban.has(ing));
    });
  }, [products, avoidIds, hasToken]);

  const byStock = useMemo(() => {
    if (!inStockOnly) return byDog;
    return byDog.filter((p) => !!availMap[p._id]?.hasStock);
  }, [byDog, inStockOnly, availMap]);

  const bySearch = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return byStock;
    return byStock.filter((p) => (p.name || "").toLowerCase().includes(term));
  }, [byStock, q]);

  const displayed = useMemo(() => {
    const list = [...bySearch];
    switch (sort) {
      case "name-desc":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || "") * -1);
        break;
      case "stock":
        list.sort((a, b) => {
          const aHas = !!availMap[a._id]?.hasStock;
          const bHas = !!availMap[b._id]?.hasStock;
          if (aHas !== bHas) return aHas ? -1 : 1; // stock first
          return (a.name || "").localeCompare(b.name || "");
        });
        break;
      case "price-asc":
        list.sort((a, b) => {
          const pa = availMap[a._id]?.minPrice ?? Infinity;
          const pb = availMap[b._id]?.minPrice ?? Infinity;
          if (pa !== pb) return pa - pb;
          return (a.name || "").localeCompare(b.name || "");
        });
        break;
      case "name-asc":
      default:
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return list;
  }, [bySearch, sort, availMap]);

  // --- helpers ---
  function clearFilters() {
    const q = new URLSearchParams(router.query);
    q.delete("brandId");
    q.delete("ingredientId");
    router.push(`/products${q.toString() ? `?${q.toString()}` : ""}`);
  }
  function clearDog() {
    setDogId("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("pp_selected_dog");
    }
  }

  // --- UI ---
  return (
    <main
      style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}
    >
      <h1 style={{ marginBottom: 6 }}>Pup Pantry — Products</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        From <code>{API}/products</code>
      </p>

      {/* Dog picker (only when logged in) */}
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
                  : avoidNames.length
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

      {/* Active query filters (brand/ingredient) */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {brandId || ingredientId ? (
          <>
            <div
              style={{
                background: "#f5f5f5",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              {brandId && (
                <>
                  Filter: <strong>Brand</strong> = <code>{brandId}</code>
                </>
              )}
              {brandId && ingredientId && " · "}
              {ingredientId && (
                <>
                  Filter: <strong>Ingredient</strong> ={" "}
                  <code>{ingredientId}</code>
                </>
              )}
            </div>
            <button
              onClick={clearFilters}
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                border: "1px solid #222",
                background: "white",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </>
        ) : (
          <div style={{ color: "#777" }}>No query filters applied.</div>
        )}
      </div>

      {/* Search + controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 10,
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            style={{
              padding: "0.45rem 2rem 0.45rem 0.6rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              minWidth: 230,
            }}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              title="Clear search"
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          <span>In stock only</span>
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "0.4rem 0.5rem",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          >
            <option value="name-asc">Name A→Z</option>
            <option value="name-desc">Name Z→A</option>
            <option value="stock">Stock first</option>
            <option value="price-asc">Price: low-high</option>
          </select>
        </label>
      </div>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && displayed.length === 0 && <p>No products found.</p>}

      {!loading && !err && displayed.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gap: 12,
            marginTop: 12,
          }}
        >
          {displayed.map((p) => {
            const a = availMap[p._id] || { hasStock: false };
            return (
              <li
                key={p._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: "0.8rem 1rem",
                }}
              >
                <h3 style={{ margin: "0 0 4px 0" }}>
                  <Link
                    href={`/products/${p._id}`}
                    style={{ textDecoration: "underline" }}
                  >
                    {p.name}
                  </Link>
                </h3>
                <div style={{ color: "#666", marginBottom: 4 }}>
                  Brand:{" "}
                  {p.brandId ? (
                    <Link
                      href={`/products?brandId=${p.brandId}`}
                      style={{ textDecoration: "underline" }}
                    >
                      {brandNames[p.brandId] || p.brandId}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div style={{ color: a.hasStock ? "#2a7" : "#999" }}>
                  {a.hasStock ? (
                    <>
                      In stock
                      {typeof a.minPrice === "number" ? (
                        <> — from ${a.minPrice.toFixed(2)}</>
                      ) : (
                        ""
                      )}
                    </>
                  ) : (
                    <>No availability</>
                  )}
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
