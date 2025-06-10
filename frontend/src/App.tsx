// frontend/src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import RouteInputPage from './pages/RouteInputPage';
import RouteResultPage from './pages/RouteResultPage';
import SavedRoutesPage from './pages/SavedRoutesPage';
import HamburgerMenu from './components/HamburgerMenu';
import Header from './components/Header';

import './styles/global.scss';
import './i18n';

import type { SavedRoute } from './types/route';
import { getSavedRoutes } from './api/cacheApi';

const App: React.FC = () => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      if (currentScrollY < viewportHeight) {
        setShowHeader(true);
      } else {
        setShowHeader(currentScrollY < lastScrollY.current);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshSavedRoutes = async () => {
    setLoading(true);
    try {
      const routes = await getSavedRoutes();
      setSavedRoutes(routes);
    } catch (error) {
      console.error('Failed to fetch saved routes:', error);
      setSavedRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  // 言語対応モード
  const { i18n } = useTranslation();

  const changeLanguage = (lang: 'ja' | 'en' | 'es') => {
    i18n.changeLanguage(lang);
  };

  // 初回ロード時に savedRoutes を読み込む
  useEffect(() => {
    refreshSavedRoutes();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  return (
    <>
      <Header
        showHeader={showHeader}
        onOpenMenu={() => setIsMenuOpen(true)}
        currentLang={i18n.language as 'ja' | 'en' | 'es'}
        changeLanguage={changeLanguage}
      />

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <SavedRoutesPage
          savedRoutes={savedRoutes}
          refreshSavedRoutes={refreshSavedRoutes}
          onClose={closeDrawer}
        />
      </HamburgerMenu>

      <Routes>
        <Route path="/" element={<RouteInputPage />} />
        <Route path="/result" element={<RouteResultPage />} />
        <Route
          path="/saved"
          element={
            <SavedRoutesPage
              savedRoutes={savedRoutes}
              refreshSavedRoutes={refreshSavedRoutes}
              onClose={() => navigate("/")}
            />
          }
        />
      </Routes>
    </>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
