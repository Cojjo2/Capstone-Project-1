// pup-pantry/frontend/pages/admin/store-add.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getToken } from "../../lib/api";

export default function AdminStoreAddPage() {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [meErr, setMeErr] = useState("");

  // ---- Store form state ----
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // ---- Inventory form state ----
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [invStoreId, setInvStoreId] = useState("");
  const [invProductId, setInvProductId] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [invBusy, setInvBusy] = useState(false);
  const [invMsg, setInvMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth + admin role (client only)
  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (!token) {
      setAuthed(false);
      setIsAdmin(false);
      return;
    }
    (async () => {
      try {
        const { user } = await api.get("/auth/me");
        setAuthed(true);
        setIsAdmin(user?.role === "admin");
        setMeErr("");
      } catch (e) {
        setAuthed(false);
        setIsAdmin(false);
        setMeErr(e?.message || "Failed to verify session");
      }
    })();
  }, [mounted]);

  // Load stores + products for the inventory form (only after we know we're authed admin)
  useEffect(() => {
    if (!mounted || !authed || !isAdmin) return;
    let cancelled = false;

    (async () => {
      // stores
      try {
        const data = await api.get(`/stores?limit=200&sort=name`);
        const list = Array.isArray(data?.items)
          ? data.items
          : data?.items || data || [];
        if (!cancelled) {
          setStores(list);
          if (!invStoreId && list.length > 0) setInvStoreId(list[0]._id);
        }
      } catch {
        if (!cancelled) setStores([]);
      }

      // products
      try {
        const pdata = await api.get(`/products?limit=500&sort=name`);
        const plist = Array.isArray(pdata?.items)
          ? pdata.items
          : pdata?.items || pdata || [];
        if (!cancelled) {
          setProducts(plist);
          if (!invProductId && plist.length > 0) setInvProductId(plist[0]._id);
        }
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, authed, isAdmin]);

  // ---- Create Store ----
  async function onCreateStore(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      if (!name.trim()) throw new Error("Store name is required.");
      const payload = {
        name: name.trim(),
        url: url.trim() || undefined,
        location: location.trim() || undefined,
      };
      const created = await api.post("/stores", payload);
      setMsg(`Store created: ${created?.name} (id: ${created?._id})`);
      setName("");
      setUrl("");
      setLocation("");

      // also update the stores list so it appears in inventory form
      try {
        const data = await api.get(`/stores?limit=200&sort=name`);
        const list = Array.isArray(data?.items)
          ? data.items
          : data?.items || data || [];
        setStores(list);
        // if nothing selected yet, select this new one
        if (!invStoreId && created?._id) setInvStoreId(created._id);
      } catch {
        /* ignore */
      }
    } catch (e) {
      setMsg(e?.message || "Failed to create store.");
    } finally {
      setBusy(false);
    }
  }

  // ---- Create Inventory (availability) ----
  async function onCreateInventory(e) {
    e.preventDefault();
    setInvMsg("");
    setInvBusy(true);
    try {
      if (!invStoreId) throw new Error("Pick a store.");
      if (!invProductId) throw new Error("Pick a product.");
      const val = price === "" ? undefined : Number(price);
      if (price !== "" && (isNaN(val) || val < 0))
        throw new Error("Price must be a non-negative number.");
      const payload = {
        storeId: invStoreId,
        productId: invProductId,
        price: val,
        inStock: !!inStock,
      };
      const created = await api.post("/inventory", payload);
      const storeName =
        stores.find((s) => s._id === invStoreId)?.name || invStoreId;
      const productName =
        products.find((p) => p._id === invProductId)?.name || invProductId;
      setInvMsg(
        `Inventory created for "${productName}" @ "${storeName}" (id: ${created?._id})`
      );
      // leave selections as-is so admin can add more quickly
    } catch (e) {
      setInvMsg(e?.message || "Failed to create inventory.");
    } finally {
      setInvBusy(false);
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, Arial, sans-serif",
        maxWidth: 720,
      }}
    >
      <h1 style={{ marginBottom: 8 }}>
        Pup Pantry — Admin: Add Store & Availability
      </h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Stores: <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/stores</code> ·
        Inventory: <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/inventory</code>
      </p>

      <p style={{ marginTop: 0 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Back to Home
        </Link>{" "}
        |{" "}
        <Link href="/stores" style={{ textDecoration: "underline" }}>
          View Stores
        </Link>
      </p>

      {!mounted && <p>Loading…</p>}

      {mounted && !getToken() && (
        <p style={{ color: "#666" }}>
          You must{" "}
          <Link href="/login" style={{ textDecoration: "underline" }}>
            log in
          </Link>{" "}
          as an admin to use this page.
        </p>
      )}

      {mounted && getToken() && !authed && (
        <p style={{ color: "crimson" }}>
          {meErr || "Session check failed. Try logging in again."}
        </p>
      )}

      {mounted && authed && !isAdmin && (
        <p style={{ color: "crimson" }}>
          Admin only. Your account lacks permission.
        </p>
      )}

      {mounted && authed && isAdmin && (
        <>
          {/* --- Create Store --- */}
          <section style={{ marginTop: 12 }}>
            <h2 style={{ marginBottom: 8 }}>Create a Store</h2>
            <form onSubmit={onCreateStore} style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Store Name *</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g., "Chewy"'
                  style={{
                    padding: "0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Store URL</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.chewy.com"
                  style={{
                    padding: "0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Location</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='e.g., "Online" or "Tampa, FL"'
                  style={{
                    padding: "0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                style={{
                  width: "fit-content",
                  padding: "0.6rem 0.9rem",
                  borderRadius: 8,
                  border: "1px solid #222",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                {busy ? "Creating…" : "Create store"}
              </button>

              {msg && (
                <p
                  style={{
                    margin: 0,
                    color: msg.includes("Failed") ? "crimson" : "#2a7",
                  }}
                >
                  {msg}
                </p>
              )}
            </form>
          </section>

          {/* --- Create Inventory --- */}
          <section style={{ marginTop: 28 }}>
            <h2 style={{ marginBottom: 8 }}>Add Availability (Inventory)</h2>
            <form
              onSubmit={onCreateInventory}
              style={{ display: "grid", gap: 12 }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span>Store *</span>
                <select
                  value={invStoreId}
                  onChange={(e) => setInvStoreId(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                >
                  {stores.length === 0 && (
                    <option value="">(no stores yet)</option>
                  )}
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Product *</span>
                <select
                  value={invProductId}
                  onChange={(e) => setInvProductId(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                >
                  {products.length === 0 && (
                    <option value="">(no products)</option>
                  )}
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Price (USD)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 59.99"
                  style={{
                    padding: "0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                <span>In stock</span>
              </label>

              <button
                type="submit"
                disabled={
                  invBusy || stores.length === 0 || products.length === 0
                }
                style={{
                  width: "fit-content",
                  padding: "0.6rem 0.9rem",
                  borderRadius: 8,
                  border: "1px solid #222",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                {invBusy ? "Adding…" : "Add availability"}
              </button>

              {invMsg && (
                <p
                  style={{
                    margin: 0,
                    color: invMsg.includes("Failed") ? "crimson" : "#2a7",
                  }}
                >
                  {invMsg}{" "}
                  {invProductId && (
                    <>
                      · View{" "}
                      <Link
                        href={`/products/${invProductId}`}
                        style={{ textDecoration: "underline" }}
                      >
                        product
                      </Link>
                    </>
                  )}
                </p>
              )}
            </form>
          </section>
        </>
      )}
    </main>
  );
}
