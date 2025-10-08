// pup-pantry/frontend/pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("testuser@example.com"); // prefilled for convenience
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    setLoading(true);
    try {
      const data = await api.post("/auth/login", { email, password });
      const token = data?.token;

      if (!token) throw new Error("No token returned from server.");

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        // Notify same-tab listeners (Header) immediately
        window.dispatchEvent(new Event("pp-auth"));
        // Also ping 'storage' to update any storage listeners
        window.dispatchEvent(new Event("storage"));
      }

      setOk("Logged in. Redirecting…");
      // Replace so Back doesn't return to login
      router.replace("/");
    } catch (error) {
      setErr(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, Arial, sans-serif",
        maxWidth: 500,
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Login</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        This will request a token from{" "}
        <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login</code> and store
        it in <code>localStorage</code>.
      </p>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}
      >
        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "0.5rem",
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "0.5rem",
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 10,
            border: "1px solid #222",
            background: loading ? "#f1f1f1" : "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {err && <p style={{ color: "crimson", margin: 0 }}>{err}</p>}
        {ok && <p style={{ color: "green", margin: 0 }}>{ok}</p>}
      </form>

      <p style={{ marginTop: "1rem" }}>
        <a href="/" style={{ textDecoration: "underline" }}>
          ← Back to Home
        </a>
      </p>
    </main>
  );
}
