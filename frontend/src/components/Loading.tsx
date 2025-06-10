// src/components/Loading.tsx
import React from 'react';
import './Loading.scss';
import { useTranslation } from 'react-i18next';

const Loading: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="loading-overlay">
      <header className="loading-header">
        <h1 className="main-title">DROP-MAP</h1>
        <h2 className="sub-title">Traveling Salesman Problem</h2>
      </header>

      <div className="loading-character">
        <div className="face">
          <div className="eyes">
            <div className="eye left"></div>
            <div className="eye right"></div>
          </div>
          <div className="mouth">
            <div className="teeth upper">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`tooth tooth-${i + 1}`}></div>
              ))}
            </div>
            <div className="teeth lower">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`tooth tooth-${i + 1}`}></div>
              ))}
            </div>
          </div>
        </div>
        <div className="loading-text">
            More steps means more smiles… right?"
        </div>
        <div className="sub-loading-text">Now Loading</div>
      </div>
    </div>
  );
};

export default Loading;