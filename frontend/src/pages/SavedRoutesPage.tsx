// frontend/src/pages/SavedRoutesPage.tsx
import React from 'react';
import RouteDetail from '../components/RouteDetail';
import type { SavedRoute } from '../types/route';
import { convertToDisplayData } from '../utils/storage';
import { deleteSavedRoute } from '../utils/storage';
import { useTranslation } from 'react-i18next';

import './SavedRoutesPage.scss';

interface Props {
  savedRoutes: SavedRoute[];
  refreshSavedRoutes: () => Promise<void>;
  onClose?: () => void; // 残してOK（呼び出し元で使うため）
}

const SavedRoutesPage: React.FC<Props> = ({ savedRoutes, refreshSavedRoutes }) => {
  const { t } = useTranslation();

  if (!savedRoutes) return <div>{t('loading')}</div>;
  if (savedRoutes.length === 0) return <div className="text-center mt-10">{t('no_saved_routes')}</div>;

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedRoute(id);
      await refreshSavedRoutes();
    } catch (error) {
      console.error(t('delete_failed'), error);
    }
  };

  return (
    <div className="saved-routes-container">
      {savedRoutes.map((saved) => {
        const displayRoute = convertToDisplayData(saved);
        const badge =
          displayRoute.routeName?.includes('最安') ? '最安' :
            displayRoute.routeName?.includes('最適') ? '最適' :
              '';

        return (
          <div key={saved.id} className="saved-route-card">
            <div className="header">
              <h2 className="route-name" title={displayRoute.routeName}>
                {displayRoute.routeName}
              </h2>
              {badge && (
                <span className={`badge ${badge === '最安' ? 'badge-cheapest' : 'badge-optimal'}`}>
                  {badge === '最安' ? t('cheapest') : t('optimal')}
                </span>
              )}
              <button className="delete-button" aria-label={t('delete')} onClick={() => handleDelete(saved.id)}>
                ✕
              </button>
            </div>

            <RouteDetail route={displayRoute} />
          </div>
        );
      })}

      <div className="button-wrap">
        <button onClick={refreshSavedRoutes} className="reload-button">
          {t('reload_routes')}
        </button>

      </div>
    </div>
  );
};

export default SavedRoutesPage;
