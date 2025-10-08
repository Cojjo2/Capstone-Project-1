// pup-pantry/frontend/components/Header.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function getToken() {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

export default function Header() {
  const router = useRouter();

  // Hydration-safe auth state
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const sync = () => setHasToken(!!getToken());
    sync();

    // reflect login/logout from other tabs too
    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("pp_selected_dog");
    } catch {}
    setHasToken(false);
    router.push("/login");
  };

  return (
    <header
      style={{
        borderBottom: "1px solid #eee",
        padding: "0.75rem 1rem",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        fontFamily: "system-ui, Arial, sans-serif",
        flexWrap: "wrap",
      }}
    >
      {/* Left: brand + primary nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          flex: "1 1 auto",
          minWidth: 240,
        }}
      >
        <Link href="/" style={{ fontWeight: 700 }}>Pup Pantry</Link>

        <nav style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/stores">Stores</Link>
          <Link href="/brands">Brands</Link>
          <Link href="/ingredients">Ingredients</Link>
          <Link href="/favorites">Favorites</Link>
          <Link href="/dogs">Dogs</Link>
          <Link href="/profile">Profile</Link>
        </nav>
      </div>

      {/* Right: auth controls + API hint */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          marginLeft: "auto",
          minWidth: 220,
        }}
      >
        {mounted && (
          hasToken ? (
            <button
              onClick={handleLogout}
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                border: "1px solid #222",
                background: "white",
                cursor: "pointer",
              }}
              aria-label="Log out"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )
        )}

        <div style={{ width: "100%", textAlign: "right", fontSize: 12, color: "#666" }}>
          API: <code>{process.env.NEXT_PUBLIC_API_BASE_URL}</code>
        </div>
      </div>
    </header>
  );
}
