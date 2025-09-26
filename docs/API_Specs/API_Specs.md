# API Specifications — Capstone Step 5

> Status: DRAFT  
> Purpose: Define how the front-end will talk to the back-end (routes, params, payloads, responses, errors).

## 0) Meta
- Project: Pup Pantry
- Repo: https://github.com/Cojjo2/Capstone-Project-1
- Document Owner: Ross Cozzo
- Last Updated: 9/26/2025

## 1) Base Conventions
- Base URL (dev): http://localhost:3000/api
- Base URL (prod): <TBD>
- Format: JSON (UTF-8)
- Versioning: `/api/v1` (TBD if needed)
- Auth Method: <TBD> (e.g., JWT bearer)
- Date/Time: ISO 8601 (UTC)
- Pagination: `page` (1-based), `limit` (default 20, max 100) — both optional
- Sorting: `sort` (e.g., `sort=field` or `sort=-field` for desc)
- Filtering: Query params on resource fields (documented per endpoint)
- Error shape (standard):
```json
{
  "error": {
    "message": "Human-readable message",
    "code": "ERROR_CODE",
    "details": { "field": "reason" }
  }
}

