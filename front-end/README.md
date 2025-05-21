# Frontend Setup Guide

## 📌 Prerequisites

Before setting up the frontend, ensure you have the following installed:

- **Node.js** (v16 or later)
- **Vite** (for a faster React setup)

---

## 🚀 1. Clone the Repository

```sh
git clone https://github.com/your-repo/frontend.git
cd frontend
```

---

## 🛠 2. Set Up Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 3. Install Dependencies

```sh
npm install
```

---

## 🎨 4. Start the Development Server

```sh
npm run dev
```

This will start the frontend on **http://localhost:5173**.

---

---

## 🔥 5. API Connection Testing

To ensure the frontend is communicating with the backend, test API calls:

```sh
fetch(`${import.meta.env.VITE_API_URL}/health`).then(res => res.json()).then(console.log);
```

---

## 🛑 Stopping the Frontend Server

To stop the development server:

```sh
CTRL + C (in terminal)
```

---

## 🎯 Troubleshooting

- **Issue:** Cannot connect to API
  - **Solution:** Check if the backend is running and `VITE_API_URL` is correctly set in `.env`.
- **Issue:** Port conflict on `5173`
  - **Solution:** Change the port in `vite.config.js`:
  ```js
  export default defineConfig({
    server: {
      port: 3000,
    },
  });
  ```

---

✅ **Now your frontend is fully set up and ready to use!** 🚀
