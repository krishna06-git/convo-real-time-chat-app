import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('chatUser');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth APIs
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');
export const searchUsersAPI = (search) => API.get(`/auth/users?search=${search}`);

// Chat APIs
export const getChatsAPI = () => API.get('/chats');
export const accessChatAPI = (userId) => API.post('/chats', { userId });
export const createGroupChatAPI = (data) => API.post('/chats/group', data);
export const updateGroupChatAPI = (id, data) => API.put(`/chats/group/${id}`, data);

// Message APIs
export const getMessagesAPI = (chatId, page = 1) => API.get(`/messages/${chatId}?page=${page}`);
export const sendMessageAPI = (data) => API.post('/messages', data);
export const toggleReactionAPI = (messageId, emoji) => API.put(`/messages/${messageId}/react`, { emoji });
export const markAsReadAPI = (messageId) => API.put(`/messages/${messageId}/read`);
export const markAllAsReadAPI = (chatId) => API.put(`/messages/read-all/${chatId}`);

// Upload API
export const uploadFileAPI = (formData) =>
  API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default API;
