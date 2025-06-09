// src/pages/RouteInputPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimePicker } from 'react-ios-time-picker'; //{TimePicker}必要かも
import { searchRoute } from '../api/routeApi';
import type { RouteRequest, RouteData, RouteResult } from '../types/route';
import { useTranslation } from 'react-i18next';

import './RouteInputPage.scss';

const RouteInputPage: React.FC = () => {
  const navigate = useNavigate();

  const [points, setPoints] = useState<string[]>(['', '']);
  const [departureTime, setDepartureTime] = useState('12:00');
  const [stayTimes, setStayTimes] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const { t } = useTranslation();


  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  const handleStayTimeChange = (index: number, value: string) => {
    const newStayTimes = [...stayTimes];
    newStayTimes[index] = value;
    setStayTimes(newStayTimes);
  };

  const addWaypoint = () => {
    const newPoints = [...points];
    newPoints.splice(points.length - 1, 0, '');
    setPoints(newPoints);

    const newStayTimes = [...stayTimes];
    newStayTimes.push('');
    setStayTimes(newStayTimes);
  };

  const removeWaypoint = (index: number) => {
    const newPoints = [...points];
    newPoints.splice(index, 1);
    setPoints(newPoints);

    const newStayTimes = [...stayTimes];
    newStayTimes.splice(index - 1, 1);
    setStayTimes(newStayTimes);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedPoints = points.map(p => p.trim());
    const filteredPoints = trimmedPoints.filter(p => p !== '');

    if (filteredPoints.length < 2) {
      setError('出発地と目的地を入力してください');
      return;
    }

    const origin = filteredPoints[0];
    const destination = filteredPoints[filteredPoints.length - 1];
    const waypoints = filteredPoints.slice(1, -1);

    // 元のpointsにおけるwaypointのindexを取得
    // 元のpointsにおけるwaypointのindexを取得
    const originalWaypointIndices = points
      .map((p, i) => (i !== 0 && i !== points.length - 1 && p.trim() !== '' ? i : -1))
      .filter(i => i !== -1);

    // stayTimesのインデックスに対応する形で抽出
    const stayList = originalWaypointIndices.map((_, idx) => parseInt(stayTimes[idx] || '0', 10));


    const today = new Date();
    const [h, m] = departureTime.split(':').map(Number);
    today.setHours(h, m, 0, 0);
    const departureISO = today.toISOString();

    const reqData: RouteRequest = {
      from: origin,
      to: destination,
      waypoints,
      departureTime: departureISO,
      stayTimes: stayList,
    };

    const result: RouteResult = await searchRoute(reqData);
    console.log('reqData sent to API:', reqData);

    navigate('/result', { state: { routeQuery: reqData, routeResult: result } });
  };

  return (
    <div className="route-input">
      <h1 className="route-input__title">{t('route_input')}</h1>

      {points.map((point, index) => (
        <div key={index} className="route-input__block">
          <label className="route-input__label">
            {index === 0
              ? t('departure')
              : index === points.length - 1
                ? t('destination')
                : t('waypoint', { index })}
          </label>

          <div className="route-input__row">
            <input
              type="text"
              value={point}
              onChange={(e) => handlePointChange(index, e.target.value)}
              placeholder={
                index === 0
                  ? t('departure')
                  : index === points.length - 1
                    ? t('destination')
                    : t('waypoint', { index })
              }
              className="route-input__input"
            />

            {index !== 0 && index !== points.length - 1 && (
              <>
                <div className='duration-div'>
                  <input
                    type="number"
                    min="0"
                    value={stayTimes[index - 1] || ''}
                    onChange={(e) => handleStayTimeChange(index - 1, e.target.value)}
                    placeholder={t('stay_minutes')}
                    className="route-input__stay-time"
                  />
                  <span className="route-input__unit">{t('minutes')}</span>
                </div>
                <button
                  onClick={() => removeWaypoint(index)}
                  className="route-input__remove-btn"
                >
                  {t('delete')}
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      <button onClick={addWaypoint} className="route-input__add-btn">
        {t('add_waypoint')}
      </button>

      <div className="route-input__time">
        <label className="route-input__label">{t('departure_time')}</label>
        <TimePicker onChange={setDepartureTime} value={departureTime} className="route-input__timepicker" />
      </div>

      {error && <div className="route-input__error">{t('error')}</div>}

      <button onClick={handleSubmit} className="route-input__submit">
        {t('search')}
      </button>
    </div>
  );
};

export default RouteInputPage;