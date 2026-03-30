require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { initializeSocket } = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);

// Allowed origins: the production frontend URL and local dev
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173']
  : ['http://localhost:5173'];

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local uploads folder (for local dev fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Convo', timestamp: new Date().toISOString() });
});

// Serve built React frontend (production)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log('📦 Serving built Convo frontend');
}

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    // Initialize socket handlers
    initializeSocket(io);

    server.listen(PORT, () => {
      console.log(`\n🚀 Convo server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
