# Backend Setup & Docker Guide

## 📌 Prerequisites

Before setting up the backend, ensure you have the following installed:

- **Node.js** (v16 or later)
- **Docker** & **Docker Compose**
- **PostgreSQL** (if running without Docker)

---

## 🚀 1. Clone the Repository

```sh
git clone https://github.com/your-repo/backend.git
cd backend
```

---

## 🛠 2. Set Up Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
# Database Configuration
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=
POSTGRES_HOST=

# API Configuration
PORT=
DATABASE_URL=
JWT_SECRET=
```

---

## 🏗 3. Install Dependencies

```sh
yarn install or npm install
```

---

## 🐳 4. Set Up Docker & PostgreSQL

### **If you are using Docker to manage PostgreSQL**

1. Start the PostgreSQL container:

```sh
docker-compose up -d
```

2. Verify the container is running:

```sh
docker ps
```

3. Connect to PostgreSQL inside the container:

```sh
docker exec -it postgres_db psql -U postgres -d patient_transport
```

### **If running PostgreSQL locally**

1. Update `.env`:

```env
DATABASE_URL=
```

2. Ensure PostgreSQL is running on your machine.

---

## 📦 5. Database Setup with Prisma

```sh
npx prisma migrate dev --name init
```

This command initializes the database schema and applies migrations.

To generate the Prisma Client:

```sh
npx prisma generate
```

---

## 🚀 6. Start the Backend Server

```sh
npm run dev
```

This will start the backend on **http://localhost:5000**.

---

## 🔥 7. API Endpoints Testing

Use Postman or Curl to test API routes.
Example:

```sh
curl http://localhost:5000/api/health
```

---

## 🛑 Stopping Services

To stop PostgreSQL running inside Docker:

```sh
docker-compose down
```

To stop the backend server:

```sh
CTRL + C (in terminal)
```

---

## 🎯 Troubleshooting

- **Issue:** `FATAL: database files are incompatible with server`
  - **Solution:** Remove existing database volume and restart PostgreSQL:
  ```sh
  docker-compose down -v
  docker-compose up -d
  ```
- **Issue:** Cannot connect to PostgreSQL
  - **Solution:** Verify `DATABASE_URL` in `.env` and restart PostgreSQL.

---

✅ **Now your backend and database are fully set up and ready to use!** 🚀
