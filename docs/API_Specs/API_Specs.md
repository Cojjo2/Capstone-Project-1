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

## 2) Resources 
> List the core resources you modeled. One line each.

- Users — registered dog owners
- Dogs — pets owned by users
- Products — dog foods, treats, chews, supplements
- Ingredients — individual ingredients linked to products (and dog restrictions)
- Stores — locations or online shops stocking products
- Brands — product manufacturers
- Reviews — user-written feedback on products
- Favorites — saved products by users
- Inventory — link between stores and products

## 3) Endpoints Overview (table)
| Resource  | Method | Path                  | Purpose (1 line)         | Auth?   | Notes |
|-----------|--------|-----------------------|--------------------------|---------|-------|
| Users     | GET    | /api/users            | List all users           | Admin   |       |
| Users     | GET    | /api/users/:id        | Get one user by id       | Yes     |       |
| Users     | POST   | /api/users            | Register new user        | No      | Validation required |
| Users     | PATCH  | /api/users/:id        | Update user profile      | Yes     | Partial updates |
| Users     | DELETE | /api/users/:id        | Delete user account      | Yes     | Soft delete |

| Dogs      | GET    | /api/dogs             | List all dogs            | Yes     | Filter by owner, breed, etc. |
| Dogs      | GET    | /api/dogs/:id         | Get one dog by id        | Yes     |       |
| Dogs      | POST   | /api/dogs             | Add a dog profile        | Yes     |       |
| Dogs      | PATCH  | /api/dogs/:id         | Update dog profile       | Yes     |       |
| Dogs      | DELETE | /api/dogs/:id         | Remove dog profile       | Yes     |       |

(Add similar rows later for Products, Ingredients, Stores, Brands, Reviews, Favorites, Inventory.)

## 4) Endpoint Specs 

### 4.1) Users (`/api/users`)

**4.1.1 GET /api/users** — List  
- Query params:  
  - `page` (int, optional, default 1)  
  - `limit` (int, optional, default 20, max 100)  
  - `sort` (string, e.g., `name` or `-createdAt`)  
- Auth: Admin only  
- Success 200 Response:
```json
{
  "total": 0,
  "page": 1,
  "pages": 0,
  "items": []
}

**4.1.2 GET /api/users/:id** — Retrieve one  
- Params:  
  - `id` (string, MongoDB ObjectId)  
- Auth: Yes (user can see own profile, admin can see any)  
- Success 200 Response:
```json
{ 
  "_id": "string",
  "name": "string",
  "email": "string",
  "createdAt": "2025-09-26T00:00:00.000Z"
}

**4.1.3 POST /api/users** — Register  
- Auth: No  
- Body (schema summary):
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
