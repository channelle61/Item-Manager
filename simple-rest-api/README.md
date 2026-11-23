# Simple REST API (Node.js + Express.js)

A small, dependency-light REST API for **items** using an in-memory array. It works immediately — no database setup required.

## Folder Structure

```text
simple-rest-api/
├── controllers/
│   └── itemController.js   # CRUD handlers
├── middleware/
│   ├── validateItem.js     # id + body validation (400)
│   └── errorHandler.js     # 404 + global 500 handlers
├── routes/
│   └── itemRoutes.js       # RESTful route definitions
├── data/
│   └── items.js            # in-memory sample items
├── server.js               # app setup and server start
├── package.json
└── README.md
```

## Setup

Requirements: Node.js 18+ and npm.

```bash
cd simple-rest-api
npm install
npm start
```

Expected output:

```text
Server is running at http://localhost:3000
Items API: http://localhost:3000/api/items
```

Set `PORT` to use a different port, for example: `PORT=4000 npm start` 


Data is in memory only: created/updated/deleted items are lost when the server restarts.

## API Overview

Base URL: `http://localhost:3000/api/items`

| Method | Endpoint | Description | Success |
| ------ | -------- | ----------- | ------- |
| GET | `/api/items` | List all items | `200 OK` |
| GET | `/api/items/:id` | Get one item by id | `200 OK` |
| POST | `/api/items` | Create a new item | `201 Created` |
| PUT | `/api/items/:id` | Update an existing item | `200 OK` |
| DELETE | `/api/items/:id` | Delete an item | `200 OK` |

Every response is JSON. Success responses use `{ "success": true, ..., "data": ... }`; errors use `{ "success": false, "error": "..." }`.

### Validation rules

- `:id` must be a positive integer (e.g. `1`, `42`); otherwise `400`.
- POST body must contain `name` (non-empty string) and `price` (positive number).
- PUT body must contain at least one of `name` or `price`, with the same rules as above. Omitted fields stay unchanged.
- Missing ids return `404`; unknown routes return `404`; unexpected errors return `500`.

Sample starting data:

```json
[
  { "id": 1, "name": "Laptop", "price": 999.99 },
  { "id": 2, "name": "Wireless Mouse", "price": 24.5 },
  { "id": 3, "name": "Mechanical Keyboard", "price": 89 },
  { "id": 4, "name": "USB-C Hub", "price": 39.99 },
  { "id": 5, "name": "27-inch Monitor", "price": 249 }
]
```


### 2. Positive test cases

#### A. Get all items

- **Method:** `GET`
- **URL:** `{{baseUrl}}`
- **Body:** none
- **Expected status:** `200 OK`
- **Expected response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    { "id": 1, "name": "Laptop", "price": 999.99 }
  ]
}
```

#### B. Get one item

- **Method:** `GET`
- **URL:** `{{baseUrl}}/1`
- **Body:** none
- **Expected status:** `200 OK`
- **Expected response:**

```json
{
  "success": true,
  "data": { "id": 1, "name": "Laptop", "price": 999.99 }
}
```

#### C. Create an item

- **Method:** `POST`
- **URL:** `{{baseUrl}}`
- **Body (raw JSON):**

```json
{
  "name": "Gaming Headset",
  "price": 129.99
}
```

- **Expected status:** `201 Created`
- **Expected response** (the id is generated automatically):

```json
{
  "success": true,
  "message": "Item created successfully.",
  "data": { "id": 6, "name": "Gaming Headset", "price": 129.99 }
}
```

> Run "Get all items" again to confirm the new item is now `count: 6`.

#### D. Update an item (full or partial)

- **Method:** `PUT`
- **URL:** `{{baseUrl}}/6`
- **Body (raw JSON) — both fields:**

```json
{
  "name": "Gaming Headset Pro",
  "price": 149.99
}
```

- **Partial update is also valid** (only `price` changes, name stays the same):

```json
{
  "price": 139.99
}
```

- **Expected status:** `200 OK`
- **Expected response:**

```json
{
  "success": true,
  "message": "Item updated successfully.",
  "data": { "id": 6, "name": "Gaming Headset Pro", "price": 149.99 }
}
```

#### E. Delete an item

- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/6`
- **Body:** none
- **Expected status:** `200 OK`
- **Expected response:**

