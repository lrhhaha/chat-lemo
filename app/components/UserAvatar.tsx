'use client';

import React from 'react';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

export function UserAvatar({ name, imageUrl, className = '' }: UserAvatarProps) {
  const initials = React.useMemo(() => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '?';
  }, [name]);

  const baseClasses = "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 shadow-sm";

  return (
    <div className={`${baseClasses} ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-xs font-medium text-slate-200 backdrop-blur-sm">
          {initials}
        </div>
      )}
    </div>
  );
}
