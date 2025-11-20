'use client';

import { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000); // Auto-hide after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded border ${typeStyles[type]} shadow-lg transition-opacity duration-300`}
    >
      <p>{message}</p>
      <button 
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="absolute top-1 right-1 text-xl"
      >
        &times;
      </button>
    </div>
  );
};

export default Notification;