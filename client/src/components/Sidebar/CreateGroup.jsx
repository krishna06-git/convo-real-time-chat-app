import { useState, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { searchUsersAPI } from '../../services/api';
import Modal from '../Common/Modal';
import Avatar from '../Common/Avatar';

const CreateGroup = ({ isOpen, onClose }) => {
  const { createGroup } = useChat();
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (query) => {
    setSearch(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      const { data } = await searchUsersAPI(query);
      setResults(data.filter((u) => !selectedUsers.find((s) => s._id === u._id)));
    } catch (err) {
      console.error('Search error:', err);
    }
  }, [selectedUsers]);

  const addUser = (user) => {
    setSelectedUsers((prev) => [...prev, user]);
    setResults((prev) => prev.filter((u) => u._id !== user._id));
    setSearch('');
  };

  const removeUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;

    setLoading(true);
    await createGroup(
      groupName,
      selectedUsers.map((u) => u._id)
    );
    
    setGroupName('');
    setSelectedUsers([]);
    setSearch('');
    setResults([]);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Chat">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Add Members (min. 2)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search users to add..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="selected-users">
            {selectedUsers.map((u) => (
              <span key={u._id} className="selected-user-chip">
                {u.username}
                <button onClick={() => removeUser(u._id)}>✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="user-search-results">
          {results.map((u) => (
            <div
              key={u._id}
              className="user-search-item"
              onClick={() => addUser(u)}
            >
              <Avatar name={u.username} avatar={u.avatar} size="sm" />
              <div className="user-search-item-info">
                <h4>{u.username}</h4>
                <p>{u.email}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="auth-btn"
          onClick={handleCreate}
          disabled={loading || !groupName.trim() || selectedUsers.length < 2}
        >
          {loading ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
        </button>
      </div>
    </Modal>
  );
};

export default CreateGroup;
