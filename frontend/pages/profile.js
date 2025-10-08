// pup-pantry/frontend/pages/profile.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get("/auth/me");
        if (mounted) setUser(data.user || null);
      } catch (e) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif", maxWidth: 700 }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Profile</h1>
      <p style={{ margin: 0, color: "#555" }}>
        Data from <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me</code>
      </p>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && user && (
        <div style={{ marginTop: "1rem", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem" }}>
          <div><strong>ID:</strong> {user._id}</div>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <button onClick={() => router.push("/")} style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #ddd" }}>
              ← Home
            </button>
            <button onClick={logout} style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #222", background: "white" }}>
              Log out
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
