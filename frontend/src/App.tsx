// frontend/src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import LoginPage from './pages/LoginPage';
import RouteInputPage from './pages/RouteInputPage';
import RouteResultPage from './pages/RouteResultPage';
import SavedRoutesPage from './pages/SavedRoutesPage';

import HamburgerMenu from './components/HamburgerMenu';
import Header from './components/Header';
import Loading from './components/Loading';
import Footer from './components/Footer';

import BatonPrivacyPage from './components/rules/baton-privacy';
import Contact from './components/rules/contact';
import Disclaimer from './components/rules/disclaimer';
import PrivacyPolicy from './components/rules/privacy-policy';
import Writers from './components/rules/writers';
import TermsOfService from './components/rules/terms_of_service';

import './styles/global.scss';
import './i18n';

import type { SavedRoute } from './types/route';
import { getSavedRoutes } from './api/cacheApi';

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30分でログアウト

const App: React.FC = () => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  const closeDrawer = () => setDrawerOpen(false);

  // 自動ログアウトチェック
  useEffect(() => {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    if (loginTimestamp) {
      const elapsed = Date.now() - Number(loginTimestamp);
      if (elapsed > AUTO_LOGOUT_TIME) {
        localStorage.removeItem('user');
        localStorage.removeItem('loginTimestamp');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // スクロールでヘッダー表示切り替え
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

  // ロケーションのstateでローディング判定
  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn && location.state?.showLoadingScreen) {
      setShowLoadingScreen(true);
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
        // ロケーションstateは変更できないので、ナビゲート時に消すのがベスト
        // 代わりにhistory.replaceStateでstateだけリセット
        window.history.replaceState({}, document.title);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingScreen(false);
    }
  }, [location]);

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

  const isLoggedIn = !!localStorage.getItem('user');
  if (!isLoggedIn) {
    return null; 
  }
  
  if (loading || showLoadingScreen) {
    return <Loading />;
  }

  return (
    <HelmetProvider>
      {localStorage.getItem('user') && (
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
        </>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RouteInputPage />} />
        <Route path="/result" element={<RouteResultPage />} />
        <Route path="/rules/terms_of_service" element={<TermsOfService />} />
        <Route path="/rules/baton-privacy" element={<BatonPrivacyPage />} />
        <Route path="/rules/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/rules/disclaimer" element={<Disclaimer />} />
        <Route path="/rules/writers" element={<Writers />} />
        <Route path="/rules/contact" element={<Contact />} />
        <Route
          path="/saved"
          element={
            <SavedRoutesPage
              savedRoutes={savedRoutes}
              refreshSavedRoutes={refreshSavedRoutes}
              onClose={() => navigate('/')}
            />
          }
        />
      </Routes>
      <Footer />
    </HelmetProvider>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;