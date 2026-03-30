const TypingIndicator = ({ username }) => {
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="typing-indicator-text">{username} is typing...</span>
    </div>
  );
};

export default TypingIndicator;
