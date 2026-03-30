const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🟢 User connected: ${userId}`);

    // Set user online
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Join personal room
    socket.join(userId);

    // Broadcast online status
    io.emit('user-online', { userId });

    // ---- CHAT EVENTS ----

    // Join a chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`   User ${userId} joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
    });

    // ---- MESSAGE EVENTS ----

    // New message
    socket.on('new-message', (message) => {
      const chat = message.chat;
      if (!chat || !chat.users) return;

      chat.users.forEach((user) => {
        const uid = user._id || user;
        if (uid.toString() === userId) return;
        socket.to(uid.toString()).emit('message-received', message);
      });
    });

    // ---- TYPING EVENTS ----

    socket.on('typing', ({ chatId, username }) => {
      socket.to(chatId).emit('typing-indicator', { chatId, userId, username });
    });

    socket.on('stop-typing', ({ chatId }) => {
      socket.to(chatId).emit('typing-stopped', { chatId, userId });
    });

    // ---- REACTION EVENTS ----

    socket.on('reaction-added', ({ messageId, chatId, reactions }) => {
      socket.to(chatId).emit('reaction-updated', { messageId, reactions });
    });

    // ---- READ RECEIPT EVENTS ----

    socket.on('message-read', ({ chatId, messageId, userId: readByUserId }) => {
      socket.to(chatId).emit('message-read-update', {
        chatId,
        messageId,
        readByUserId,
      });
    });

    // ---- NOTIFICATION EVENTS ----

    socket.on('send-notification', ({ recipientId, notification }) => {
      socket.to(recipientId).emit('notification', notification);
    });

    // ---- DISCONNECT ----

    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      io.emit('user-offline', { userId, lastSeen: new Date() });
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
