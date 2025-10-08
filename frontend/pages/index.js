// pup-pantry/frontend/pages/index.js
import Link from "next/link";

export default function HomePage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Home</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Welcome! Choose where to go:
      </p>

      <ul style={{ lineHeight: 1.9 }}>
        <li><Link href="/products" style={{ textDecoration: "underline" }}>Browse products</Link></li>
        <li><Link href="/brands" style={{ textDecoration: "underline" }}>Browse brands</Link></li>
        <li><Link href="/ingredients" style={{ textDecoration: "underline" }}>Browse ingredients</Link></li>
        <li><Link href="/stores" style={{ textDecoration: "underline" }}>Stores</Link></li>
        <li><Link href="/favorites" style={{ textDecoration: "underline" }}>Favorites</Link></li>
        <li><Link href="/dogs" style={{ textDecoration: "underline" }}>Your dogs</Link></li>
        <li><Link href="/profile" style={{ textDecoration: "underline" }}>Your profile</Link></li>
        <li>
          <Link href="/login" style={{ textDecoration: "underline" }}>Login</Link>
          {" · "}
          <Link href="/register" style={{ textDecoration: "underline" }}>Register</Link>
        </li>
      </ul>

      <p style={{ marginTop: "1rem", color: "#666" }}>
        API: <code>{API}</code>
      </p>
    </main>
  );
}
