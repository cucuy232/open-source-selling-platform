import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? '#117743' : type === 'error' ? '#d00' : '#0056b3';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: bg,
        color: 'white',
        padding: '15px 30px',
        fontWeight: 'bold',
        fontSize: '1rem',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.2)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        borderTop: '2px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <span>{message}</span>
      <button 
        style={{ 
          cursor: 'pointer', 
          background: 'rgba(255,255,255,0.2)', 
          border: '1px solid rgba(255,255,255,0.4)', 
          color: 'white',
          padding: '4px 10px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }} 
        onClick={onClose}
      >
        DISMISS
      </button>
    </motion.div>
  );
};

export default Toast;
