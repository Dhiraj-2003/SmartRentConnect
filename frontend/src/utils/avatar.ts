import avatarDefault from '@/assets/avatardefault.png';

/**
 * Get user avatar image with fallback to default avatar
 * @param user - User object with potential profileImage
 * @returns Avatar image URL
 */
export const getUserAvatar = (user: any): string => {
  return user?.profileImage || avatarDefault;
};

/**
 * Get default avatar image
 * @returns Default avatar image URL
 */
export const getDefaultAvatar = (): string => {
  return avatarDefault;
};

/**
 * Handle avatar image error by setting default avatar
 * @param event - Image error event
 */
export const handleAvatarError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const target = event.target as HTMLImageElement;
  target.src = avatarDefault;
};
