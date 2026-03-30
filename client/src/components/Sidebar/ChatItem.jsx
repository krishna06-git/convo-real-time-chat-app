import Avatar from '../Common/Avatar';
import { getChatName, getChatUser, formatTime } from '../../utils/helpers';

const ChatItem = ({ chat, isActive, onClick, currentUserId, isOnline, unreadCount }) => {
  const chatName = getChatName(chat, currentUserId);
  const chatUser = getChatUser(chat, currentUserId);
  
  const lastMessage = chat.latestMessage;
  let lastMessageText = '';
  
  if (lastMessage) {
    const senderName = lastMessage.sender?.username || '';
    if (lastMessage.messageType === 'image') {
      lastMessageText = `${chat.isGroupChat ? senderName + ': ' : ''}📷 Photo`;
    } else if (lastMessage.messageType === 'file') {
      lastMessageText = `${chat.isGroupChat ? senderName + ': ' : ''}📎 File`;
    } else {
      lastMessageText = chat.isGroupChat
        ? `${senderName}: ${lastMessage.content}`
        : lastMessage.content;
    }
  }

  return (
    <div className={`chat-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="chat-item-avatar">
        <Avatar
          name={chatName}
          avatar={chatUser?.avatar}
          showOnline={!chat.isGroupChat}
          isOnline={isOnline}
        />
      </div>
      <div className="chat-item-info">
        <div className="chat-item-name">
          {chat.isGroupChat ? '👥 ' : ''}
          {chatName}
        </div>
        {lastMessageText && (
          <div className="chat-item-last-message">{lastMessageText}</div>
        )}
      </div>
      <div className="chat-item-meta">
        {lastMessage && (
          <span className="chat-item-time">
            {formatTime(lastMessage.createdAt)}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="chat-item-unread">{unreadCount}</span>
        )}
      </div>
    </div>
  );
};

export default ChatItem;
