const Chat = require('../models/Chat');
const User = require('../models/User');

// POST /api/chats — Access or create 1-on-1 chat
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Check if chat already exists
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    chat = await User.populate(chat, {
      path: 'latestMessage.sender',
      select: 'username avatar email',
    });

    if (chat.length > 0) {
      return res.json(chat[0]);
    }

    // Create new chat
    const newChat = await Chat.create({
      chatName: 'Private Chat',
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      'users',
      '-password'
    );

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chats — Get all chats for current user
const getChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username avatar email',
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chats/group — Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;

    if (!name || !users || users.length < 2) {
      return res
        .status(400)
        .json({ message: 'Group name and at least 2 other users required' });
    }

    // Add current user to group
    const allUsers = [...users, req.user._id.toString()];

    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: allUsers,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/chats/group/:id — Update group chat
const updateGroupChat = async (req, res) => {
  try {
    const { chatName, addUser, removeUser } = req.body;
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chatName) {
      chat.chatName = chatName;
    }

    if (addUser) {
      if (!chat.users.includes(addUser)) {
        chat.users.push(addUser);
      }
    }

    if (removeUser) {
      chat.users = chat.users.filter(
        (u) => u.toString() !== removeUser.toString()
      );
    }

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { accessChat, getChats, createGroupChat, updateGroupChat };
