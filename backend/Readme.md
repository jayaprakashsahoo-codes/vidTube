# VidTube Backend ⚙️

A production-ready video platform REST API built with **Node.js**, **Express.js**, **MongoDB**, and **Cloudinary**.

---

## 🚀 Features & Modules

- 🔐 **Authentication & Authorization**: Secure User Registration/Login using JWT (Access & Refresh Tokens), HTTP-Only Cookies, and `bcrypt` password hashing.
- 📹 **Video Management**: Video upload with thumbnail processing via Cloudinary, video metadata CRUD operations, and pagination.
- 💬 **Comments & Community**: Full commenting system on videos and interactive community tweets/posts.
- 🔴 **Subscriptions & Channel Profile**: Subscribe/unsubscribe to channels, view subscriber lists and channel metrics.
- 📊 **Playlists & Watch History**: Custom playlist creation, video management inside playlists, and watch history tracking.
- 👍 **Like & Engagement System**: Like/Dislike videos, comments, and community tweets.
- 🛠️ **Dashboard & Analytics**: Channel analytics endpoint delivering video counts, total views, subscribers, and likes.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose (with `mongoose-aggregate-paginate-v2`)
- **File & Media Storage**: Cloudinary (via `multer` temporary storage middleware)
- **Security**: JSON Web Tokens (JWT), `bcrypt`, `cors`, `cookie-parser`

---

## 📦 Getting Started & Local Setup

### 1. Installation
Navigate into the backend directory and install dependencies:
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend` root folder:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vidtube
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Run Development Server
```bash
npm run dev
```
The API server will run on `http://localhost:8000`.

---

## 📄 API Routes Reference

| Endpoint Base | Description |
| :--- | :--- |
| `/api/v1/users` | User Auth, Profile, Avatar, Watch History |
| `/api/v1/videos` | Video Publish, Stream, Update, Delete |
| `/api/v1/comments` | Video Comments CRUD |
| `/api/v1/likes` | Toggle Likes on Videos, Comments, Tweets |
| `/api/v1/subscriptions` | Channel Subscriptions & Subscriber lists |
| `/api/v1/playlist` | User Playlists management |
| `/api/v1/tweets` | Community Posts / Tweets |
| `/api/v1/dashboard` | Channel Statistics & Uploaded Videos |