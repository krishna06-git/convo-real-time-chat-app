import { useState, useRef, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { EMOJI_LIST, formatFileSize } from '../../utils/helpers';

const MessageInput = () => {
  const { selectedChat, sendMessage, uploadFile, emitTyping, emitStopTyping } =
    useChat();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFilePreview, setPendingFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTyping = useCallback(
    (e) => {
      setText(e.target.value);

      if (!selectedChat) return;

      emitTyping(selectedChat._id);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(selectedChat._id);
      }, 2000);
    },
    [selectedChat, emitTyping, emitStopTyping]
  );

  const handleSend = async () => {
    if (!text.trim() && !pendingFile) return;

    if (pendingFile) {
      setUploading(true);
      const uploaded = await uploadFile(pendingFile);
      setUploading(false);

      if (uploaded) {
        await sendMessage(
          text.trim(),
          uploaded.messageType,
          uploaded.fileUrl,
          uploaded.fileName
        );
      }

      setPendingFile(null);
      setPendingFilePreview(null);
    } else {
      await sendMessage(text.trim());
    }

    setText('');
    setShowEmoji(false);

    if (selectedChat) {
      emitStopTyping(selectedChat._id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPendingFilePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPendingFilePreview(null);
    }

    e.target.value = '';
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const hasContent = text.trim() || pendingFile;

  return (
    <div className="message-input-container">
      {/* File Preview */}
      {pendingFile && (
        <div className="file-preview">
          {pendingFilePreview ? (
            <img
              src={pendingFilePreview}
              alt="Preview"
              className="file-preview-image"
            />
          ) : (
            <span style={{ fontSize: '2rem' }}>📎</span>
          )}
          <div className="file-preview-info">
            <div className="file-preview-name">{pendingFile.name}</div>
            <div className="file-preview-size">
              {formatFileSize(pendingFile.size)}
            </div>
          </div>
          <button
            className="file-preview-remove"
            onClick={() => {
              setPendingFile(null);
              setPendingFilePreview(null);
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="emoji-picker-container">
          <div className="emoji-grid">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="message-input-wrapper">
        <div className="message-input-actions">
          {/* Emoji */}
          <button
            className="input-action-btn"
            onClick={() => setShowEmoji(!showEmoji)}
            title="Emoji"
            style={{ fontSize: '1.4rem' }}
          >
            {showEmoji ? '⌨️' : '😊'}
          </button>
          {/* Attach */}
          <button
            className="input-action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            style={{ fontSize: '1.4rem' }}
          >
            📎
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
        </div>

        <textarea
          className="message-textarea"
          placeholder="Type a message"
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>

      {/* Send / Mic button */}
      <button
        className="send-btn"
        onClick={hasContent ? handleSend : undefined}
        disabled={uploading}
        title={hasContent ? 'Send' : 'Voice message'}
        style={!hasContent ? { background: 'var(--accent-secondary)' } : {}}
      >
        {uploading ? (
          <div className="loading-spinner" style={{ width: 20, height: 20, borderTopColor: '#111b21' }} />
        ) : hasContent ? (
          /* Send arrow icon */
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#111b21">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
          </svg>
        ) : (
          /* Microphone icon */
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#111b21">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MessageInput;
