import React, { useEffect } from "react";

const Toast = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-500">
      <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 backdrop-blur-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        {/* <span className="font-medium">{message}</span> */}
      </div>
    </div>
  );
};

export default Toast;
