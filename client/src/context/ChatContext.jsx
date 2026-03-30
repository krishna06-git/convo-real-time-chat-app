import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import {
  getChatsAPI,
  accessChatAPI,
  createGroupChatAPI,
  getMessagesAPI,
  sendMessageAPI,
  toggleReactionAPI,
  markAllAsReadAPI,
  uploadFileAPI,
} from '../services/api';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const { data } = await getChatsAPI();
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
    setLoadingChats(false);
  }, []);

  // Access or create private chat
  const accessChat = useCallback(async (userId) => {
    try {
      const { data } = await accessChatAPI(userId);
      setSelectedChat(data);

      // Add to chats if not already there
      setChats((prev) => {
        const exists = prev.find((c) => c._id === data._id);
        if (exists) return prev;
        return [data, ...prev];
      });

      return data;
    } catch (err) {
      console.error('Error accessing chat:', err);
    }
  }, []);

  // Create group chat
  const createGroup = useCallback(async (name, userIds) => {
    try {
      const { data } = await createGroupChatAPI({ name, users: userIds });
      setChats((prev) => [data, ...prev]);
      setSelectedChat(data);
      return data;
    } catch (err) {
      console.error('Error creating group:', err);
    }
  }, []);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const { data } = await getMessagesAPI(chatId);
      setMessages(data.messages);

      // Mark all as read
      await markAllAsReadAPI(chatId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
    setLoadingMessages(false);
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (content, messageType = 'text', fileUrl = '', fileName = '') => {
      if (!selectedChat) return;

      try {
        const { data } = await sendMessageAPI({
          content,
          chatId: selectedChat._id,
          messageType,
          fileUrl,
          fileName,
        });

        setMessages((prev) => [...prev, data]);

        // Emit via socket
        if (socket) {
          socket.emit('new-message', data);
        }

        // Update chat list
        setChats((prev) =>
          prev.map((c) =>
            c._id === selectedChat._id
              ? { ...c, latestMessage: data }
              : c
          ).sort((a, b) => {
            const aTime = a.latestMessage?.createdAt || a.updatedAt;
            const bTime = b.latestMessage?.createdAt || b.updatedAt;
            return new Date(bTime) - new Date(aTime);
          })
        );

        return data;
      } catch (err) {
        console.error('Error sending message:', err);
      }
    },
    [selectedChat, socket]
  );

  // Toggle reaction
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      try {
        const { data } = await toggleReactionAPI(messageId, emoji);

        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, reactions: data.reactions } : m))
        );

        // Emit via socket
        if (socket && selectedChat) {
          socket.emit('reaction-added', {
            messageId,
            chatId: selectedChat._id,
            reactions: data.reactions,
          });
        }
      } catch (err) {
        console.error('Error toggling reaction:', err);
      }
    },
    [socket, selectedChat]
  );

  // Upload file
  const uploadFile = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await uploadFileAPI(formData);
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      return null;
    }
  }, []);

  // Typing events
  const emitTyping = useCallback(
    (chatId) => {
      if (socket && user) {
        socket.emit('typing', { chatId, username: user.username });
      }
    },
    [socket, user]
  );

  const emitStopTyping = useCallback(
    (chatId) => {
      if (socket) {
        socket.emit('stop-typing', { chatId });
      }
    },
    [socket]
  );

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message) => {
      // If the message belongs to the selected chat, add it
      if (selectedChat && message.chat._id === selectedChat._id) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });

        // Mark as read
        if (socket && user) {
          socket.emit('message-read', {
            chatId: selectedChat._id,
            messageId: message._id,
            userId: user._id,
          });
        }
      } else {
        // Show notification
        setNotifications((prev) => [message, ...prev]);
      }

      // Update chat list
      setChats((prev) =>
        prev.map((c) =>
          c._id === (message.chat._id || message.chat)
            ? { ...c, latestMessage: message }
            : c
        ).sort((a, b) => {
          const aTime = a.latestMessage?.createdAt || a.updatedAt;
          const bTime = b.latestMessage?.createdAt || b.updatedAt;
          return new Date(bTime) - new Date(aTime);
        })
      );
    };

    const handleTyping = ({ chatId, userId, username }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatId]: { userId, username },
      }));
    };

    const handleStopTyping = ({ chatId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[chatId];
        return next;
      });
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    const handleMessageReadUpdate = ({ messageId, readByUserId }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === messageId && !m.readBy?.some?.((r) => (r._id || r) === readByUserId)) {
            return {
              ...m,
              readBy: [...(m.readBy || []), readByUserId],
            };
          }
          return m;
        })
      );
    };

    socket.on('message-received', handleMessageReceived);
    socket.on('typing-indicator', handleTyping);
    socket.on('typing-stopped', handleStopTyping);
    socket.on('reaction-updated', handleReactionUpdated);
    socket.on('message-read-update', handleMessageReadUpdate);

    return () => {
      socket.off('message-received', handleMessageReceived);
      socket.off('typing-indicator', handleTyping);
      socket.off('typing-stopped', handleStopTyping);
      socket.off('reaction-updated', handleReactionUpdated);
      socket.off('message-read-update', handleMessageReadUpdate);
    };
  }, [socket, selectedChat, user]);

  // Join chat room when selected
  useEffect(() => {
    if (!socket || !selectedChat) return;

    socket.emit('join-chat', selectedChat._id);

    return () => {
      socket.emit('leave-chat', selectedChat._id);
    };
  }, [socket, selectedChat]);

  const value = {
    chats,
    selectedChat,
    messages,
    loadingChats,
    loadingMessages,
    typingUsers,
    notifications,
    setSelectedChat,
    setNotifications,
    fetchChats,
    accessChat,
    createGroup,
    fetchMessages,
    sendMessage,
    toggleReaction,
    uploadFile,
    emitTyping,
    emitStopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
