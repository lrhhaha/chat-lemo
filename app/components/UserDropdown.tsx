'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface User {
  name: string;
  email: string;
  image?: string | null;
}

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <UserAvatar name={user.name} imageUrl={user.image} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-60 origin-top-right overflow-hidden rounded-lg border border-border-secondary bg-bg-elevated shadow-elevated animate-in fade-in zoom-in-95 duration-100 z-50"
        >
          <div className="px-4 py-3 border-b border-border-secondary bg-bg-component/50">
            <p className="text-sm font-medium text-text-main truncate">
              {user.name}
            </p>
            <p className="text-xs text-text-secondary truncate mt-0.5 font-mono">
              {user.email}
            </p>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-error transition-colors hover:bg-error/10 focus:bg-error/10 focus:outline-none"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
