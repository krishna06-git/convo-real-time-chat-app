import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { formatMessageTime, REACTION_EMOJIS } from '../../utils/helpers';
import Avatar from '../Common/Avatar';

// WhatsApp-style double-tick SVG
const DoubleTickIcon = ({ read }) => (
  <svg
    viewBox="0 0 18 18"
    width="16"
    height="16"
    fill={read ? '#53bdeb' : 'rgba(233,237,239,0.5)'}
    style={{ flexShrink: 0 }}
  >
    <path d="M1.5 10.5L5.5 14.5L10.5 6.5" stroke={read ? '#53bdeb' : 'rgba(233,237,239,0.5)'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10.5L10 14.5L16 4.5" stroke={read ? '#53bdeb' : 'rgba(233,237,239,0.5)'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Single tick for sent but not delivered
const SingleTickIcon = () => (
  <svg
    viewBox="0 0 18 18"
    width="16"
    height="16"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path d="M3 9.5L7 13.5L15 4.5" stroke="rgba(233,237,239,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MessageBubble = ({ message, isOwn, showSender, chatUserCount }) => {
  const { user } = useAuth();
  const { toggleReaction } = useChat();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleReaction = (emoji) => {
    toggleReaction(message._id, emoji);
    setShowReactionPicker(false);
  };

  // Group reactions by emoji
  const groupedReactions = {};
  (message.reactions || []).forEach((r) => {
    if (!groupedReactions[r.emoji]) {
      groupedReactions[r.emoji] = { emoji: r.emoji, users: [], ownReacted: false };
    }
    groupedReactions[r.emoji].users.push(r.user);
    if ((r.user?._id || r.user) === user?._id) {
      groupedReactions[r.emoji].ownReacted = true;
    }
  });

  // Read receipt status
  const readByOthers = (message.readBy || []).filter(
    (r) => (r._id || r) !== message.sender?._id
  );
  const isRead = readByOthers.length >= chatUserCount - 1 && chatUserCount > 1;

  return (
    <>
      <div className={`message-row ${isOwn ? 'own' : ''}`}>
        {!isOwn && showSender && (
          <Avatar name={message.sender?.username} size="sm" />
        )}

        <div className="message-bubble">
          {/* Hover Actions */}
          <div className="message-actions">
            <button
              className="message-action-btn"
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              title="React"
            >
              😊
            </button>
          </div>

          {/* Reaction Picker */}
          {showReactionPicker && (
            <div
              className="reaction-picker"
              style={{
                position: 'absolute',
                top: '-44px',
                [isOwn ? 'right' : 'left']: '0',
                zIndex: 10,
              }}
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => handleReaction(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Sender Name (group chats) */}
          {showSender && (
            <div className="message-sender">{message.sender?.username}</div>
          )}

          {/* Image Message */}
          {message.messageType === 'image' && message.fileUrl && (
            <div className="message-image" onClick={() => setLightboxOpen(true)}>
              <img src={message.fileUrl} alt="Shared" loading="lazy" />
            </div>
          )}

          {/* File Message */}
          {message.messageType === 'file' && message.fileUrl && (
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="message-file"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="message-file-icon">📎</span>
              <div className="message-file-info">
                <div className="message-file-name">
                  {message.fileName || 'File'}
                </div>
              </div>
            </a>
          )}

          {/* Text Content */}
          {message.content && (
            <div className="message-content">{message.content}</div>
          )}

          {/* Meta (time + read receipt) — WhatsApp inline bottom-right style */}
          <div className="message-meta">
            <span className="message-time">
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && (
              isRead
                ? <DoubleTickIcon read={true} />
                : readByOthers.length > 0
                  ? <DoubleTickIcon read={false} />
                  : <SingleTickIcon />
            )}
          </div>

          {/* Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className="message-reactions">
              {Object.values(groupedReactions).map((r) => (
                <span
                  key={r.emoji}
                  className={`reaction-badge ${r.ownReacted ? 'own' : ''}`}
                  onClick={() => handleReaction(r.emoji)}
                  title={r.users.map((u) => u?.username || 'User').join(', ')}
                >
                  {r.emoji}
                  <span className="reaction-count">{r.users.length}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && message.fileUrl && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <img src={message.fileUrl} alt="Full size" />
        </div>
      )}
    </>
  );
};

export default MessageBubble;
