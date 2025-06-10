// src/components/SearchingOverlay.tsx
import React from 'react';
import './SearchingOverlay.scss';

const SearchingOverlay: React.FC = () => {
  return (
    <div className="searching-overlay">
      <div className="searching-spinner" />
      <div className="searching-text">Searching for the best route...</div>
    </div>
  );
};

export default SearchingOverlay;
