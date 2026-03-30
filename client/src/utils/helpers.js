export const getAvatarColor = (name) => {
  const colors = [
    'linear-gradient(135deg, #00a884, #25d366)',
    'linear-gradient(135deg, #e06c75, #be5046)',
    'linear-gradient(135deg, #56b6c2, #2680c2)',
    'linear-gradient(135deg, #d19a66, #e5c07b)',
    'linear-gradient(135deg, #c678dd, #7c3aed)',
    'linear-gradient(135deg, #61afef, #0ea5e9)',
    'linear-gradient(135deg, #98c379, #16a34a)',
    'linear-gradient(135deg, #e5c07b, #b45309)',
  ];
  
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'now';
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m`;
  }
  
  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // This week
  if (diff < 604800000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Older
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateDivider = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) return 'Today';
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const getChatName = (chat, currentUserId) => {
  if (!chat) return '';
  if (chat.isGroupChat) return chat.chatName;
  
  const otherUser = chat.users?.find(
    (u) => (u._id || u) !== currentUserId
  );
  return otherUser?.username || 'Unknown User';
};

export const getChatUser = (chat, currentUserId) => {
  if (!chat || chat.isGroupChat) return null;
  return chat.users?.find((u) => (u._id || u) !== currentUserId);
};

export const EMOJI_LIST = [
  '😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡',
  '👍', '👎', '❤️', '🔥', '🎉', '👏', '🙏', '💯',
  '😱', '🤗', '🤣', '😴', '🥺', '😤', '🤝', '✨',
];

export const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];
