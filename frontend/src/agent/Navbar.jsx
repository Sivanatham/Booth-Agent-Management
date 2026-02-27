import React from 'react';
import UserDropdown from './UserDropdown';

const Navbar = ({ onOpenPasswordModal }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 shadow-sm px-4 sm:px-8 py-3 flex items-center justify-between transition-all duration-300">
      {/* Left side: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          B
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight hidden sm:block">
          BLO Portal
        </span>
      </div>

      {/* Right side: User Profile */}
      <UserDropdown onOpenPasswordModal={onOpenPasswordModal} />
    </nav>
  );
};

export default Navbar;
