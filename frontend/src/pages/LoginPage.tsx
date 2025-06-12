import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import './LoginPage.scss';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000';

const LoginPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const normalize = (str: string) =>
    str
      .trim()
      .replace(/\s/g, '')
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .toLowerCase();

  // async修飾子を追加
  const handleLogin = async () => {
    const allowedUsersRaw = import.meta.env.VITE_ALLOWED_USERS || '';
    const allowedUsers = allowedUsersRaw
      .split(';')
      .map((entry) => {
        const [last, first] = entry.split(',').map((part) => normalize(part));
        return { first, last };
      });

    const inputFirst = normalize(firstName);
    const inputLast = normalize(familyName);

    const isValid = allowedUsers.some(
      (user) =>
        (user.first === inputFirst && user.last === inputLast) ||
        (user.first === inputLast && user.last === inputFirst)
    );

    if (isValid) {
      try {
        // バックエンドのウォームアップ呼び出し
        await axios.get(`${BACKEND_BASE_URL}/warmup`);
      } catch (e) {
        console.warn('バックエンドウォームアップ失敗:', e);
      }

      localStorage.setItem('user', `${inputLast}${inputFirst}`);
      localStorage.setItem('loginTimestamp', Date.now().toString());
      navigate('/', { replace: true, state: { showLoadingScreen: true } });
    } else {
      alert(t('loginError'));
    }
  };

  return (
    <div className="login-container">
      <h2>{t('login')}</h2>
      <input
        type="text"
        placeholder={t('familyName')}
        value={familyName}
        onChange={(e) => setFamilyName(e.target.value)}
      />
      <input
        type="text"
        placeholder={t('firstName')}
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <button onClick={handleLogin}>{t('login')}</button>
    </div>
  );
};

export default LoginPage;