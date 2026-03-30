# 🚀 FlowChat — Real-Time Chat Application

A full-stack, advanced real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## ✨ Features

- ⚡ **Real-time messaging** via WebSockets (Socket.io)
- ⌨️ **Typing indicators** — see when someone is typing
- 😊 **Message reactions** — react to messages with emojis
- 👥 **Group chats** + private 1-on-1 chats
- 📎 **Media sharing** — images and file attachments
- 🟢 **Online/offline presence** — real-time user status
- ✓✓ **Read receipts** — double checkmarks like WhatsApp
- 🎨 **Premium dark UI** — glassmorphism design with animations
- 🔐 **JWT Authentication** — secure login/register

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB (In-Memory) |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Styling | Vanilla CSS |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ installed

### 1. Start the Backend

```bash
cd server
npm install
npm run dev
```

The server will start on **http://localhost:5000** and automatically:
- Spin up an in-memory MongoDB instance
- Seed 4 demo users

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
```

The app will open on **http://localhost:5173**

### 3. Test Multi-User Chat

Open two browser tabs at http://localhost:5173 and log in with different demo accounts:

| Email | Password |
|-------|----------|
| alice@demo.com | password123 |
| bob@demo.com | password123 |
| charlie@demo.com | password123 |
| diana@demo.com | password123 |

## 🏗️ Architecture

```
┌─────────────┐        WebSocket         ┌──────────────┐
│   React     │ ◄─────────────────────► │  Socket.io   │
│   Client    │        REST API          │   Server     │
│   (Vite)    │ ◄─────────────────────► │  (Express)   │
└─────────────┘                          └──────┬───────┘
                                                │
                                         ┌──────▼───────┐
                                         │   MongoDB    │
                                         │  (In-Memory) │
                                         └──────────────┘
```

## 📁 Project Structure

```
realtime-chat-app/
├── client/          # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── context/      # React contexts
│       ├── services/     # API layer
│       └── utils/        # Helpers
├── server/          # Node.js backend
│   ├── config/      # DB config
│   ├── controllers/ # Route handlers
│   ├── middleware/   # JWT auth
│   ├── models/      # Mongoose models
│   ├── routes/      # Express routes
│   └── socket/      # Socket.io handlers
└── README.md
```

## 🔮 Future Enhancements (FAANG Level)

- **Redis Pub/Sub** for horizontal scaling across multiple server instances
- **Kafka Message Queue** for guaranteed message delivery and replay
- **Push Notifications** via Web Push API / Firebase Cloud Messaging
- **End-to-End Encryption** using the Web Crypto API
- **Message Search** with MongoDB text indexes or Elasticsearch
- **Voice/Video Calls** using WebRTC
