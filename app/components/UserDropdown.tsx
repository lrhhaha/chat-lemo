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
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-[#050509]"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <UserAvatar name={user.name} imageUrl={user.image} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-slate-800 bg-[#050509] shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 z-50"
        >
          <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-800/50">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
              {user.email}
            </p>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:outline-none"
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
