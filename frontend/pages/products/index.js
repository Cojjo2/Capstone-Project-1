// pup-pantry/frontend/pages/products/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api, getToken } from "../../lib/api";

export default function ProductsPage() {
  const router = useRouter();
  const { brandId, ingredientId } = router.query;
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // app-level states
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // products
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [products, setProducts] = useState([]);

  // name resolution
  const [brandNames, setBrandNames] = useState({}); // brandId -> name

  // availability: productId -> { hasStock, minPrice, stores }
  const [availMap, setAvailMap] = useState({});
  const [availLoading, setAvailLoading] = useState(false);

  // UI controls
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("name-asc"); // 'name-asc' | 'name-desc' | 'stock-first' | 'price-asc'

  // dog filter (client-side; only when logged in)
  const [dogs, setDogs] = useState([]);
  const [dogId, setDogId] = useState("");
  const [avoidIds, setAvoidIds] = useState([]);
  const [avoidNames, setAvoidNames] = useState([]);
  const [avoidLoading, setAvoidLoading] = useState(false);
  const [dogsErr, setDogsErr] = useState("");
  const [dogsLoading, setDogsLoading] = useState(false);

  // mount + token
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const sync = () => setHasToken(!!getToken());
    sync();
    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  // Load products (respect brandId / ingredientId if present)
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

        // show products immediately
        setProducts(list);
        setLoading(false);

        // fetch brand names in the background
        const distinctBrandIds = [
          ...new Set(list.map((p) => p.brandId).filter(Boolean)),
        ];
        if (distinctBrandIds.length) {
          const brandPairs = await Promise.all(
            distinctBrandIds.map((id) =>
              api
                .get(`/brands/${id}`)
                .then((b) => [id, b?.name || id])
                .catch(() => [id, id])
            )
          );
          if (!cancelled) setBrandNames(Object.fromEntries(brandPairs));
        } else {
          setBrandNames({});
        }

        // fetch availability in the background
        setAvailLoading(true);
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
        if (!cancelled) setAvailMap(Object.fromEntries(availResults));
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load products");
        setLoading(false);
      } finally {
        if (!cancelled) setAvailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brandId, ingredientId]);

  // Load dogs only when logged in
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

  // hydrate saved dogId
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

  // when a dog is picked, load its restrictions
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

  // base list (apply dog restrictions)
  const dogFiltered = useMemo(() => {
    if (!hasToken || !avoidIds || avoidIds.length === 0) return products;
    const ban = new Set(avoidIds);
    return products.filter((p) => {
      const arr = Array.isArray(p?.ingredients) ? p.ingredients : [];
      return !arr.some((ing) => ban.has(ing));
    });
  }, [products, avoidIds, hasToken]);

  // search filter
  const searched = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return dogFiltered;
    return dogFiltered.filter((p) => (p?.name || "").toLowerCase().includes(q));
  }, [dogFiltered, searchTerm]);

  // in-stock filter (depends on availability)
  const stockFiltered = useMemo(() => {
    if (!inStockOnly) return searched;
    return searched.filter((p) => !!availMap[p._id]?.hasStock);
  }, [searched, inStockOnly, availMap]);

  // sorting
  const displayed = useMemo(() => {
    const list = [...stockFiltered];
    switch (sortKey) {
      case "name-desc":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || "") * -1);
        break;
      case "stock-first":
        list.sort((a, b) => {
          const as = availMap[a._id]?.hasStock ? 1 : 0;
          const bs = availMap[b._id]?.hasStock ? 1 : 0;
          return bs - as || (a.name || "").localeCompare(b.name || "");
        });
        break;
      case "price-asc":
        list.sort((a, b) => {
          const ap = availMap[a._id]?.minPrice ?? Infinity;
          const bp = availMap[b._id]?.minPrice ?? Infinity;
          if (ap === bp) return (a.name || "").localeCompare(b.name || "");
          return ap - bp;
        });
        break;
      case "name-asc":
      default:
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return list;
  }, [stockFiltered, sortKey, availMap]);

  function clearFilters() {
    const q = new URLSearchParams(router.query);
    q.delete("brandId");
    q.delete("ingredientId");
    router.push(`/products${q.toString() ? `?${q.toString()}` : ""}`);
  }

  return (
    <main
      style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}
    >
      <h1 style={{ marginBottom: 6 }}>Pup Pantry — Products</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        From <code>{API}/products</code>
      </p>

      {/* Dog picker (only while logged in) */}
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
                marginBottom: 8,
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
                onClick={() => {
                  setDogId("");
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("pp_selected_dog");
                  }
                }}
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

      {/* Query chips + controls row */}
      <div
        style={{
          margin: "10px 0 14px 0",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
        }}
      >
        {/* Filter chips */}
        <div
          style={{
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

        {/* Search + toggles */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name…"
              style={{
                width: "100%",
                padding: "0.5rem 2.2rem 0.5rem 0.6rem",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "1px solid #aaa",
                  borderRadius: 6,
                  background: "#fff",
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              disabled={availLoading}
            />
            <span>In stock only{availLoading ? " (loading…)" : ""}</span>
          </label>

          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <span>Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              style={{
                padding: "0.4rem 0.5rem",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            >
              <option value="name-asc">Name A→Z</option>
              <option value="name-desc">Name Z→A</option>
              <option value="stock-first">Stock first</option>
              <option value="price-asc">Price: low-high</option>
            </select>
          </label>
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && displayed.length === 0 && <p>No products found.</p>}

      {!loading && !err && displayed.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {displayed.map((p) => {
            const a = availMap[p._id] || {};
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
                  ) : availLoading ? (
                    <>Checking availability…</>
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
