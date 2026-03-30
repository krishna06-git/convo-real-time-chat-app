import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';
import './App.css';

const ChatApp = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'login') {
      return <Login onSwitchToRegister={() => setAuthMode('register')} />;
    }
    return <Register onSwitchToLogin={() => setAuthMode('login')} />;
  }

  return (
    <SocketProvider>
      <ChatProvider>
        <div className="app-layout">
          <Sidebar />
          <ChatWindow />
        </div>
      </ChatProvider>
    </SocketProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
};

export default App;
