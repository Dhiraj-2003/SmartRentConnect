import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getUserAvatar, getDefaultAvatar } from '@/utils/avatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  user: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showEditOverlay?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-24 w-24'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showEditOverlay = false,
  onClick
}) => {
  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
      title={user?.fullName || user?.username}
    >
      <Avatar className={`${sizeClasses[size]} border-2 border-primary/20 hover:border-primary/40 transition-colors`}>
        <AvatarImage 
          src={getUserAvatar(user)} 
          alt={user?.fullName || user?.username}
          className="hover:scale-105 transition-transform"
        />
        <AvatarFallback>
          <img 
            src={getDefaultAvatar()} 
            alt="Default Avatar"
            className="w-full h-full object-cover"
          />
        </AvatarFallback>
      </Avatar>
      
      {showEditOverlay && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          <User className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
        </div>
      )}
    </div>
  );
};
