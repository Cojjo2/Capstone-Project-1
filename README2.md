---

## Quick Start (Local)

### 1) Backend
- Create `backend/.env` with:
  - `MONGO_URI` — your MongoDB Atlas connection string
  - `JWT_SECRET` — a long random string
- Start the API locally; it serves at `http://localhost:5000`

### 2) Frontend
- Create `frontend/.env.local` with:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`
- Start the Next.js dev server at `http://localhost:3000`

**Login flow:** visit `/register` to create a user, or `/login` to sign in.  
The JWT is saved in `localStorage` and attached by the frontend.

---

## Environment Variables

**backend/.env**

- `MONGO_URI` — MongoDB Atlas URI
- `JWT_SECRET` — long random secret for signing JWTs

**frontend/.env.local**

- `NEXT_PUBLIC_API_BASE_URL` — e.g. `http://localhost:5000/api` (dev) or your deployed API base URL in prod

> Do **not** commit real secrets.

---

## Scripts (What they do)

**Backend**

- `dev` — starts the API in development with auto-reload
- `start` — starts the API for production
- `test:unit` — Jest unit tests (DB init skipped)
- `test:smoke` — Node’s built-in test runner; hits a running API (port 5000)

**Frontend**

- `dev` — starts the Next.js dev server
- `build` — production build
- `start` — serve the production build

---

## Minimal API Overview (Dev)

**Base URL:** `http://localhost:5000/api`  
**Error shape:** `{ error: { message, code, details } }`

- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- **Dogs (auth):** `GET/POST /dogs`, `GET/PATCH/DELETE /dogs/:id`
- **Ingredients / Brands / Products (public reads; admin writes):**  
  `GET /ingredients`, `GET /ingredients/:id`, `GET /brands`, `GET /brands/:id`, `GET /products`, `GET /products/:id`
- **Favorites (auth):** `GET /favorites`, `POST /favorites`, `DELETE /favorites/:id`
- **Reviews (auth):** `GET /reviews?productId=...`, `POST /reviews`, `PATCH/DELETE /reviews/:id`
- **Stores & Inventory:** `GET /stores`, `GET /stores/:id`, `GET /inventory?productId=...` (admin can `POST/PATCH/DELETE`)

---

## Testing

**Backend**

- Unit tests (no DB connect): `backend/src/tests/health.test.js`
- Smoke tests (requires API running on `:5000`): `backend/src/tests/api.smoke.test.js`

**Frontend**

- Static header check: `frontend/tests/Header.test.mjs` (Node’s built-in test runner)

---

## Deployment

See **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** for step-by-step deploys:

- Backend → Render (set `MONGO_URI`, `JWT_SECRET`)
- Frontend → Render (set `NEXT_PUBLIC_API_BASE_URL` to your deployed API `/api`)

---

## Submission (Capstone)

1. Push all work to **`main`** and also create a **`dev`** branch from it.
2. Open a **Pull Request** from **`dev` → `main`** (do **not** merge).
3. Include the **live URLs** (above) in the PR description.

---

## Notes

- Per-dog “unsafe” badges and product filtering are computed client-side using each dog’s avoided ingredient IDs.
- Admin-only writes require a user with `role: "admin"`.
