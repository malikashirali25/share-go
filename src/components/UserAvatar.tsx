import { useState } from 'react';

interface UserAvatarProps {
  src?: string;
  alt: string;
  className?: string;
}

const UserAvatar = ({ src, alt, className = '' }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(alt);

  // Determine text size based on className
  const getTextSize = () => {
    if (className.includes('h-6') || className.includes('w-6')) return 'text-[8px]';
    if (className.includes('h-8') || className.includes('w-8')) return 'text-xs';
    if (className.includes('h-10') || className.includes('w-10')) return 'text-sm';
    if (className.includes('h-12') || className.includes('w-12')) return 'text-base';
    if (className.includes('h-16') || className.includes('w-16')) return 'text-lg';
    if (className.includes('h-20') || className.includes('w-20')) return 'text-xl';
    if (className.includes('h-24') || className.includes('w-24')) return 'text-2xl';
    return 'text-xs';
  };

  const textSize = getTextSize();

  // If no src or error, show placeholder immediately
  if (!src || imageError) {
    return (
      <div className={`bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
        <span className={textSize}>{initials}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full rounded-full object-cover ${imageLoaded && !imageError ? '' : 'hidden'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {(!imageLoaded || imageError) && (
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold`}>
          <span className={textSize}>{initials}</span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;

