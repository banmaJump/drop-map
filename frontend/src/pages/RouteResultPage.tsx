// frontend/src/pages/RouteResultPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchRoute } from '../api/routeApi';
import RouteDetail from '../components/RouteDetail';
import { saveRoute, getSavedRoutes } from '../utils/storage';
import { useTranslation } from 'react-i18next';

import './RouteResultPage.scss';

import type {
  RouteResult,
  RouteDataWithTime,
  RouteDataForDetail,
  RouteSegment,
  SavedRoute,
} from '../types/route';

const RouteResultPage: React.FC = () => {
  const location = useLocation();
  const routeQuery = location.state?.routeQuery;

  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'最安' | '最適'>('最安');
  const [savedMessage, setSavedMessage] = useState('');
  const { t } = useTranslation();


  // 出発時刻を基準に時刻を再計算する関数
  const recalcTimes = (data: RouteResult, baseTime: string): RouteResult => {
    const [baseH, baseM] = baseTime.split(':').map(Number);
    let currentTime = new Date(1970, 0, 1, baseH, baseM, 0);

    const formatTime = (date: Date) =>
      `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const recalcRoute = (route: RouteDataWithTime): RouteDataWithTime => {
      const newSegments = route.segments.map((seg, i) => {
        const departureTimeStr =
          seg.departureTime && seg.departureTime !== ''
            ? seg.departureTime
            : formatTime(currentTime);

        const moveMs = (seg.moveDuration ?? 0) * 1000;
        const stayMs = (seg.stayDuration ?? 0) * 1000;

        let arrivalTimeDate: Date;
        if (seg.arrivalTime && seg.arrivalTime !== '') {
          const [h, m] = seg.arrivalTime.split(':').map(Number);
          arrivalTimeDate = new Date(Date.UTC(1970, 0, 1, h, m, 0));
        } else {
          arrivalTimeDate = new Date(currentTime.getTime() + moveMs);
        }
        const arrivalTimeStr = formatTime(arrivalTimeDate);

        currentTime = new Date(arrivalTimeDate.getTime() + stayMs);

        return {
          ...seg,
          id: seg.id ?? i + 1,
          departureTime: departureTimeStr,
          arrivalTime: arrivalTimeStr,
          step_info: {
            ...seg.step_info,
            departureTime: departureTimeStr,
            arrivalTime: arrivalTimeStr,
          },
        };
      });

      return {
        ...route,
        segments: newSegments,
        routeName: route.routeName ?? `${route.from} → ${route.to}`,
      };
    };

    return {
      ...data,
      optimal: recalcRoute(data.optimal),
      cheapest: recalcRoute(data.cheapest),
    };
  };

  // localStorageから過去のルートデータを読み込む
  useEffect(() => {
    const savedRouteData = localStorage.getItem('latestRouteData');
    if (savedRouteData) {
      try {
        const parsed = JSON.parse(savedRouteData);
        setRouteData(parsed);
      } catch (e) {
        console.error('localStorageのデータ読み込み失敗', e);
      }
    }
  }, []);

  // ルート検索API呼び出し
  useEffect(() => {
    if (!routeQuery) {
      setError('検索条件がありません');
      return;
    }
    setLoading(true);
    searchRoute(routeQuery)
      .then((data: RouteResult) => {
        if (data && routeQuery.departure_time) {
          const recalculatedData = recalcTimes(data, routeQuery.departure_time);
          setRouteData(recalculatedData);
          localStorage.setItem('latestRouteData', JSON.stringify(recalculatedData));
        } else {
          setRouteData(data);
          localStorage.setItem('latestRouteData', JSON.stringify(data));
        }
        setLoading(false);
      })
      .catch((e) => {
        setError('APIエラー');
        setLoading(false);
        console.error(e);
      });
  }, [routeQuery]);

  const getSelectedRoute = (): RouteDataWithTime => {
    if (!routeData) throw new Error('routeData is null');
    return selectedTab === '最安' ? routeData.cheapest : routeData.optimal;
  };

  // 保存ボタン押下時
  const handleSave = () => {
    const selectedRoute = getSelectedRoute();

    const detailsWithId: RouteSegment[] = selectedRoute.segments.map((seg, i) => ({
      ...seg,
      id: seg.id ?? i + 1,
    }));

    const priceNum =
      typeof selectedRoute.price === 'number'
        ? selectedRoute.price
        : typeof selectedRoute.totalPrice === 'number'
          ? selectedRoute.totalPrice
          : 0;

    const timeNum =
      typeof selectedRoute.totalTime === 'number'
        ? Math.ceil(selectedRoute.totalTime / 60)
        : 0;

    // 👇 重複チェック（routeNameベース）
    const existingRoutes = getSavedRoutes(); // localStorage から全ルート取得
    const alreadySaved = existingRoutes.some(
      (r) => r.routeName === selectedRoute.routeName
    );

    if (alreadySaved) {
      setSavedMessage(`${selectedRoute.routeName} はすでに保存済みです`);
      setTimeout(() => setSavedMessage(''), 3000);
      return; // 保存処理中断
    }

    const saveData: SavedRoute = {
      id: crypto.randomUUID(),
      routeName: selectedRoute.routeName ?? '不明なルート名',
      time: timeNum,
      price: priceNum,
      details: detailsWithId,
      timestamp: Date.now(),
    };

    console.log('Page3へ保存するデータ:', saveData);

    saveRoute(saveData);
    setSavedMessage(`${selectedRoute.routeName} を保存しました`);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  // RouteDetailに渡すための整形関数
  const renderRouteDetail = (route: RouteDataWithTime) => {
    const segments: RouteSegment[] = route.segments.map((d, i) => ({
      id: d.id ?? i + 1,
      mode: d.mode,
      from: d.from,
      to: d.to,
      departureTime: d.departureTime ?? '',
      arrivalTime: d.arrivalTime ?? '',
      stayDuration: d.stayDuration ?? 0,
      instruction: d.instruction,
      totalPrice: d.totalPrice,
      step_info: d.step_info,
    }));

    const routeDataForDetail: RouteDataForDetail = {
      routeName: route.routeName || '不明なルート名',
      totalTime:
        typeof route.totalTime === 'number'
          ? `${Math.ceil(route.totalTime / 60)}分`
          : route.totalTime || '不明',
      totalPrice:
        typeof route.price === 'number'
          ? `${route.price}円`
          : typeof route.totalPrice === 'string'
            ? route.totalPrice
            : '0円',
      segments,
    };

    return <RouteDetail route={routeDataForDetail} />;
  };

  if (loading) return <div>{t("loading")}</div>;
  if (error) return <div className="text-red-600">{t("no_search")}</div>;
  if (!routeData) return null;

  return (
    <div className="route-result-page">
      <h1 className="route-result-title">{t("route_result")}</h1>

      {/* タブ切り替え */}
      <div className="route-tabs">
        <button
          onClick={() => setSelectedTab('最安')}
          className={`route-tab-button ${selectedTab === '最安' ? 'active' : ''}`}
        >
          🚶 {t("cheapest")}
        </button>
        <div className="route-tab-divider">⇄</div>
        <button
          onClick={() => setSelectedTab('最適')}
          className={`route-tab-button ${selectedTab === '最適' ? 'active' : ''}`}
        >
          🚆 {t("optimal")}
        </button>
      </div>

      {/* ルート詳細表示 */}
      {renderRouteDetail(getSelectedRoute())}

      {/* 保存ボタンとメッセージ */}
      <div className="route-save-area">
        <button onClick={handleSave} className="save-button">
          {t("saved_this_route")}
        </button>
        {savedMessage && <p className="save-message">{savedMessage}</p>}
      </div>
    </div>
  );

};

export default RouteResultPage;
