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
```

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
```

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
```

**4.1.3 POST /api/users** — Register  
- Auth: No  
- Body (schema summary):
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**4.1.4 PATCH /api/users/:id** — Update profile  
- Auth: Yes (user can update own profile, admin can update any)  
- Body (allowed partial fields):
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**4.1.5 DELETE /api/users/:id** — Delete  
- Auth: Yes (user can delete own account, admin can delete any)  
- Behavior: Soft delete (mark as inactive)  
- Success 204 Response:  
  - No content returned  
- Errors:  
  - 401/403 (unauthorized/forbidden)  
  - 404 (user not found)  
  - 500 (server error)  

---

### 4.2) Dogs (`/api/dogs`)

**4.2.1 GET /api/dogs** — List  
- Query params:  
  - `ownerId` (string, optional) → filter dogs by user  
  - `breed` (string, optional)  
  - `page`, `limit`, `sort`  
- Auth: Yes (only logged-in users can list dogs)  
- Success 200 Response:
```json
{
  "total": 0,
  "page": 1,
  "pages": 0,
  "items": []
}
```

**4.2.2 GET /api/dogs/:id** — Retrieve one  
- Params:  
  - `id` (string, MongoDB ObjectId)  
- Auth: Yes (owner can view own dog, admin can view any)  
- Success 200 Response:
```json
{
  "_id": "string",
  "name": "string",
  "breed": "string",
  "age": 3,
  "ownerId": "string"
}
```

**4.2.3 POST /api/dogs** — Add a dog profile  
- Auth: Yes (must be logged in)  
- Body (schema summary):
```json
{
  "name": "string",
  "breed": "string",
  "age": 3,
  "restrictions": ["ingredientId1", "ingredientId2"]
}
```

**4.2.4 PATCH /api/dogs/:id** — Update dog profile  
- Auth: Yes (owner can update own dog, admin can update any)  
- Body (allowed partial fields):
```json
{
  "name": "string",
  "breed": "string",
  "age": 4,
  "restrictions": ["ingredientId3"]
}
```

**4.2.5 DELETE /api/dogs/:id** — Remove dog profile  
- Auth: Yes (owner can delete own dog, admin can delete any)  
- Behavior: Soft delete (mark as inactive)  
- Success 204 Response:  
  - No content returned  
- Errors:  
  - 401/403 (unauthorized/forbidden)  
  - 404 (dog not found)  
  - 500 (server error)  

---

### 4.3) Products (`/api/products`)

**4.3.1 GET /api/products** — List  
- Query params:  
  - `brandId` (string, optional) → filter by brand  
  - `storeId` (string, optional) → filter by store availability  
  - `ingredientId` (string, optional) → filter by ingredient  
  - `page`, `limit`, `sort`  
- Auth: No (public endpoint)  
- Success 200 Response:
```json
{
  "total": 0,
  "page": 1,
  "pages": 0,
  "items": []
}
```

**4.3.2 GET /api/products/:id** — Retrieve one  
- Params: `id` (string, ObjectId)  
- Auth: No  
- Success 200 Response:
```json
{
  "_id": "string",
  "name": "string",
  "brandId": "string",
  "ingredients": ["ingredientId1", "ingredientId2"],
  "stores": ["storeId1"],
  "createdAt": "2025-09-26T00:00:00.000Z"
}
```

**4.3.3 POST /api/products** — Create product  
- Auth: Admin  
- Body:
```json
{
  "name": "string",
  "brandId": "string",
  "ingredients": ["ingredientId1", "ingredientId2"]
}
```
- Success 201: Created product object  
- Errors: 400, 401/403, 500

**4.3.4 PATCH /api/products/:id** — Update product  
- Auth: Admin  
- Body: Partial fields  
- Success 200: Updated product object  
- Errors: 400, 401/403, 404, 500

**4.3.5 DELETE /api/products/:id** — Delete  
- Auth: Admin  
- Behavior: Hard delete  
- Success 204 No content  
- Errors: 401/403, 404, 500

---

### 4.4) Ingredients (`/api/ingredients`)

**4.4.1 GET /api/ingredients** — List  
- Auth: No  
- Success 200: Paginated list  

**4.4.2 GET /api/ingredients/:id** — Retrieve one  
- Auth: No  
- Success 200: Ingredient object  
- Errors: 404, 500

**4.4.3 POST /api/ingredients** — Create ingredient  
- Auth: Admin  
- Body: `{ "name": "string" }`  
- Success 201: Created ingredient  
- Errors: 400, 401/403, 500

**4.4.4 PATCH /api/ingredients/:id** — Update  
- Auth: Admin  
- Success 200: Updated ingredient  
- Errors: 400, 401/403, 404, 500

**4.4.5 DELETE /api/ingredients/:id** — Delete  
- Auth: Admin  
- Success 204  
- Errors: 401/403, 404, 500

---

### 4.5) Stores (`/api/stores`)

**4.5.1 GET /api/stores** — List  
- Auth: No  
- Query: `location`, `productId`  
- Success 200: Paginated list

**4.5.2 GET /api/stores/:id** — Retrieve one  
- Auth: No  
- Success 200: Store object  
- Errors: 404, 500

**4.5.3 POST /api/stores** — Create store  
- Auth: Admin  
- Body: `{ "name": "string", "location": "string" }`  
- Success 201: Created store

**4.5.4 PATCH /api/stores/:id** — Update  
- Auth: Admin  
- Success 200: Updated store

**4.5.5 DELETE /api/stores/:id** — Delete  
- Auth: Admin  
- Success 204

---

### 4.6) Brands (`/api/brands`)

- Same pattern as Ingredients (list, get one, create, update, delete)  
- Auth: Public for GET, Admin for POST/PATCH/DELETE  

---

### 4.7) Reviews (`/api/reviews`)

**4.7.1 GET /api/reviews** — List  
- Query: `productId`, `userId`  
- Auth: No  

**4.7.2 GET /api/reviews/:id** — Retrieve one  
- Auth: No  

**4.7.3 POST /api/reviews** — Create review  
- Auth: Yes  
- Body: `{ "productId": "string", "rating": 5, "comment": "text" }`  
- Success 201: Created review  

**4.7.4 PATCH /api/reviews/:id** — Update  
- Auth: Yes (review owner or admin)  

**4.7.5 DELETE /api/reviews/:id** — Delete  
- Auth: Yes (review owner or admin)

---

### 4.8) Favorites (`/api/favorites`)

**4.8.1 GET /api/favorites** — List user favorites  
- Auth: Yes (current user only)  

**4.8.2 POST /api/favorites** — Add favorite  
- Auth: Yes  
- Body: `{ "productId": "string" }`  

**4.8.3 DELETE /api/favorites/:id** — Remove favorite  
- Auth: Yes  

---

### 4.9) Inventory (`/api/inventory`)

**4.9.1 GET /api/inventory** — List inventory  
- Query: `storeId`, `productId`  
- Auth: No  

**4.9.2 POST /api/inventory** — Add product to store  
- Auth: Admin  
- Body: `{ "storeId": "string", "productId": "string", "stock": 10 }`  

**4.9.3 PATCH /api/inventory/:id** — Update inventory entry  
- Auth: Admin  

**4.9.4 DELETE /api/inventory/:id** — Remove entry  
- Auth: Admin  

---

## 5) Auth & Roles
- Roles: Guest, User, Admin  
- Guests: Can browse products, stores, brands, ingredients  
- Users: Can manage own dogs, favorites, reviews  
- Admin: Full access to all resources  

---

## 6) Validation Summary
- Users: email (unique, required), password (min 8 chars)  
- Dogs: name (required), breed (optional), age (number)  
- Products: name (required), brandId (required), ingredients (array)  
- Ingredients: name (unique, required)  
- Stores: name (required), location (required)  
- Reviews: rating (1–5 required), comment (optional)  
- Favorites: productId (required, unique per user)  
- Inventory: storeId + productId (unique pair)  

---

## 7) Error Codes
- `VALIDATION_ERROR` — bad input  
- `AUTH_REQUIRED` — login needed  
- `FORBIDDEN` — lacks permission  
- `NOT_FOUND` — missing resource  
- `CONFLICT` — unique/index conflict  
- `SERVER_ERROR` — unexpected  

---

## 8) Examples (cURL)

```bash
# List products
curl -s "http://localhost:3000/api/products?page=1&limit=10"

# Add a dog
curl -s -X POST "http://localhost:3000/api/dogs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "name": "Buddy", "breed": "Labrador", "age": 4 }'
```

---

## 9) Open Items / TBD
- Decide on JWT vs session auth  
- Confirm soft vs hard deletes for Dogs and Users  
- Pagination defaults across all resources  
