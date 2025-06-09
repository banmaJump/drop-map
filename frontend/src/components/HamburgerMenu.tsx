import React from 'react';
import './HamburgerMenu.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const HamburgerMenu: React.FC<Props> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="hamburger-overlay"
      onClick={onClose}
    >
      <div
        className="hamburger-menu"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="hamburger-close-btn"
          aria-label="閉じる"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );  
};

export default HamburgerMenu;