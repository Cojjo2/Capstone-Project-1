// pup-pantry/frontend/pages/products/[id].js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api, getToken } from "../../lib/api";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query; // product id
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // auth / hydration
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // product + helpers
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [ingredientNames, setIngredientNames] = useState([]); // display names

  // availability
  const [stores, setStores] = useState([]); // normalized inventory rows
  const [invLoading, setInvLoading] = useState(false);

  // dog selection + avoids
  const [dogId, setDogId] = useState("");
  const [dogName, setDogName] = useState("");
  const [avoidIds, setAvoidIds] = useState([]);
  const [avoidNames, setAvoidNames] = useState([]);
  const [avoidLoading, setAvoidLoading] = useState(false);

  // --- hydration + token ---
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const sync = () => setHasToken(!!getToken());
    sync();
    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  // --- load product ---
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const p = await api.get(`/products/${id}`);
        if (cancelled) return;

        setProduct(p);

        // brand name
        if (p?.brandId) {
          api
            .get(`/brands/${p.brandId}`)
            .then((b) => !cancelled && setBrandName(b?.name || ""))
            .catch(() => !cancelled && setBrandName(""));
        } else {
          setBrandName("");
        }

        // ingredient names
        const ingIds = Array.isArray(p?.ingredients) ? p.ingredients : [];
        const lookups = await Promise.all(
          ingIds.map((ingId) => api.get(`/ingredients/${ingId}`).catch(() => null))
        );
        const names = lookups.filter(Boolean).map((ing) => ing.name);
        if (!cancelled) setIngredientNames(names);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // --- availability ---
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setInvLoading(true);
      try {
        const res = await api.get(`/inventory?productId=${id}&limit=100`);
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        const normalized = items.map((r) => {
          const populated = r && typeof r.storeId === "object" && r.storeId !== null;
          const store = populated ? r.storeId : null;
          return {
            ...r,
            store,
            storeName: store?.name || (typeof r.storeId === "string" ? r.storeId : "Store"),
            storeUrl: store?.url || null,
          };
        });
        if (!cancelled) setStores(normalized);
      } catch {
        if (!cancelled) setStores([]);
      } finally {
        if (!cancelled) setInvLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // --- hydrate selected dog from localStorage & fetch avoids ---
  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("pp_selected_dog");
    setDogId(saved || "");
  }, [mounted]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasToken || !dogId) {
        if (!cancelled) {
          setDogName("");
          setAvoidIds([]);
          setAvoidNames([]);
        }
        return;
      }
      try {
        setAvoidLoading(true);
        const d = await api.get(`/dogs/${dogId}`);
        if (cancelled) return;
        setDogName(d?.name || dogId);
        const ids = Array.isArray(d?.restrictions) ? d.restrictions : [];
        setAvoidIds(ids);

        const lookups = await Promise.all(
          ids.map((ingId) => api.get(`/ingredients/${ingId}`).catch(() => null))
        );
        const names = lookups.filter(Boolean).map((ing) => ing.name);
        if (!cancelled) setAvoidNames(names);
      } catch {
        if (!cancelled) {
          setDogName(dogId);
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

  // --- safety check against dog's avoids ---
  const unsafeNames = useMemo(() => {
    if (!product || !avoidIds?.length) return [];
    const prodIng = new Set(Array.isArray(product.ingredients) ? product.ingredients : []);
    const hits = [];
    for (const idx in avoidIds) {
      const id = avoidIds[idx];
      if (prodIng.has(id)) {
        // find friendly name if we fetched it
        const nm =
          avoidNames[idx] ||
          ingredientNames.find((n) => n?.toLowerCase?.() === n?.toLowerCase?.()) ||
          "an avoided ingredient";
        hits.push(nm);
      }
    }
    // Deduplicate just in case
    return [...new Set(hits)];
  }, [product, avoidIds, avoidNames, ingredientNames]);

  const hasStock = stores.some((s) => !!s.inStock);
  const minPrice = useMemo(() => {
    const prices = stores.filter((s) => typeof s.price === "number").map((s) => s.price);
    return prices.length ? Math.min(...prices) : undefined;
  }, [stores]);

  // --- UI ---
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 6 }}>Pup Pantry — Product Detail</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        From <code>{API}/products/{id}</code>
      </p>

      <p>
        <Link href="/products" style={{ textDecoration: "underline" }}>
          ← Back to Products
        </Link>
      </p>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && product && (
        <article style={{ border: "1px solid #eee", borderRadius: 10, padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>{product.name}</h2>
          <div style={{ color: "#666", marginBottom: 6 }}>
            Brand: {brandName || (product.brandId || "N/A")}
          </div>

          {/* Per-dog safety banner */}
          {!hasToken ? (
            <div style={{ background: "#fff5e6", border: "1px solid #ffd9a6", padding: "0.6rem 0.8rem", borderRadius: 8, marginBottom: 8 }}>
              Dog check: log in to enable per-dog safety.{" "}
              <Link href="/login" style={{ textDecoration: "underline" }}>Login</Link>
            </div>
          ) : dogId ? (
            <div
              style={{
                background: unsafeNames.length ? "#ffecee" : "#eaffea",
                border: `1px solid ${unsafeNames.length ? "#ffb3bb" : "#a6e7a6"}`,
                padding: "0.6rem 0.8rem",
                borderRadius: 8,
                marginBottom: 8,
                color: unsafeNames.length ? "#b00020" : "#145a14",
                fontWeight: 600,
              }}
            >
              {avoidLoading ? (
                <>Checking safety for <em>{dogName}</em>…</>
              ) : unsafeNames.length ? (
                <>Not safe for <em>{dogName}</em>: contains {unsafeNames.join(", ")}.</>
              ) : (
                <>Safe for selected dog.</>
              )}
            </div>
          ) : (
            <div style={{ background: "#f7f7f7", border: "1px solid #ddd", padding: "0.6rem 0.8rem", borderRadius: 8, marginBottom: 8 }}>
              <span style={{ color: "#444" }}>No dog selected.</span>{" "}
              <Link href="/products" style={{ textDecoration: "underline" }}>Pick a dog on the Products page</Link>
            </div>
          )}

          <div style={{ marginBottom: 8 }}>
            <strong>Ingredients:</strong>{" "}
            {ingredientNames.length ? ingredientNames.join(", ") : "—"}
          </div>

          {product?.description && (
            <p style={{ marginTop: 6 }}>{product.description}</p>
          )}

          {/* Availability */}
          <section style={{ marginTop: 14 }}>
            <h3 style={{ marginBottom: 6 }}>Availability</h3>
            <p style={{ color: "#555", marginTop: 0 }}>
              From <code>{API}/inventory?productId={id}</code>
            </p>

            {invLoading && <p>Loading availability…</p>}

            {!invLoading && stores.length === 0 && (
              <p>No known availability. Check back later or visit the Stores page.</p>
            )}

            {!invLoading && stores.length > 0 && (
              <>
                {hasStock ? (
                  <div style={{ color: "#2a7", marginBottom: 8 }}>
                    In stock{typeof minPrice === "number" ? <> — from ${minPrice.toFixed(2)}</> : ""}
                  </div>
                ) : (
                  <div style={{ color: "#999", marginBottom: 8 }}>Currently out of stock</div>
                )}

                <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
                  {stores.map((s) => (
                    <li key={s._id} style={{ border: "1px solid #eee", borderRadius: 8, padding: "0.6rem 0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                        <div style={{ fontWeight: 600 }}>
                          {s.storeUrl ? (
                            <a href={s.storeUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                              {s.storeName || "Store"}
                            </a>
                          ) : (
                            s.storeName || "Store"
                          )}
                        </div>
                        <div style={{ color: s.inStock ? "#2a7" : "#999" }}>
                          {s.inStock ? "In stock" : "Out of stock"}
                          {typeof s.price === "number" && <> · ${s.price.toFixed(2)}</>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </article>
      )}
    </main>
  );
}
