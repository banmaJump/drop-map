import React from 'react';
import type { RouteDataForDetail, RouteSegment } from '../types/route';
import { useTranslation } from 'react-i18next';
import './RouteDetail.scss';

type RouteDetailProps = {
  route: RouteDataForDetail;
};

const modeLabelMap: Record<string, string> = {
  WALKING: 'walk',
  TRANSIT: 'transit',
  TRAIN: 'train',
  SUBWAY: 'subway',
  BUS: 'bus',
  RAIL: 'rail',
  TRAM: 'tram',
  FERRY: 'ferry',
  UNKNOWN: 'unknown',
};


const RouteDetail: React.FC<RouteDetailProps & { className?: string }> = ({ route, className }) => {
  // console.log('RouteDetailレンダリング:', route);
  const segments = route?.segments ?? [];
  const { t } = useTranslation();

  if (!segments.length) {
    return (
      <div className="bg-white p-4 rounded shadow-sm text-red-500">
        ルート情報が見つかりません。
      </div>
    );
  }

  return (
    <div className="route-detail-container">
      <h2 className="route-detail-title">{t('cheapest_plan')}</h2>

      {/* 地図（仮） */}
      <div className="map-placeholder">{t('map_placeholder')}</div>

      {/* 区間ごとの表示 */}
      <div className="segments-list">
        {segments.map((seg: RouteSegment, index) => {
          const isLast = index === segments.length - 1;

          const rawMode = seg.mode?.toUpperCase() ?? 'UNKNOWN';
          const modeKey = modeLabelMap[rawMode] ?? 'unknown';
          const modeLabel = t(modeKey);
          const mode = seg.mode?.toLowerCase() ?? 'unknown';
          const icon = mode === 'walking' ? '🚶' : mode === 'transit' ? '🚆' : '➡️';

          

          const stayDuration =
            seg.stayDuration !== undefined ? `${Math.ceil(seg.stayDuration / 60)}${t('minutes')}` : `--${t('minutes')}`;
          const departureTime = seg.step_info?.departureTime ?? seg.departureTime ?? '-';
          const arrivalTime = seg.step_info?.arrivalTime ?? seg.arrivalTime ?? '-';
          // const stayDuration = seg.step_info?.stayDuration ?? '-';

          function parseTimeToMinutes(timeStr: string): number | null {
            if (!timeStr || timeStr === '-') return null;
            const [h, m] = timeStr.split(':').map(Number);
            if (isNaN(h) || isNaN(m)) return null;
            return h * 60 + m;
          }
          
          const depMin = parseTimeToMinutes(departureTime);
          const arrMin = parseTimeToMinutes(arrivalTime);
          
          const durationMin =
            depMin !== null && arrMin !== null && arrMin >= depMin
              ? `${arrMin - depMin}${t('minutes')}`
              : `--${t('minutes')}`;
          return (
            <React.Fragment key={seg.id ?? index}>
              <div className="segment-item">
                {/* 出発時刻（左） */}
                <div className="departure-time">{departureTime}</div>
                <div className='segments-right'>
                  {/* 出発地点 */}
                  <div className="segment-from">{seg.from ?? t('unknown')}</div>
                  {/* 移動手段・内容 */}
                  <div className="segment-info">
                    <span className="segment-icon">{icon}</span>
                    <span className="segment-text">
                      {modeLabel} {durationMin}
                    </span>
                    {seg.totalPrice && seg.totalPrice > 0 && (
                      <span className="segment-price">¥{seg.totalPrice}</span>
                    )}
                  </div>
                  {/* 到着地点 */}
                  <div className="segment-to">{seg.to ?? t('unknown')}</div>
                </div>
                <div className="arrival-time">{arrivalTime}</div>
              </div>
              {/* 滞在時間 */}
              {!isLast && typeof seg.stayDuration === 'number' && seg.stayDuration >= 0 && (
                <div className="segment-stay">
                  {t('stay_minutes')} {stayDuration}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 合計情報 */}
      <div className="route-summary">
        <span>{t('fare')}: {route.totalPrice ?? '--'}</span>
        <span>{t('route_duration')}: {route.totalTime ?? '--'}</span>
      </div>
    </div>
  );

};

export default RouteDetail;