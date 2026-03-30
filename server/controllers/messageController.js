const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// POST /api/messages — Send a message
const sendMessage = async (req, res) => {
  try {
    const { content, chatId, messageType, fileUrl, fileName } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: 'chatId is required' });
    }

    const messageData = {
      sender: req.user._id,
      content: content || '',
      chat: chatId,
      messageType: messageType || 'text',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      readBy: [req.user._id],
    };

    let message = await Message.create(messageData);

    message = await message.populate('sender', 'username avatar');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'username avatar email isOnline',
    });

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/messages/:chatId — Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar')
      .populate('readBy', 'username')
      .populate('reactions.user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ chat: chatId });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/messages/:id/react — Add/toggle reaction
const toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        (r) => !(r.user.toString() === userId.toString() && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .populate('reactions.user', 'username');

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/messages/:id/read — Mark message as read
const markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/messages/read-all/:chatId — Mark all messages as read
const markAllAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  toggleReaction,
  markAsRead,
  markAllAsRead,
};
