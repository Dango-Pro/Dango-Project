import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isOpen: boolean;
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'success', isOpen, duration = 2000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          setTimeout(onClose, 200); // reduced from 300
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const colors = {
    success: { bg: '#e6f7e6', border: '#52c41a', text: '#389e0d' },
    error: { bg: '#fff1f0', border: '#ff4d4f', text: '#cf1322' },
    info: { bg: '#e6f7ff', border: '#1890ff', text: '#096dd9' }
  };

  const color = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: visible ? '20px' : '-100px',
        right: '20px',
        backgroundColor: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '12px',
        padding: '16px 24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 2000,
        minWidth: '300px',
        maxWidth: '500px',
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>
          {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <p style={{ margin: 0, color: color.text, fontWeight: 600, fontSize: '15px' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
