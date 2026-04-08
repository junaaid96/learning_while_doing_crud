# Web Development Concepts — Simply Explained

> This file explains the most important ideas behind how the web works.  
> No jargon. No fluff. Just clear explanations with examples from our Todo App.

---

## Table of Contents

1. [The Big Picture — How the Web Works](#1-the-big-picture--how-the-web-works)
2. [Frontend vs Backend](#2-frontend-vs-backend)
3. [HTTP — The Language of the Web](#3-http--the-language-of-the-web)
   - 3.1 Anatomy of an HTTP Request
   - 3.2 What are Headers?
   - 3.3 What is a Payload / Request Body?
   - 3.4 Three Ways to Send Data (Path Param, Query Param, Body)
   - 3.5 HTTP Methods — Each One Explained (GET, POST, PUT, PATCH, DELETE)
   - 3.6 HTTP Status Codes
4. [Request / Response Cycle](#4-request--response-cycle)
5. [JSON — How Data Travels](#5-json--how-data-travels)
6. [REST API — Rules for Building APIs](#6-rest-api--rules-for-building-apis)
   - 6.1 What is an API? (real-world analogy, how a call works step by step, types of APIs)
   - 6.2 What is a REST API? (REST vs Non-REST, resource concept)
   - 6.3 The 5 REST Principles
   - 6.4 Resources and URLs (Good vs Bad design)
   - 6.5 Complete CRUD Example with requests/responses
   - 6.6 Nested Resources
   - 6.7 REST in Our FastAPI App
   - 6.8 How FastAPI handles the full cycle
7. [Middleware — The "In-Between" Layer](#7-middleware--the-in-between-layer)
8. [CORS — Why the Browser Blocks Requests](#8-cors--why-the-browser-blocks-requests)
9. [Relational Databases (PostgreSQL)](#9-relational-databases-postgresql)
10. [ORM — Talking to the DB in Python](#10-orm--talking-to-the-db-in-python)
11. [Authentication vs Authorization](#11-authentication-vs-authorization)
12. [JWT — JSON Web Tokens](#12-jwt--json-web-tokens)
13. [Environment Variables — Keeping Secrets Safe](#13-environment-variables--keeping-secrets-safe)
14. [Summary Cheat Sheet](#14-summary-cheat-sheet)

---

## 1. The Big Picture — How the Web Works

When you open a website, three things are involved:

```
Your Browser          The Internet           The Server
(Frontend)    ←──────────────────────→   (Backend + Database)
```

1. You type `http://127.0.0.1:8000/todos` in your browser
2. Your browser sends a **request** over the internet to the server
3. The server processes it, talks to the database, and sends back a **response**
4. Your browser displays the data

Think of it like ordering food:
- **You** = the browser (frontend)
- **Waiter** = the API
- **Kitchen** = the backend logic
- **Pantry/Fridge** = the database

---

## 2. Frontend vs Backend

| | Frontend | Backend |
|---|---|---|
| **Runs in** | Your browser | The server |
| **Language** | HTML, CSS, JavaScript | Python, Node.js, Java, etc. |
| **Sees** | Everything the user sees | Hidden from the user |
| **Handles** | UI, user interactions | Business logic, data, security |
| **Our app** | `index.html`, `style.css`, `app.js` | `main.py`, `models.py`, PostgreSQL |

### Key Rule
The frontend **never** directly touches the database.  
It always goes through the backend API.

```
Frontend  →  API (Backend)  →  Database
              ↑ only this part
              touches the DB
```

---

## 3. HTTP — The Language of the Web

**HTTP** (HyperText Transfer Protocol) is the set of rules that browsers and servers use to communicate.

---

### 3.1 Anatomy of an HTTP Request

Every request from the browser to the server has 4 parts:

```
┌──────────────────────────────────────────────────────────┐
│                   HTTP REQUEST                           │
│                                                          │
│  1. METHOD + URL (the start line)                        │
│     POST /todos HTTP/1.1                                 │
│                                                          │
│  2. HEADERS (metadata about the request)                 │
│     Host: 127.0.0.1:8000                                 │
│     Content-Type: application/json                       │
│     Authorization: Bearer eyJhbGci...                    │
│                                                          │
│  3. BLANK LINE (separates headers from body)             │
│                                                          │
│  4. BODY / PAYLOAD (the actual data — optional)          │
│     { "title": "Buy milk", "description": "2 litres" }   │
└──────────────────────────────────────────────────────────┘
```

And every response has the same structure:

```
┌──────────────────────────────────────────────────────────┐
│                   HTTP RESPONSE                          │
│                                                          │
│  1. STATUS LINE                                          │
│     HTTP/1.1 201 Created                                 │
│                                                          │
│  2. HEADERS                                              │
│     Content-Type: application/json                       │
│     Access-Control-Allow-Origin: *                       │
│                                                          │
│  3. BLANK LINE                                           │
│                                                          │
│  4. BODY (the data sent back)                            │
│     { "id": 5, "title": "Buy milk", "completed": false } │
└──────────────────────────────────────────────────────────┘
```

---

### 3.2 What are Headers?

**Headers** are key-value pairs that carry metadata — extra information about the request or response. They are NOT the actual data.

**Common Request Headers:**

| Header | What it means | Example |
|---|---|---|
| `Content-Type` | Format of the request body | `application/json` |
| `Authorization` | Your identity token | `Bearer eyJhbGci...` |
| `Accept` | What format you want back | `application/json` |
| `Host` | The server you're calling | `127.0.0.1:8000` |

**Common Response Headers:**

| Header | What it means | Example |
|---|---|---|
| `Content-Type` | Format of the response body | `application/json` |
| `Access-Control-Allow-Origin` | CORS permission | `*` |
| `Set-Cookie` | Tell browser to store a cookie | `session=abc123` |

In JavaScript with `fetch()`:

```javascript
fetch("http://127.0.0.1:8000/todos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",       // tell server the body is JSON
    "Authorization": "Bearer eyJhbGci..."     // send JWT token
  },
  body: JSON.stringify({ title: "Buy milk" })
});
```

---

### 3.3 What is a Payload / Request Body?

**Payload** and **Request Body** mean the same thing — the actual data you send TO the server.

- Only `POST`, `PUT`, and `PATCH` requests have a body
- `GET` and `DELETE` do NOT send a body

```
GET  /todos/5    ← no body (you're just asking for data)
DELETE /todos/5  ← no body (just the ID in the URL is enough)

POST /todos      ← has a body (you need to send the new todo's data)
PUT  /todos/5    ← has a body (you need to send the updated fields)
```

The body is always a string when sent over HTTP. We format it as JSON:

```javascript
body: JSON.stringify({ title: "Buy milk", description: "2 litres" })
// sends the string: '{"title":"Buy milk","description":"2 litres"}'
```

The server then parses it back into an object.

---

### 3.4 Three Ways to Send Data in a Request

There are three different places data can live in a request:

#### 1. Path Parameter — in the URL itself

```
GET /todos/5
              ↑
         path parameter (the id = 5)
```

Used to identify **which specific resource** you want.

```python
# FastAPI — {todo_id} is a path parameter
@app.get("/todos/{todo_id}")
def get_todo(todo_id: int):  # value comes from the URL
    ...
```

```javascript
// JavaScript
fetch(`http://127.0.0.1:8000/todos/${id}`)
```

#### 2. Query Parameter — after `?` in the URL

```
GET /todos?completed=false&limit=10
            ↑              ↑
       query params   (key=value pairs)
```

Used for **filtering, sorting, pagination** — optional extras.

```python
# FastAPI — skip and limit are query parameters
@app.get("/todos")
def get_todos(skip: int = 0, limit: int = 10, completed: bool = None):
    # /todos?skip=0&limit=10
    ...
```

```javascript
// JavaScript
fetch("http://127.0.0.1:8000/todos?completed=false&limit=5")
```

#### 3. Request Body / Payload — inside the request

```
POST /todos
Content-Type: application/json

{ "title": "Buy milk", "description": "2 litres" }
↑
the body — used for larger or structured data
```

Used to send **data when creating or updating** a resource.

```python
# FastAPI — todo is the request body (Pydantic validates it)
@app.post("/todos")
def create_todo(todo: TodoCreate):
    # FastAPI parses the JSON body into a TodoCreate object
    ...
```

```javascript
// JavaScript
fetch("http://127.0.0.1:8000/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Buy milk" })  // ← request body
})
```

**Quick rule of thumb:**

| Where | Used for |
|---|---|
| Path param `/todos/{id}` | Identifying which resource |
| Query param `?limit=10` | Filtering / options |
| Body `{ "title": "..." }` | Sending data to create/update |

---

### 3.5 HTTP Methods — Each One Explained

#### `GET` — Fetch data, no body

```
Request:
  GET /todos HTTP/1.1
  Host: 127.0.0.1:8000
  (no body)

Response:
  HTTP/1.1 200 OK
  Content-Type: application/json

  [
    { "id": 1, "title": "Buy milk", "completed": false },
    { "id": 2, "title": "Learn FastAPI", "completed": true }
  ]
```

- Safe — doesn't change any data
- Can be cached by browsers and CDNs
- Never has a request body
- Use for: read-only operations

---

#### `POST` — Create a new resource, has a body

```
Request:
  POST /todos HTTP/1.1
  Host: 127.0.0.1:8000
  Content-Type: application/json

  { "title": "Buy milk", "description": "From the corner store" }
         ↑
      request body / payload

Response:
  HTTP/1.1 201 Created
  Content-Type: application/json

  { "id": 5, "title": "Buy milk", "completed": false, "created_at": "..." }
```

- Creates a new resource on the server
- Body contains the data for the new resource
- Returns 201 with the created object
- Calling it twice creates two todos — it is NOT idempotent

---

#### `PUT` — Replace/update a resource, has a body

```
Request:
  PUT /todos/5 HTTP/1.1
  Host: 127.0.0.1:8000
  Content-Type: application/json

  { "title": "Buy oat milk", "completed": true }

Response:
  HTTP/1.1 200 OK
  Content-Type: application/json

  { "id": 5, "title": "Buy oat milk", "completed": true, ... }
```

- Updates an existing resource
- Body contains the new values
- Calling it multiple times has the same result — it IS idempotent
- `PUT` traditionally replaces the whole resource

---

#### `PATCH` — Partially update a resource

```
Request:
  PATCH /todos/5 HTTP/1.1
  Content-Type: application/json

  { "completed": true }
       ↑
  only send the fields you want to change

Response:
  HTTP/1.1 200 OK

  { "id": 5, "title": "Buy milk", "completed": true, ... }
```

- Like `PUT` but for **partial updates** — only send the fields you want to change
- Our app uses `PUT` with `exclude_unset=True` to achieve the same effect
- `PUT` = replace everything, `PATCH` = update only what you send

---

#### `DELETE` — Remove a resource, no body

```
Request:
  DELETE /todos/5 HTTP/1.1
  Host: 127.0.0.1:8000
  (no body)

Response:
  HTTP/1.1 204 No Content
  (no body — nothing to return)
```

- Removes the resource permanently
- No request body needed (the ID in the URL is enough)
- Returns 204 (success, but nothing to send back)

---

#### Summary Table

| Method | Has Body? | Idempotent? | Safe? | Use for |
|---|---|---|---|---|
| `GET` | No | Yes | Yes | Read data |
| `POST` | Yes | No | No | Create resource |
| `PUT` | Yes | Yes | No | Full update |
| `PATCH` | Yes | Yes | No | Partial update |
| `DELETE` | No | Yes | No | Delete resource |

> **Idempotent** = calling it multiple times gives the same result.  
> **Safe** = doesn't change any data on the server.

---

### 3.6 HTTP Status Codes (The Server's Response Code)

The server always replies with a 3-digit number:

| Code | Meaning | When |
|---|---|---|
| `200 OK` | All good | Successful GET or PUT |
| `201 Created` | New thing created | Successful POST |
| `204 No Content` | Done, nothing to return | Successful DELETE |
| `400 Bad Request` | You sent invalid data | Missing required field |
| `401 Unauthorized` | You're not logged in | No or invalid token |
| `403 Forbidden` | You're logged in but not allowed | Wrong role/permission |
| `404 Not Found` | Doesn't exist | Todo ID doesn't exist |
| `422 Unprocessable` | Validation failed | Wrong data type |
| `500 Internal Error` | Bug on the server | Something crashed |

The first digit groups them by category:

```
1xx → Informational  (rare, mostly internal)
2xx → Success        (everything went well)
3xx → Redirect       (go to a different URL)
4xx → Client error   (YOU made a mistake)
5xx → Server error   (the SERVER made a mistake)
```

---

## 4. Request / Response Cycle

This is the most fundamental concept in web development. Every interaction follows this pattern:

### Step-by-Step: Creating a Todo

```
Step 1: User types "Buy milk" and clicks "Add"
        ↓
Step 2: JavaScript (app.js) creates a fetch() request:
        Method: POST
        URL:    http://127.0.0.1:8000/todos
        Body:   { "title": "Buy milk" }
        ↓
Step 3: Request travels over HTTP to FastAPI server
        ↓
Step 4: FastAPI receives it:
        → Validates the body against TodoCreate schema
        → Calls create_todo() function
        → SQLAlchemy runs: INSERT INTO todos (title) VALUES ('Buy milk')
        → PostgreSQL stores the row, returns it with id=5, created_at=...
        ↓
Step 5: FastAPI builds a response:
        Status: 201 Created
        Body:   { "id": 5, "title": "Buy milk", "completed": false, ... }
        ↓
Step 6: JavaScript receives the response:
        → Parses the JSON
        → Creates a new <li> element
        → Adds it to the todo list on the page
        ↓
Step 7: User sees "Buy milk" appear in the list ✅
```

### What a Raw HTTP Request Looks Like

```http
POST /todos HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "title": "Buy milk",
  "description": "From the corner store"
}
```

### What a Raw HTTP Response Looks Like

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 5,
  "title": "Buy milk",
  "description": "From the corner store",
  "completed": false,
  "created_at": "2026-04-08T10:30:00"
}
```

---

## 5. JSON — How Data Travels

**JSON** (JavaScript Object Notation) is the universal format for sending data between frontend and backend.

### Why JSON?

- It's just text — easy to send over HTTP
- Both JavaScript and Python can read/write it natively
- It's human-readable

### JSON Syntax

```json
{
  "id": 1,
  "title": "Learn FastAPI",
  "completed": false,
  "tags": ["python", "backend"],
  "author": {
    "name": "Alice",
    "age": 25
  }
}
```

### Data Types in JSON

| Type | Example |
|---|---|
| String | `"hello"` |
| Number | `42`, `3.14` |
| Boolean | `true`, `false` |
| Null | `null` |
| Array | `[1, 2, 3]` |
| Object | `{ "key": "value" }` |

### Conversion: JSON ↔ Python ↔ JavaScript

**Python:**
```python
import json

# Python dict → JSON string (serialization)
data = {"title": "Buy milk", "completed": False}
json_string = json.dumps(data)
# Result: '{"title": "Buy milk", "completed": false}'

# JSON string → Python dict (deserialization)
parsed = json.loads(json_string)
```

**JavaScript:**
```javascript
// JS object → JSON string
const data = { title: "Buy milk", completed: false };
const jsonString = JSON.stringify(data);

// JSON string → JS object
const parsed = JSON.parse(jsonString);
```

**In our app**, FastAPI and the Fetch API handle all of this automatically:
- FastAPI receives JSON → converts to Python dict → validates with Pydantic
- FastAPI returns Python object → Pydantic converts to JSON automatically
- `fetch()` with `response.json()` parses the JSON into a JS object automatically

---

## 6. REST API — Rules for Building APIs

---

### 6.1 What is an API?

**API** = Application Programming Interface

An API is a **messenger** — it sits between two programs and lets them talk to each other.

The word "Interface" is the key. An interface is a point of contact. You don't need to know how the other side works — you just need to know what to ask for and what you'll get back.

#### Real-world analogy — a Restaurant

Think of a restaurant:

```
You (Customer)       Waiter (API)        Kitchen (Server/DB)
──────────────       ────────────        ───────────────────
You want food   →    Takes your order →   Cooks the food
                     Brings it back  ←    Hands it to waiter
You eat food    ←
```

- **You** don't go into the kitchen yourself — you use the **waiter (API)**
- **You** don't need to know how to cook — just what to order
- **The kitchen** doesn't care who you are — it just processes the order

In our app:
- **You (frontend/JS)** want a list of todos
- **The waiter (FastAPI)** takes the request, fetches from the DB, returns it
- **You** don't touch the database directly — ever

---

#### What does "Interface" mean in practice?

The API defines a **contract**:

```
"If you call GET /todos          → I will return a list of todos as JSON"
"If you call POST /todos + body  → I will create it and return the new todo"
"If you call DELETE /todos/5     → I will delete it and return nothing"
```

The frontend **agrees to this contract**. It doesn't care if the backend uses PostgreSQL, MongoDB, or stores data in a text file. It only cares that the contract is respected.

---

#### How an API Call Works — Step by Step

Let's trace exactly what happens when JavaScript calls the API:

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1 — JavaScript makes a fetch() call                   │
│                                                             │
│  fetch("http://127.0.0.1:8000/todos", {                     │
│    method: "POST",                                          │
│    headers: { "Content-Type": "application/json" },         │
│    body: JSON.stringify({ title: "Buy milk" })              │
│  })                                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP request sent over the network
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2 — FastAPI receives the request                      │
│                                                             │
│  • Reads the method: POST                                   │
│  • Reads the URL: /todos                                    │
│  • Reads the headers: Content-Type = application/json       │
│  • Reads the body: { "title": "Buy milk" }                  │
│  • Validates data with Pydantic schema                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3 — Backend runs the business logic                   │
│                                                             │
│  • Creates a Todo object                                    │
│  • Saves it to PostgreSQL                                   │
│  • Gets back the saved row with id, created_at              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4 — FastAPI builds the response                       │
│                                                             │
│  • Status: 201 Created                                      │
│  • Converts Todo object → JSON string                       │
│  • Sends it back                                            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP response sent back
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5 — JavaScript receives the response                  │
│                                                             │
│  const todo = await response.json()                         │
│  // todo = { id: 5, title: "Buy milk", completed: false }   │
│  // → render it on the page                                 │
└─────────────────────────────────────────────────────────────┘
```

---

#### Types of APIs

Not all APIs are the same. Here are the main types:

| Type | What it is | Example |
|---|---|---|
| **REST API** | Uses HTTP methods + URLs (what we built) | `GET /todos`, `POST /users` |
| **GraphQL** | One endpoint, you specify exactly what data you want | `POST /graphql { query: "{ todos { title } }" }` |
| **WebSocket** | Two-way real-time connection (stays open) | Chat apps, live notifications |
| **gRPC** | Binary protocol, very fast, used between servers | Microservices communication |

We are using **REST API** — the most common type for web apps.

---

### 6.2 What is a REST API?

**REST** = Representational State Transfer

REST is NOT a technology or a library. It is a **set of rules** (an architectural style) for designing APIs.

When an API follows REST rules, it is called a **RESTful API**.

#### The Core Idea of REST

In REST, every piece of data is called a **Resource**:
- A todo is a resource
- A user is a resource
- A product is a resource

Each resource has a **URL** (its address) and you interact with it using **HTTP methods**:

```
Resource: todo
Address:  /todos         (collection of all todos)
          /todos/5       (one specific todo with id=5)

Interact:
  GET    /todos     → read the collection
  POST   /todos     → add to the collection
  GET    /todos/5   → read one item
  PUT    /todos/5   → update one item
  DELETE /todos/5   → remove one item
```

This is clean, predictable, and consistent. Any developer who knows REST can immediately understand your API.

#### REST vs Non-REST

Without REST rules, APIs often look like this:

```
❌ Non-REST (RPC style — verb-based URLs)
POST /getAllTodos
POST /createTodo
POST /updateTodo?id=5
POST /deleteTodo?id=5
POST /markTodoAsComplete?id=5
```

Every action is a separate custom endpoint. Hard to predict, hard to remember.

With REST:

```
✅ REST (resource-based URLs + HTTP methods)
GET    /todos
POST   /todos
PUT    /todos/5
DELETE /todos/5
PATCH  /todos/5
```

The URL says the **resource**, the HTTP method says the **action**. Simple and consistent.

---

### 6.3 The 5 REST Principles (Simplified)

| Principle | Meaning |
|---|---|
| **Stateless** | Each request contains all the info needed. Server doesn't remember previous requests. |
| **Resource-based URLs** | URLs represent things (nouns), not actions (verbs) |
| **Use HTTP methods correctly** | GET to read, POST to create, PUT/PATCH to update, DELETE to delete |
| **Uniform interface** | Consistent URL patterns and response formats across all endpoints |
| **Client-Server separation** | Frontend and backend are independent — they only talk through the API |

---

### 6.4 Resources and URLs

In REST, everything is a **resource** — a noun like `todo`, `user`, `product`.

URLs identify resources. They should **never contain verbs**:

```
✅ GOOD REST URLs (nouns)       ❌ BAD REST URLs (verbs)
──────────────────────────────────────────────────────
GET    /todos                   GET    /getAllTodos
GET    /todos/5                 GET    /getTodoById?id=5
POST   /todos                   POST   /createNewTodo
PUT    /todos/5                 POST   /updateTodo
PATCH  /todos/5                 POST   /markTodoComplete
DELETE /todos/5                 GET    /deleteTodo?id=5
```

The HTTP method already says the action — the URL just says what resource.

---

### 6.5 Complete CRUD Example (Our Todo App)

Here is every endpoint with the full request and response:

---

**CREATE — `POST /todos`**

```
Request:
  POST /todos
  Content-Type: application/json

  {
    "title": "Buy milk",
    "description": "From the corner store"
  }

Response: 201 Created
  {
    "id": 5,
    "title": "Buy milk",
    "description": "From the corner store",
    "completed": false,
    "created_at": "2026-04-08T10:30:00"
  }
```

---

**READ ALL — `GET /todos`**

```
Request:
  GET /todos
  (no body)

Response: 200 OK
  [
    { "id": 5, "title": "Buy milk", "completed": false, ... },
    { "id": 4, "title": "Learn FastAPI", "completed": true, ... }
  ]
```

---

**READ ONE — `GET /todos/{id}`**

```
Request:
  GET /todos/5
  (no body)

Response: 200 OK
  { "id": 5, "title": "Buy milk", "completed": false, ... }

If not found → Response: 404 Not Found
  { "detail": "Todo with id 5 not found" }
```

---

**UPDATE — `PUT /todos/{id}`**

```
Request:
  PUT /todos/5
  Content-Type: application/json

  {
    "completed": true
  }

Response: 200 OK
  { "id": 5, "title": "Buy milk", "completed": true, ... }
```

---

**DELETE — `DELETE /todos/{id}`**

```
Request:
  DELETE /todos/5
  (no body)

Response: 204 No Content
  (empty — nothing to return after deletion)
```

---

### 6.6 Nested Resources

When a resource belongs to another resource, nest them in the URL:

```
GET  /users/1/todos        ← all todos belonging to user 1
GET  /users/1/todos/5      ← specific todo of user 1
POST /users/1/todos        ← create a todo for user 1
```

---

### 6.7 REST API in Our App (FastAPI)

```python
@app.get("/todos")             # READ ALL  → returns list
@app.post("/todos")            # CREATE    → returns created object
@app.get("/todos/{todo_id}")   # READ ONE  → returns single object or 404
@app.put("/todos/{todo_id}")   # UPDATE    → returns updated object or 404
@app.delete("/todos/{todo_id}")# DELETE    → returns nothing (204)
```

Each route has three key parts:
1. **HTTP method** — what action to perform
2. **URL path** — which resource
3. **Response model** — what JSON shape to return

---

### 6.8 How FastAPI Handles the Full Cycle

```
1. Client sends:  POST /todos  { "title": "Buy milk" }
                                      ↓
2. FastAPI router matches the method + URL to create_todo()
                                      ↓
3. FastAPI reads the body and validates it:
   - Is "title" present? ✅
   - Is it a string? ✅
   - Is it between 1–200 characters? ✅
   If validation fails → auto returns 422 with details
                                      ↓
4. Your code runs: creates Todo, adds to DB, commits
                                      ↓
5. FastAPI takes your return value (a Todo object)
   and serializes it using response_model=TodoResponse
                                      ↓
6. Client receives: 201 Created  { "id": 5, "title": "Buy milk", ... }
```

---

## 7. Middleware — The "In-Between" Layer

**Middleware** is code that runs on every request, before it reaches your route handler.

Think of it as a **security checkpoint at an airport**:
- Every passenger (request) passes through it
- It can check, modify, log, or reject requests
- The actual destination (route) is only reached if the middleware allows it

```
Incoming Request
      ↓
[ Middleware 1: Log the request ]
      ↓
[ Middleware 2: Check CORS headers ]
      ↓
[ Middleware 3: Verify JWT token ]
      ↓
  Route Handler (your code)
      ↓
[ Middleware 3: Add response headers ]
      ↓
[ Middleware 2: Add CORS response headers ]
      ↓
Outgoing Response
```

### Middleware in FastAPI

```python
from fastapi import FastAPI, Request
import time

app = FastAPI()

# This runs for EVERY request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()

    response = await call_next(request)  # pass to the next layer

    duration = time.time() - start
    print(f"{request.method} {request.url} → {response.status_code} ({duration:.3f}s)")

    return response
```

### Common Types of Middleware

| Type | What it does |
|---|---|
| **CORS** | Adds headers to allow cross-origin requests |
| **Auth** | Checks JWT token on every protected request |
| **Logging** | Records every request for debugging |
| **Rate Limiting** | Blocks users who send too many requests |
| **Compression** | Compresses responses to save bandwidth |

---

## 8. CORS — Why the Browser Blocks Requests

**CORS** = Cross-Origin Resource Sharing

### The Problem

A browser has a built-in security rule called the **Same-Origin Policy**:
> "JavaScript can only make requests to the same origin it was loaded from."

**Origin** = scheme + domain + port

| URL | Origin |
|---|---|
| `http://localhost:5500` | `http://localhost:5500` |
| `http://localhost:8000` | `http://localhost:8000` |
| `https://myapp.com` | `https://myapp.com` |

In our app:
- Frontend runs on `http://localhost:5500` (Live Server)
- Backend API runs on `http://127.0.0.1:8000`

These are **different origins** → the browser **blocks** the request!

### The Solution: CORS Headers

The server can tell the browser: "I allow requests from other origins."  
It does this by adding special **response headers**:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

In FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],  # specific origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> ⚠️ `allow_origins=["*"]` means "allow ALL origins" — fine for development, but in production always specify the exact frontend URL.

---

## 9. Relational Databases (PostgreSQL)

### What is a Relational Database?

A relational database stores data in **tables** (like Excel spreadsheets).  
Tables are connected to each other through **relationships**.

### Our `todos` Table

```
id  | title              | description    | completed | created_at
----+--------------------+----------------+-----------+-------------------
1   | Buy groceries      | Milk and eggs  | false     | 2026-04-08 10:00
2   | Learn FastAPI      | null           | true      | 2026-04-08 11:00
3   | Call dentist       | null           | false     | 2026-04-08 12:00
```

Each **row** = one todo  
Each **column** = one property

### Key Database Concepts

**Primary Key**
```sql
id SERIAL PRIMARY KEY
```
- Uniquely identifies each row
- PostgreSQL auto-generates the number (1, 2, 3, ...)
- You can never have two rows with the same id

**NOT NULL**
```sql
title VARCHAR(200) NOT NULL
```
- This column is required — you cannot insert a row without a title

**DEFAULT**
```sql
completed BOOLEAN DEFAULT false
```
- If you don't provide a value, it uses `false` automatically

**Index**
```sql
CREATE INDEX ON todos(id);
```
- Makes lookups faster — like the index at the back of a book
- Without index: PostgreSQL scans every row to find id=5
- With index: PostgreSQL jumps directly to id=5

### SQL Basics — The 4 Operations

```sql
-- CREATE: Add a new row
INSERT INTO todos (title, description)
VALUES ('Buy milk', 'From the corner store');

-- READ: Get rows
SELECT * FROM todos;                          -- all todos
SELECT * FROM todos WHERE id = 5;             -- one todo
SELECT * FROM todos WHERE completed = false;  -- filtered

-- UPDATE: Modify a row
UPDATE todos
SET completed = true, title = 'Buy oat milk'
WHERE id = 5;

-- DELETE: Remove a row
DELETE FROM todos WHERE id = 5;
```

### Relationships (Why "Relational"?)

Tables can reference each other using **Foreign Keys**.

Example — if we added users:

```
users table:              todos table:
id | name                 id | title      | user_id (FK)
---+------                ---+------------+-------------
1  | Alice                1  | Buy milk   | 1  (Alice's todo)
2  | Bob                  2  | Learn SQL  | 2  (Bob's todo)
                          3  | Call mom   | 1  (Alice's todo)
```

`user_id` in `todos` **references** `id` in `users` — that's a relationship.

### Why PostgreSQL over SQLite?

| Feature | SQLite | PostgreSQL |
|---|---|---|
| Setup | Zero — just a file | Needs a server |
| Concurrent writes | Limited | Excellent |
| Data types | Limited | Rich (JSON, arrays, etc.) |
| Best for | Development / small apps | Production apps |
| Performance | Good for small data | Scales to millions of rows |

---

## 10. ORM — Talking to the DB in Python

**ORM** = Object Relational Mapper

It's a layer that lets you use Python objects instead of writing SQL queries.

### Without ORM (Raw SQL)

```python
import psycopg2

conn = psycopg2.connect("postgresql://postgres:secret@localhost/todo_db")
cursor = conn.cursor()

cursor.execute("INSERT INTO todos (title) VALUES (%s) RETURNING *", ("Buy milk",))
row = cursor.fetchone()
conn.commit()
cursor.close()
conn.close()
```

### With ORM (SQLAlchemy)

```python
new_todo = Todo(title="Buy milk")
db.add(new_todo)
db.commit()
db.refresh(new_todo)
```

Much cleaner! SQLAlchemy generates the SQL for you.

### How SQLAlchemy Translates Python to SQL

| Python (SQLAlchemy) | SQL |
|---|---|
| `db.query(Todo).all()` | `SELECT * FROM todos` |
| `db.query(Todo).filter(Todo.id == 5).first()` | `SELECT * FROM todos WHERE id = 5 LIMIT 1` |
| `db.add(todo); db.commit()` | `INSERT INTO todos ...` |
| `db.delete(todo); db.commit()` | `DELETE FROM todos WHERE id = 5` |

### The Session

A **session** is like a "unit of work" — a temporary workspace:

```python
db = SessionLocal()   # open a session (like opening a draft)

db.add(new_todo)      # stage the change (not saved yet)
db.commit()           # save everything to the database (like hitting Save)
db.refresh(new_todo)  # reload the object from DB (to get auto-generated fields)
db.close()            # close the session
```

---

## 11. Authentication vs Authorization

These two words are often confused. They are different things.

### Authentication = "Who are you?"

Proving your identity.

```
"I am Alice. Here is my password."
Server: "Password matches. Welcome, Alice! Here is your token."
```

### Authorization = "What are you allowed to do?"

What you're permitted to do after identity is confirmed.

```
Alice tries to delete Bob's todo.
Server: "You ARE authenticated (Alice), but you are NOT authorized to delete Bob's todo."
```

| Concept | Question | Example |
|---|---|---|
| Authentication | Who are you? | Login with email + password |
| Authorization | What can you do? | Only admins can delete users |

### HTTP Status Codes

- `401 Unauthorized` → You are **not authenticated** (not logged in)
- `403 Forbidden` → You are authenticated but **not authorized** (wrong permissions)

---

## 12. JWT — JSON Web Tokens

JWT is the most popular way to handle authentication in modern APIs.

### The Problem JWT Solves

HTTP is **stateless** — the server forgets who you are after each request.

Old approach: **Sessions**
- Server stores your login in memory/database
- Browser sends a session ID cookie
- Problem: hard to scale (every server needs access to session store)

Modern approach: **JWT**
- Server creates a signed token containing your info
- Client stores the token
- Client sends the token with every request
- Server verifies the signature — no database lookup needed

### What a JWT Looks Like

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwiZXhwIjoxNzE3MDAwMDAwfQ
.Xk1v8tY9yXtKSxI7mJ3nE5aOqFvN2dH6pLmRsWcZbUo
```

It has 3 parts separated by dots:

```
HEADER.PAYLOAD.SIGNATURE
```

**Header** — algorithm used to sign the token:
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload** — your data (claims):
```json
{
  "user_id": 1,
  "email": "alice@example.com",
  "exp": 1717000000
}
```

**Signature** — proof the token wasn't tampered with:
```
HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)
```

### How JWT Works in Practice

```
Step 1: User logs in
        POST /login { "email": "alice@...", "password": "..." }

Step 2: Server verifies password, creates token
        JWT = sign({ user_id: 1, exp: tomorrow }, SECRET_KEY)
        Response: { "access_token": "eyJ..." }

Step 3: Client stores the token (localStorage or memory)

Step 4: Every protected request includes the token in the header:
        Authorization: Bearer eyJ...

Step 5: Server receives request
        → Extracts token from header
        → Verifies signature using SECRET_KEY
        → Checks exp (expiry) hasn't passed
        → Extracts user_id from payload
        → Processes the request as that user
```

### JWT vs Session

| | JWT | Session |
|---|---|---|
| Storage | Client-side (token) | Server-side (database/memory) |
| Scalability | Great (stateless) | Harder (need shared storage) |
| Revocation | Hard (wait for expiry) | Easy (delete from DB) |
| Size | Larger (encoded data) | Small (just an ID) |

### Important: JWT is NOT Encryption

JWT is **signed** (tamper-proof), not **encrypted** (secret).  
Anyone can decode the payload — never put passwords or sensitive data in it!

```javascript
// Anyone can decode this (it's just base64)
atob("eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIn0=")
// → { "user_id": 1, "email": "alice@example.com" }
```

The **signature** just proves it was issued by your server and hasn't been changed.

---

## 13. Environment Variables — Keeping Secrets Safe

### The Problem

You need database passwords, API keys, and secrets in your code. But if you push them to GitHub, they're public forever.

### The Solution: `.env` Files

Store secrets in a file called `.env` that is **never committed to git**.

```bash
# .env
DB_PASSWORD=super_secret_password
JWT_SECRET=my_jwt_signing_key_123
API_KEY=sk-abc123def456
```

Add `.env` to `.gitignore`:
```
# .gitignore
.env
```

Share a `.env.example` with fake values so teammates know what's needed:
```bash
# .env.example (SAFE to commit)
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
API_KEY=your_api_key_here
```

### Reading env vars in Python

```python
import os
from dotenv import load_dotenv

load_dotenv()  # reads .env file

password = os.getenv("DB_PASSWORD")         # None if not found
password = os.getenv("DB_PASSWORD", "default")  # fallback value
```

### Reading env vars in JavaScript (Node.js)

```javascript
// Using dotenv package
require('dotenv').config();

const password = process.env.DB_PASSWORD;
```

### Rule of Thumb

> If it would be embarrassing or dangerous for it to appear on GitHub, it belongs in `.env`.

---

## 14. Summary Cheat Sheet

```
┌─────────────────────────────────────────────────────────────┐
│                    HOW THE WEB WORKS                        │
│                                                             │
│  Browser                              Server                │
│  ────────                             ──────                │
│  HTML/CSS/JS         HTTP             FastAPI               │
│  (what user sees)  ────────→         (business logic)      │
│                    ←────────                │               │
│                    JSON data               ▼               │
│                                      PostgreSQL             │
│                                      (stores data)          │
└─────────────────────────────────────────────────────────────┘

KEY TERMS:
  HTTP        → Rules for browser ↔ server communication
  JSON        → Text format for sending data
  REST API    → Design rules for URLs and HTTP methods
  CRUD        → Create, Read, Update, Delete
  Payload     → The data (body) sent inside a request
  Headers     → Metadata about a request/response (not the data itself)
  Middleware  → Code that runs on every request
  CORS        → Browser security rule (cross-origin requests)
  ORM         → Write Python instead of SQL
  JWT         → Token-based authentication (stateless)
  .env        → File that stores secrets (never commit)

──────────────────────────────────────────────────────────────
HTTP REQUEST ANATOMY:
  METHOD + URL   →  POST /todos
  Headers        →  Content-Type: application/json
  Body/Payload   →  { "title": "Buy milk" }     (POST/PUT/PATCH only)

THREE WAYS TO SEND DATA:
  Path param   /todos/{id}    → identify which resource
  Query param  /todos?limit=5 → filter / options
  Body         { "title":..}  → data when creating/updating

HTTP METHODS:
  GET    → read data,   NO body,  safe + idempotent
  POST   → create,      HAS body, NOT idempotent
  PUT    → full update, HAS body, idempotent
  PATCH  → part update, HAS body, idempotent
  DELETE → remove,      NO body,  idempotent

STATUS CODES:
  2xx success → 200 OK | 201 Created | 204 No Content
  4xx client  → 400 Bad Request | 401 Unauth | 403 Forbidden | 404 Not Found
  5xx server  → 500 Internal Error

──────────────────────────────────────────────────────────────
REST RULES:
  URLs are nouns (resources), not verbs (actions)
  ✅ GET /todos/5    ❌ GET /getTodoById?id=5
  Use HTTP method to express the action, not the URL

JWT FLOW:
  Login → Server gives you a token → Send token with every request
  Header: Authorization: Bearer <token>
  → Server verifies signature → Knows who you are (no DB lookup)

DATABASE:
  Table  = spreadsheet  |  Row = one record  |  Column = one field
  PRIMARY KEY = unique id  |  FOREIGN KEY = link to another table
  INDEX = makes queries fast  |  NOT NULL = required field
```

---

*Read `README.md` for the code walkthrough. Read `SETUP.md` to get it running locally.*
