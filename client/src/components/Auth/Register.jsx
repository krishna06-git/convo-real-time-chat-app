import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <p>Create your account to get started</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                type="text"
                className="form-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading || !username || !email || !password}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
