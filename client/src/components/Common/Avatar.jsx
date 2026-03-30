import { getInitials, getAvatarColor } from '../../utils/helpers';

const Avatar = ({ name, avatar, size = 'md', showOnline = false, isOnline = false }) => {
  const sizeClass = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : '';

  return (
    <div
      className={`avatar ${sizeClass}`}
      style={{ background: getAvatarColor(name) }}
    >
      {avatar ? (
        <img src={avatar} alt={name} />
      ) : (
        getInitials(name)
      )}
      {showOnline && (
        <span className={`online-indicator ${sizeClass} ${isOnline ? '' : 'offline'}`} />
      )}
    </div>
  );
};

export default Avatar;