```json
{
  "success": true,
  "message": "Item deleted successfully.",
  "data": { "id": 6, "name": "Gaming Headset Pro", "price": 149.99 }
}
```

> Repeat "Get all items" — `count` should be back to `5` and item `6` should be gone.

---

### 3. Negative test cases

#### 1. Invalid id → `400 Bad Request`

- **Method:** `GET`
- **URL:** `{{baseUrl}}/abc`
- **Expected status:** `400 Bad Request`
- **Expected response:**

```json
{
  "success": false,
  "error": "Invalid item id. The id must be a positive integer."
}
```

Also try `{{baseUrl}}/0` and `{{baseUrl}}/-1` (same `400`). This validation also applies to `PUT` and `DELETE` with an invalid id.

#### 2. Missing required field on create → `400 Bad Request`

- **Method:** `POST`
- **URL:** `{{baseUrl}}`
- **Body (raw JSON):**

```json
{
  "name": "No Price Item"
}
```

- **Expected status:** `400 Bad Request`
- **Expected response:**

```json
{ "success": false, "error": "Field \"price\" is required." }
```

#### 3. Invalid field types/values → `400 Bad Request`

- **Method:** `POST`
- **URL:** `{{baseUrl}}`
- **Body (raw JSON):**

```json
{
  "name": "   ",
  "price": -5
}
```

- **Expected status:** `400 Bad Request`
- **Expected response:**

```json
{ "success": false, "error": "Field \"name\" must be a non-empty string." }
```

Then try `{ "name": "Valid Name", "price": "free" }` → `400` with `Field "price" must be a positive number.`

#### 4. Empty update body → `400 Bad Request`

- **Method:** `PUT`
- **URL:** `{{baseUrl}}/1`
- **Body (raw JSON):**

```json
{}
```

- **Expected status:** `400 Bad Request`
- **Expected response:**

```json
{
  "success": false,
  "error": "Provide at least one field (\"name\" or \"price\") to update."
}
```

#### 5. Item not found → `404 Not Found`

- **Method:** `GET`
- **URL:** `{{baseUrl}}/999`
- **Expected status:** `404 Not Found`
- **Expected response:**

```json
{
  "success": false,
  "error": "Item with id 999 was not found."
}
```

Try the same with `PUT {{baseUrl}}/999` and `DELETE {{baseUrl}}/999` (with a valid body for PUT) — both should also return `404`.

#### 6. Unknown route → `404 Not Found`

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/does-not-exist`
- **Expected status:** `404 Not Found`
- **Expected response:**

```json
{
  "success": false,
  "error": "Route GET /api/does-not-exist was not found."
}
```

#### 7. Malformed JSON → `400 Bad Request`

- **Method:** `POST`
- **URL:** `{{baseUrl}}`
- **Body (raw JSON):** `{ "name": }`  (deliberately broken)
- **Expected status:** `400 Bad Request` with `{ "success": false, "error": "..." }`

#### 8. Unexpected server error → `500 Internal Server Error`

The global error handler returns:

```json
{ "success": false, "error": "Internal Server Error" }
```

It is only triggered by an unhandled exception, so it is not normally reachable through normal API calls (which is the desired behavior).

---

### Quick status-code checklist

| Scenario | Status |
| -------- | ------ |
| GET list / GET by id (exists) | `200` |
| POST create | `201` |
| PUT update (exists) | `200` |
| DELETE (exists) | `200` |
| Non-numeric or non-positive id | `400` |
| Missing/invalid body fields | `400` |
| Empty PUT body | `400` |
| Valid id, no matching item | `404` |
| Unknown route | `404` |
| Unhandled server error | `500` |
