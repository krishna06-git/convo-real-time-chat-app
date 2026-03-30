import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import ChatItem from './ChatItem';
import UserSearch from './UserSearch';
import CreateGroup from './CreateGroup';
import Avatar from '../Common/Avatar';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { chats, selectedChat, setSelectedChat, fetchChats, notifications } = useChat();
  const { isUserOnline } = useSocket();
  const [searchOpen, setSearchOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const filteredChats = chats.filter((chat) => {
    if (!filter) return true;
    const name = chat.isGroupChat
      ? chat.chatName
      : chat.users?.find((u) => u._id !== user?._id)?.username || '';
    return name.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <>
      <div className="sidebar">
        {/* WhatsApp-style header: avatar left, icons right */}
        <div className="sidebar-header">
          <div className="sidebar-user" style={{ cursor: 'pointer' }}>
            <Avatar name={user?.username} size="sm" showOnline isOnline={true} />
            <span style={{ fontWeight: 700, fontSize: 'var(--font-lg)', color: 'var(--accent-secondary)', marginLeft: '8px', letterSpacing: '-0.3px' }}>Convo</span>
          </div>
          <div className="sidebar-actions">
            {/* Communities */}
            <button className="sidebar-action-btn" title="Communities">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V18h13v-1.75c0-.76-.33-1.43-.86-1.96.56.12 1.13.21 1.86.21 2.17 0 6.5 1.08 6.5 3.25V18h2v-1.75c0-2.42-5.5-3.25-7.5-3.25zm-9 0c1.93 0 3.5-1.57 3.5-3.5S9.43 6 7.5 6 4 7.57 4 9.5 5.57 13 7.5 13zm9 0c1.93 0 3.5-1.57 3.5-3.5S18.43 6 16.5 6 13 7.57 13 9.5s1.57 3.5 3.5 3.5z" />
              </svg>
            </button>
            {/* New Chat */}
            <button
              className="sidebar-action-btn"
              title="New chat"
              onClick={() => setSearchOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z" />
              </svg>
            </button>
            {/* More options (3 dots) */}
            <button
              className="sidebar-action-btn"
              title="Menu"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="sidebar-search">
          <div className="search-input-wrapper">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search or start new chat"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Chats list */}
        <div className="sidebar-chats">
          {filteredChats.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
              {filter ? 'No chats found' : 'No conversations yet. Start a new chat!'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={selectedChat?._id === chat._id}
                onClick={() => setSelectedChat(chat)}
                currentUserId={user?._id}
                isOnline={
                  !chat.isGroupChat &&
                  isUserOnline(
                    chat.users?.find((u) => u._id !== user?._id)?._id
                  )
                }
                unreadCount={
                  notifications.filter(
                    (n) => (n.chat._id || n.chat) === chat._id
                  ).length
                }
              />
            ))
          )}
        </div>

        {/* Footer with logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Avatar name={user?.username} size="sm" showOnline isOnline={true} />
            <div className="sidebar-user-info">
              <h4>{user?.username}</h4>
              <p>Online</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {/* New Group */}
            <button
              className="logout-btn"
              title="New Group"
              onClick={() => setGroupOpen(true)}
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V18h13v-1.75c0-.76-.33-1.43-.86-1.96.56.12 1.13.21 1.86.21 2.17 0 6.5 1.08 6.5 3.25V18h2v-1.75c0-2.42-5.5-3.25-7.5-3.25zm-9 0c1.93 0 3.5-1.57 3.5-3.5S9.43 6 7.5 6 4 7.57 4 9.5 5.57 13 7.5 13zm9 0c1.93 0 3.5-1.57 3.5-3.5S18.43 6 16.5 6 13 7.57 13 9.5s1.57 3.5 3.5 3.5z" />
              </svg>
            </button>
            {/* Logout */}
            <button className="logout-btn" onClick={logout} title="Logout">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <UserSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CreateGroup isOpen={groupOpen} onClose={() => setGroupOpen(false)} />
    </>
  );
};

export default Sidebar;
