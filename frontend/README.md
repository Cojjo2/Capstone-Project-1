# Pup Pantry — Frontend

Next.js (Pages router) app for browsing products, brands, ingredients, stores, favorites, and per-dog safety.

- Framework: Next.js + React  
- State: local component state + `localStorage` (token, `pp_selected_dog`)  
- API base: `NEXT_PUBLIC_API_BASE_URL` (points to backend)

---

## Setup

1) **Node**: Use Node 18+ (Node 20/22 OK).  
2) **Env file**: Copy `.env.local.example` to `.env.local` and adjust if needed.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
