import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  className = '' 
}) => {
  const sizeConfig = {
    small: { icon: 'w-8 h-8', text: 'text-lg', iconSize: 20 },
    medium: { icon: 'w-10 h-10', text: 'text-2xl', iconSize: 24 },
    large: { icon: 'w-12 h-12', text: 'text-4xl', iconSize: 28 }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Icon - Calendar/Sharing icon */}
      <div className={`flex items-center justify-center ${config.icon} rounded-lg bg-gradient-to-br from-blue-600 to-purple-600`}>
        <svg width={config.iconSize} height={config.iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 3H16M3 7H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${config.text}`}>
          SharinGo
        </span>
      )}
    </div>
  );
};

export default Logo;
