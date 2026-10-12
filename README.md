# 📝 Paper Note

A modern, distraction-free note-taking application with rich-text inline formatting, real-time preview, light/dark themes, and enterprise-grade authentication.

---

## ✨ Features

- **Rich-Text Inline Formatting**: Highlight text to format bold, italics, font sizes, and text colors powered by Bootstrap 5 utility classes.
- **Light & Dark Themes**: Toggle between themes seamlessly with saved preferences.
- **Clerk Authentication**: Secure user management with Clerk, including a built-in dev-bypass mode for local development without credentials.
- **Persistent Storage**: All notes and rich-text formatting persist to PostgreSQL.
- **Dockerized**: One command to build and run the full stack with PostgreSQL.

---

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API / `<script setup>`), Vite, Bootstrap 5.3, `@clerk/vue`
- **Backend**: Node.js, Express 5, `pg` (node-postgres), `@clerk/express`
- **Database**: PostgreSQL 17
- **Deployment / Container**: Docker, Docker Compose

---

## 📋 Prerequisites

- [Docker & Docker Compose](https://www.docker.com/) (recommended)
- *Or* [Node.js](https://nodejs.org/) (v20+) and a local [PostgreSQL](https://www.postgresql.org/) instance

---

## ⚙️ Configuration

Copy the example environment file to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Frontend Publishable Key | `pk_test_...` |
| `CLERK_PUBLISHABLE_KEY` | Synced backend publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk Backend Secret Key | `sk_test_...` |
| `POSTGRES_HOST` | Database host | `localhost` (`postgres` in Docker) |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | Database name | `default` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `PORT` | Backend server port | `8080` |
| `VITE_API_URL` | Backend URL for standalone Vite dev server | `http://localhost:8080` |

> [!NOTE]
> If `CLERK_SECRET_KEY` is left blank or retains the placeholder, the backend runs in **dev bypass mode** (`dev_user`), allowing full note editing and testing without a Clerk account.

---

## 🚀 Running the Project

### Option 1: Docker Compose (Recommended)

Start the database, backend, and built frontend together:

```bash
docker compose up --build
```

The application will be live at **`http://localhost:8080`**.

---

### Option 2: Local Development

#### 1. Start PostgreSQL
Ensure PostgreSQL is running on port `5432` with credentials matching `.env`:
```bash
docker run --name paper-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=default -p 5432:5432 -d postgres:17
```

#### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at **`http://localhost:8080`**.

#### 3. Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **`http://localhost:5173`** (proxies API requests to `http://localhost:8080`).

---

## 📄 License

ISC
