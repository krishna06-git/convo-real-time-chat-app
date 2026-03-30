import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '../Common/Avatar';
import { getChatName, getChatUser } from '../../utils/helpers';

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    selectedChat,
    messages,
    loadingMessages,
    fetchMessages,
    typingUsers,
  } = useChat();
  const { isUserOnline } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (!selectedChat) {
    return (
      <div className="chat-window">
        <div className="chat-window-empty">
          <div className="chat-window-empty-icon">
            {/* WhatsApp-style phone/laptop icon */}
            <svg viewBox="0 0 303 172" width="220" height="140" style={{ opacity: 0.15 }}>
              <path
                fill="var(--accent-secondary)"
                d="M229.565 160.229c19.595 0 35.theid-2-35.735-2h-26.565v-138.458c0-10.697-8.757-19.363-19.565-19.363h-149.435c-10.808 0-19.565 8.666-19.565 19.363v138.458h-26.565c-19.595 0-35.735 15.865-35.735 35.771h313.3c0-19.906-16.14-35.771-35.735-35.771z"
                transform="translate(-2 -2) scale(1)"
              />
              <circle cx="151.5" cy="86" r="40" fill="var(--accent-secondary)" opacity="0.6" />
            </svg>
          </div>
          <h3>Welcome to Convo</h3>
          <p>
            Select a conversation to start chatting, or search for friends to
            connect with.
          </p>
          <div className="chat-window-empty-lock">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            Your personal messages are end-to-end encrypted
          </div>
        </div>
      </div>
    );
  }

  const chatName = getChatName(selectedChat, user?._id);
  const chatUser = getChatUser(selectedChat, user?._id);
  const online = chatUser ? isUserOnline(chatUser._id) : false;
  const typingData = typingUsers[selectedChat._id];

  let lastDate = '';

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <Avatar
            name={chatName}
            avatar={chatUser?.avatar}
            showOnline={!selectedChat.isGroupChat}
            isOnline={online}
          />
          <div className="chat-header-details">
            <h3>{chatName}</h3>
            {selectedChat.isGroupChat ? (
              <span className="chat-header-status" style={{ color: 'var(--text-tertiary)' }}>
                {selectedChat.users?.length} members
              </span>
            ) : (
              <span className={`chat-header-status ${online ? '' : 'offline'}`}>
                {online ? 'online' : 'last seen recently'}
              </span>
            )}
          </div>
        </div>
        <div className="chat-header-actions">
          {/* Video call */}
          <button className="chat-header-btn" title="Video call">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </button>
          {/* Voice call */}
          <button className="chat-header-btn" title="Voice call">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>
          {/* Search */}
          <button className="chat-header-btn" title="Search">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          {/* More options */}
          <button className="chat-header-btn" title="More options">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {loadingMessages ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const msgDate = new Date(msg.createdAt).toDateString();
              let showDateDivider = false;
              if (msgDate !== lastDate) {
                lastDate = msgDate;
                showDateDivider = true;
              }

              return (
                <div key={msg._id || index}>
                  {showDateDivider && (
                    <div className="messages-date-divider">
                      <span>
                        {new Date(msg.createdAt).toDateString() === new Date().toDateString()
                          ? 'Today'
                          : new Date(msg.createdAt).toLocaleDateString([], {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOwn={msg.sender?._id === user?._id}
                    showSender={selectedChat.isGroupChat && msg.sender?._id !== user?._id}
                    chatUserCount={selectedChat.users?.length || 2}
                  />
                </div>
              );
            })}

            {typingData && typingData.userId !== user?._id && (
              <TypingIndicator username={typingData.username} />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
