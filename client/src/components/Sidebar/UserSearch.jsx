import { useState, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { searchUsersAPI } from '../../services/api';
import Modal from '../Common/Modal';
import Avatar from '../Common/Avatar';

const UserSearch = ({ isOpen, onClose }) => {
  const { accessChat } = useChat();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (query) => {
    setSearch(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await searchUsersAPI(query);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  }, []);

  const handleSelect = async (userId) => {
    await accessChat(userId);
    setSearch('');
    setResults([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a Conversation">
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className="user-search-results">
        {loading && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Searching...
          </div>
        )}
        {!loading && results.length === 0 && search && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
            No users found
          </div>
        )}
        {results.map((u) => (
          <div
            key={u._id}
            className="user-search-item"
            onClick={() => handleSelect(u._id)}
          >
            <Avatar name={u.username} avatar={u.avatar} size="sm" />
            <div className="user-search-item-info">
              <h4>{u.username}</h4>
              <p>{u.email}</p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default UserSearch;
