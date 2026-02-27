import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const UserDropdown = ({ onOpenPasswordModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/agent/profile');
        setProfile(data);
      } catch (error) {
        console.error('Failed to load user dropdown profile:', error);
      }
    };

    loadProfile();
  }, []);

  const displayName = profile?.name || 'Agent';
  const displayRegion = profile?.region || 'No Region';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'A';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-md flex items-center justify-center text-white font-semibold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <span className="text-sm">{initials}</span>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 transform origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="p-4 bg-slate-50/50">
          <p className="text-sm font-bold text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {displayRegion}
          </p>
        </div>

        <div className="p-2">
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenPasswordModal();
            }}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDropdown;
