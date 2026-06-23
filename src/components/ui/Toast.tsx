import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastStyles: Record<ToastType, { bg: string; icon: JSX.Element }> = {
  success: { 
    bg: '#10b981', 
    icon: <FaCheckCircle /> 
  },
  error: { 
    bg: '#ef4444', 
    icon: <FaExclamationCircle /> 
  },
  warning: { 
    bg: '#f59e0b', 
    icon: <FaExclamationCircle /> 
  },
  info: { 
    bg: '#3b82f6', 
    icon: <FaInfoCircle /> 
  },
};

export default function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const style = toastStyles[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '12px',
        backgroundColor: style.bg,
        color: '#fff',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        maxWidth: '450px',
        minWidth: '280px',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: 'translateX(0)',
        opacity: 1,
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
        {style.icon}
      </span>
      <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4 }}>
        {message}
      </span>
      <button
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '4px',
          borderRadius: '50%',
          transition: 'background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <FaTimes />
      </button>
    </div>
  );
}