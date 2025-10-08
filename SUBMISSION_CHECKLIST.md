# Pup Pantry — Submission Checklist

Use this checklist to verify everything required for the Capstone submission is present and working.

## ✅ Project Basics
- [ ] Repo contains both folders at the root:
  - `backend/`
  - `frontend/`
- [ ] Root `README.md` explains local setup, scripts, API overview, testing, and links to deployment guide.
- [ ] `DEPLOYMENT.md` provides clear, step-by-step deploy instructions.

## ✅ Environment Files (examples, not secrets)
- [ ] `backend/.env.example` includes:
  - `MONGO_URI`
  - `JWT_SECRET`
  - (optional) `PORT`
- [ ] `frontend/.env.local.example` includes:
  - `NEXT_PUBLIC_API_BASE_URL`

## ✅ Backend (local)
- [ ] `npm run dev` works (API at `http://localhost:5000`)
- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Smoke tests pass (with API running): `npm run test:smoke`

## ✅ Frontend (local)
- [ ] `npm run dev` works (app at `http://localhost:3000`)
- [ ] Can register/login; token stored in `localStorage`
- [ ] Pages load: Products, Brands, Ingredients, Stores, Favorites, Dogs, Profile
- [ ] Dog filter works on Products page (client-side)
- [ ] Header test passes (from `frontend`):
  - `node --test ./tests/Header.test.mjs`

## ✅ Deployment
- [ ] Backend deployed (Render)
  - URL: `https://YOUR-BACKEND.onrender.com`
  - `GET /api/health` OK
  - Env set: `MONGO_URI`, `JWT_SECRET`
- [ ] Frontend deployed (Vercel or Render)
  - URL: `https://YOUR-FRONTEND.vercel.app`
  - Env set: `NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api`
  - Products/Ingredients/Brands load from deployed API

## ✅ Pull Request
- [ ] Branch `dev` pushed
- [ ] Open PR: `dev` → `main` (do **not** merge)
- [ ] PR includes deployed URLs
- [ ] PR template auto-filled (from `.github/pull_request_template.md`)

## ✅ Final Notes
- Admin-only writes require a user whose `role` is `"admin"`.
- Per-dog safety is computed client-side from the dog’s avoided ingredient IDs.

