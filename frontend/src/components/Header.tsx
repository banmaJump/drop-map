// frontend/src/components/Header.tsx
import React from 'react';

type HeaderProps = {
  currentLang: 'en' | 'ja' |'es';
  changeLanguage: (lang: 'en' | 'ja' | 'es') => void;
  onOpenMenu: () => void;
  showHeader: boolean;
};

const Header: React.FC<HeaderProps> = ({ currentLang, changeLanguage, onOpenMenu, showHeader }) => {
  return (
    <header
      className="app-header"
      style={{
        transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <button
        aria-label="メニューを開く"
        onClick={onOpenMenu}
        className="hamburger-button"
      >
        ☰
      </button>

      <div className="transBtns">
        <button
          onClick={() => changeLanguage('ja')}
          className={`langTitle ${currentLang === 'ja' ? 'active' : ''}`}
          aria-pressed={currentLang === 'ja'}
        >
          JP
        </button>
        <button
          onClick={() => changeLanguage('es')}
          className={`langTitle ${currentLang === 'es' ? 'active' : ''}`}
          aria-pressed={currentLang === 'es'}
        >
          ES
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`langTitle ${currentLang === 'en' ? 'active' : ''}`}
          aria-pressed={currentLang === 'en'}
        >
          EN
        </button>
      </div>
    </header>
  );
};

export default Header;
