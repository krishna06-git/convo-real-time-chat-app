import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };


  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-icon">
              <svg viewBox="0 0 60 60" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="30" fill="#00a884"/>
                <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontWeight="800" fontFamily="Inter,sans-serif" fill="white">C</text>
              </svg>
            </span>
            <h1 style={{ color: 'var(--text-primary)', background: 'none', WebkitTextFillColor: 'var(--text-primary)' }}>Convo</h1>
            <p>Connect and chat with friends instantly</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister}>
              Create one
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Login;
