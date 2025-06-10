// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './LoginPage.scss';

const LoginPage: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [familyName, setFamilyName] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

    const normalize = (str: string) =>
        str
            .trim()
            .replace(/\s/g, '')
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
            .toLowerCase();

    const handleLogin = () => {
        const allowedUsersRaw = import.meta.env.VITE_ALLOWED_USERS || '';
        const allowedUsers = allowedUsersRaw
            .split(';')
            .map(entry => {
                const [last, first] = entry.split(',').map(part => normalize(part));
                return { first, last };
            });

        const inputFirst = normalize(firstName);
        const inputLast = normalize(familyName);

        const isValid = allowedUsers.some(user =>
            (user.first === inputFirst && user.last === inputLast) ||
            (user.first === inputLast && user.last === inputFirst)
        );

        if (isValid) {
            localStorage.setItem('user', `${inputLast}${inputFirst}`);
            localStorage.setItem('loginTimestamp', Date.now().toString());
            // localStorageのフラグは使わず、navigateでstateに渡す
            navigate('/', { replace: true, state: { showLoadingScreen: true } });
        } else {
            alert(t("loginError"));
        }
    }


    return (
        <div className="login-container">
            <h2>{t("login")}</h2>
            <input
                type="text"
                placeholder={t("familyName")}
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
            />
            <input
                type="text"
                placeholder={t("firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <button onClick={handleLogin}>{t("login")}</button>
        </div>
    );
};

export default LoginPage;