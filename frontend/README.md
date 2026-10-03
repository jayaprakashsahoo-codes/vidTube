# VidTube Frontend 🎬

A modern, high-performance video streaming web application built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Redux Toolkit**.

---

## 🚀 Features

- 🎥 **Video Feed & Playback**: Browse, search, and watch videos with dynamic routing and responsive media layout.
- 👤 **User Profiles & Authentication**: Register, Login, manage avatars, cover images, and account settings.
- 📌 **Community Posts / Tweets**: Post, view, like, and delete community text updates.
- 📁 **Playlists & Subscriptions**: Create custom playlists, add/remove videos, and manage subscribed channels.
- 📊 **Watch History & Liked Videos**: Quickly access your watch history and saved liked content.
- 🎨 **Dark Mode UI**: Sleek, modern interface built with Tailwind CSS and Lucide React icons.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + [React Redux](https://react-redux.js.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)

---

## 📦 Getting Started & Local Setup

### 1. Installation
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create a `.env` file inside the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Production Build & Deployment

### Build for Production
To generate minified production assets in `dist/`:
```bash
npm run build
```

### GitHub & Hosting Deployment (Vercel / Netlify)
1. **Root Directory**: Select `frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**: Add `VITE_API_BASE_URL` pointing to your hosted backend API URL.
