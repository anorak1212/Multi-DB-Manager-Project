# proyecto-tci — Multi-DB Full-Stack App

A containerised full-stack application that manages **Clients** (PostgreSQL) and **Products** (MySQL) through a **Flask** REST API, served by an **Nginx** frontend (pure HTML / CSS / JS) that also acts as a reverse proxy.

---

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── __init__.py     # Flask application factory
│   │   ├── database.py     # Dual-DB setup (PostgreSQL + MySQL)
│   │   ├── models.py       # SQLAlchemy models
│   │   └── routes.py       # All API endpoints
│   ├── wsgi.py             # Gunicorn entry-point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html          # Single-page UI
│   ├── style.css
│   ├── script.js           # fetch()-based CRUD client
│   └── nginx.conf          # Static server + reverse proxy
├── db_seeds/
│   ├── init_postgres.sql   # Clients table + 3 sample rows
│   └── init_mysql.sql      # Products table + 3 sample rows
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| [Docker](https://docs.docker.com/get-docker/) | 24+ |
| [Docker Compose](https://docs.docker.com/compose/) | v2 (plugin) or standalone v1.29+ |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/UriMtzF/proyecto-tci.git
cd proyecto-tci

# 2. Build images and start all services
docker compose up --build

# 3. Open the browser
open http://localhost:8080
```

> **First run note:** MySQL may take 20–30 s to initialise.  
> The backend will not start until both databases pass their health-checks.

---

## Access the Frontend

Once all containers are running, navigate to:

```
http://localhost:8080
```

The Nginx container serves the static files and proxies every `/api/*` call to the Flask backend, so no CORS configuration is needed.

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Clients  (`db_clients` — PostgreSQL)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/clients` | List all clients |
| `GET` | `/api/clients/:id` | Get a single client |
| `POST` | `/api/clients` | Create a client |
| `PUT` | `/api/clients/:id` | Update a client |
| `DELETE` | `/api/clients/:id` | Delete a client |

**Create client — example payload**
```json
POST /api/clients
{
  "name":  "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1-555-0101"
}
```

### Products  (`db_products` — MySQL)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get a single product |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Update a product |
| `DELETE` | `/api/products/:id` | Delete a product |

**Create product — example payload**
```json
POST /api/products
{
  "name":  "Laptop Pro 15",
  "price": 1299.99,
  "stock": 25
}
```

### Business Logic

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/purchase` | Validate client & product and record a purchase |
| `GET` | `/api/report` | List all registered clients |

**Purchase — example payload**
```json
POST /api/purchase
{
  "client_id":  1,
  "product_id": 2
}
```
**Purchase — example response**
```json
{
  "message": "Client Alice Johnson has purchased Wireless Mouse",
  "client":  { "id": 1, "name": "Alice Johnson", "email": "alice@example.com", "phone": "+1-555-0101" },
  "product": { "id": 2, "name": "Wireless Mouse", "price": 29.99, "stock": 150 }
}
```

**Report — example response**
```json
{
  "total": 3,
  "clients": [
    { "id": 1, "name": "Alice Johnson",  "email": "alice@example.com",  "phone": "+1-555-0101" },
    { "id": 2, "name": "Bob Martinez",   "email": "bob@example.com",    "phone": "+1-555-0102" },
    { "id": 3, "name": "Carol Williams", "email": "carol@example.com",  "phone": "+1-555-0103" }
  ]
}
```

---

## Stopping the Stack

```bash
docker compose down          # stop & remove containers
docker compose down -v       # also remove named volumes (wipes DB data)
```

---

## Architecture Overview

```
Browser
  │
  ▼
frontend_web (Nginx :8080)
  │  /            → serves static files
  │  /api/*       → proxy_pass → backend_api:5000
  ▼
backend_api (Flask + Gunicorn :5000)
  ├── db_clients  (PostgreSQL :5432)   ← Clients
  └── db_products (MySQL :3306)        ← Products
```