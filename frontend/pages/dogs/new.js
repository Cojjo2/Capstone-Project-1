// pup-pantry/frontend/pages/dogs/new.js
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../../lib/api";

export default function NewDogPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    setLoading(true);
    try {
      const body = {
        name: name.trim(),
        ...(breed.trim() ? { breed: breed.trim() } : {}),
        ...(age !== "" ? { age: Number(age) } : {}),
      };
      await api.post("/dogs", body);
      setOk("Dog added. Redirecting…");
      setTimeout(() => router.push("/dogs"), 600);
    } catch (e) {
      setErr(e?.message || "Failed to add dog");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, Arial, sans-serif",
        maxWidth: 700,
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Add Dog</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        POST to <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/dogs</code>
      </p>

      <p>
        <Link href="/dogs" style={{ textDecoration: "underline" }}>
          ← Back to Dogs
        </Link>
      </p>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}
      >
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

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 10,
            border: "1px solid #222",
            background: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving…" : "Save"}
        </button>

        {err && <p style={{ color: "crimson", margin: 0 }}>{err}</p>}
        {ok && <p style={{ color: "green", margin: 0 }}>{ok}</p>}
        <p style={{ color: "#666", fontSize: 12, margin: 0 }}>
          You must be logged in. If you see “Not authenticated.”,{" "}
          <Link href="/login" style={{ textDecoration: "underline" }}>
            log in
          </Link>{" "}
          and try again.
        </p>
      </form>
    </main>
  );
}
