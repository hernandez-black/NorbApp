import React, { useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconColor = () => {
    if (type === 'danger') return '#ef4444';
    if (type === 'warning') return '#f59e0b';
    return '#3b82f6';
  };

  const getBgColor = () => {
    if (type === 'danger') return '#fef2f2';
    if (type === 'warning') return '#fffbeb';
    return '#eff6ff';
  };

  const getButtonColor = () => {
    if (type === 'danger') return '#dc2626';
    if (type === 'warning') return '#d97706';
    return '#2563eb';
  };

  const getButtonHover = () => {
    if (type === 'danger') return '#b91c1c';
    if (type === 'warning') return '#b45309';
    return '#1d4ed8';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          background: 'var(--fondo-card, #1e293b)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxWidth: '28rem',
          width: '100%',
          padding: '1.5rem',
          position: 'relative',
          animation: 'scaleIn 0.3s ease-out',
          border: '1px solid var(--borde, #334155)',
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            color: 'var(--texto-muted, #64748b)',
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'var(--texto, #f1f5f9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--texto-muted, #64748b)';
          }}
        >
          <FaTimes />
        </button>

        {/* Icono */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              background: getBgColor(),
            }}
          >
            <FaExclamationTriangle
              style={{
                fontSize: '2.5rem',
                color: getIconColor(),
              }}
            />
          </div>

          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: 'var(--texto, #f1f5f9)',
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--texto-secundario, #94a3b8)',
              marginBottom: '1.5rem',
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              width: '100%',
            }}
          >
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                background: 'var(--fondo, #0f172a)',
                color: 'var(--texto-secundario, #94a3b8)',
                border: '1px solid var(--borde, #334155)',
                borderRadius: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--fondo, #0f172a)';
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                background: getButtonColor(),
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = getButtonHover();
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = getButtonColor();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}