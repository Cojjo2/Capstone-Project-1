# Pup Pantry — Deployment Guide

This guide shows how to deploy the **backend (Render)** and **frontend (Vercel)**.

---

## Prerequisites

- A GitHub repo containing this project (with `/backend` and `/frontend` at the root).
- A MongoDB Atlas connection string.
- A long random `JWT_SECRET`.

---

## 1) Deploy the Backend (Render)

1. Go to **render.com** → **New** → **Web Service** → choose your GitHub repo.
2. Set **Root Directory** to `backend`.
3. Use these settings:
   - **Runtime:** Node
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
   - **Node Version:** 22.x (or your local Node 22)
4. Add **Environment Variables**:
   - `MONGO_URI` → your MongoDB Atlas URI
   - `JWT_SECRET` → a long random string
5. (Optional) **Health Check Path:** `/api/health`
6. Deploy and note your URL, e.g. `https://YOUR-BACKEND.onrender.com`.

**Quick check**
- `https://YOUR-BACKEND.onrender.com/api/health` → should return `{ "status": "ok", ... }`
- `https://YOUR-BACKEND.onrender.com/api/ingredients` → should return a JSON list

---

## 2) Deploy the Frontend (Vercel)

1. Go to **vercel.com** → **Add New…** → **Project** → import your repo.
2. Set **Root Directory** to `frontend`.
3. Vercel will auto-detect **Next.js (Pages)**.
4. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://YOUR-BACKEND.onrender.com/api`
5. Keep defaults:
   - **Build Command:** `next build`
   - **Output:** `.next`
6. Deploy and open your Vercel domain.

**Quick check**
- Home page loads.
- `/products` shows products from your deployed API.
- `/register` and `/login` work (token saved in `localStorage`).

---

## 3) (Optional) Frontend on Render (SSR)

If you prefer Render for the frontend (server-side rendering):

- **New** → **Web Service**
- **Root Directory:** `frontend`
- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Env:** `NEXT_PUBLIC_API_BASE_URL = https://YOUR-BACKEND.onrender.com/api`

> Static export is **not** recommended here because the app relies on live server data.

---

## Troubleshooting

- **CORS:** Backend uses `cors()` permissively; if you later restrict it, add your frontend domain.
- **JWT issues:** After deploy, log out and log back in so the token is fresh for the new domain.
- **Mongo Atlas IP:** Ensure Render can reach Atlas (allowlist IPs or “allow from anywhere” while testing).

---

## Submission Checklist

- ✅ Backend live on Render
- ✅ Frontend live on Vercel (or Render)
- ✅ `NEXT_PUBLIC_API_BASE_URL` points to the deployed backend `/api`
- ✅ `README.md` updated with live URLs
- ✅ PR opened from `dev` → `main` (do **not** merge)
