// pup-pantry/frontend/pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      if (!name.trim()) throw new Error("Name is required.");
      if (!email.trim()) throw new Error("Email is required.");
      if (!pw || pw.length < 8)
        throw new Error("Password must be at least 8 characters.");
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: pw,
      });
      if (res?.token) {
        localStorage.setItem("token", res.token);
        setMsg("Account created. Redirecting…");
        // small pause so users can see the message, then go to profile
        setTimeout(() => router.push("/profile"), 300);
      } else {
        throw new Error("Unexpected response.");
      }
    } catch (e) {
      setMsg(e?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, Arial, sans-serif",
        maxWidth: 440,
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Pup Pantry — Register</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Creates an account via{" "}
        <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register</code> and
        stores the token in <code>localStorage</code>.
      </p>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 12, marginTop: 12 }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Doe"
            style={{
              padding: "0.6rem",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              padding: "0.6rem",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password (min 8 chars)</span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
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
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            border: "1px solid #222",
            background: "white",
            cursor: busy ? "not-allowed" : "pointer",
            width: "fit-content",
          }}
        >
          {busy ? "Creating…" : "Create account"}
        </button>

        {msg && (
          <p
            style={{
              margin: 0,
              color: msg.includes("failed") ? "crimson" : "#2a7",
            }}
          >
            {msg}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ textDecoration: "underline" }}>
          Log in
        </Link>
      </p>

      <p style={{ marginTop: 8 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Back to Home
        </Link>
      </p>
    </main>
  );
}
