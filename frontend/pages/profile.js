// pup-pantry/frontend/pages/profile.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr("");
        const data = await api.get("/auth/me");
        const u = data?.user ?? data;
        if (mounted) {
          setUser(u || null);
          setForm((f) => ({
            ...f,
            name: u?.name || "",
            email: u?.email || "",
          }));
        }
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load profile");
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

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function startEdit() {
    setEditing(true);
    setOk("");
    setErr("");
    setForm((f) => ({
      ...f,
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    }));
  }

  function cancelEdit() {
    setEditing(false);
    setOk("");
    setErr("");
    setForm((f) => ({
      ...f,
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    }));
  }

  async function updateMe(body) {
    // Try /auth/me first, then fall back to /users/:id
    try {
      const res = await api.put("/auth/me", body);
      return res?.user ?? res;
    } catch (e) {
      // Accept 404/405/501 as “try the other route”
      const code = e?.status || e?.response?.status;
      if ([404, 405, 501].includes(code) && user?._id) {
        const res2 = await api.put(`/users/${user._id}`, body);
        return res2?.user ?? res2;
      }
      throw e;
    }
  }

  async function deleteMe() {
    try {
      await api.delete("/auth/me");
    } catch (e) {
      const code = e?.status || e?.response?.status;
      if ([404, 405, 501].includes(code) && user?._id) {
        await api.delete(`/users/${user._id}`);
      } else {
        throw e;
      }
    }
  }

  async function onSave(e) {
    e.preventDefault();
    if (!user?._id && !user?.id) return;

    if (form.password && form.password !== form.confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      setErr("");
      setOk("");

      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
      };
      if (form.password) body.password = form.password;

      const updated = await updateMe(body);
      setUser(updated);
      setOk("Profile updated successfully.");
      setEditing(false);
    } catch (e) {
      setErr(e?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!user) return;
    const confirmed = window.confirm(
      "This will permanently delete your account and associated data. Continue?"
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setErr("");
      setOk("");

      await deleteMe();

      // Clear token and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setOk("Account deleted.");
      router.replace("/");
    } catch (e) {
      setErr(e?.message || "Failed to delete account.");
    } finally {
      setDeleting(false);
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
      <h1 style={{ marginBottom: "0.5rem" }}>Pup Pantry — Profile</h1>
      <p style={{ margin: 0, color: "#555" }}>
        Data from <code>{process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me</code>
      </p>

      {loading && <p>Loading…</p>}
      {err && (
        <p style={{ color: "crimson", marginTop: "0.75rem" }}>
          {String(err)}
        </p>
      )}
      {ok && (
        <p
          style={{
            color: "green",
            marginTop: "0.75rem",
          }}
        >
          {ok}
        </p>
      )}

      {!loading && !err && user && (
        <div
          style={{
            marginTop: "1rem",
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: "1rem",
          }}
        >
          {!editing ? (
            <>
              <div>
                <strong>ID:</strong> {user._id || user.id}
              </div>
              <div>
                <strong>Name:</strong> {user.name}
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Role:</strong> {user.role}
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => router.push("/")}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                >
                  ← Home
                </button>

                <button
                  onClick={logout}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid #222",
                    background: "white",
                  }}
                >
                  Log out
                </button>

                <button
                  onClick={startEdit}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid #0b5ed7",
                    background: "#0b5ed7",
                    color: "white",
                  }}
                >
                  Edit Profile
                </button>

                <button
                  onClick={onDelete}
                  disabled={deleting}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid #dc3545",
                    background: "#dc3545",
                    color: "white",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? "Deleting…" : "Delete Account"}
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={onSave} style={{ marginTop: "0.25rem" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  htmlFor="name"
                  style={{ display: "block", fontSize: 14, marginBottom: 6 }}
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  placeholder="Your name"
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  htmlFor="email"
                  style={{ display: "block", fontSize: 14, marginBottom: 6 }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  htmlFor="password"
                  style={{ display: "block", fontSize: 14, marginBottom: 6 }}
                >
                  New Password <span style={{ color: "#777" }}>(optional)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  htmlFor="confirmPassword"
                  style={{ display: "block", fontSize: 14, marginBottom: 6 }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid #0b5ed7",
                    background: "#0b5ed7",
                    color: "white",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "white",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
