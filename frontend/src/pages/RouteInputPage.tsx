// src/pages/RouteInputPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimePicker } from 'react-ios-time-picker';
import { searchRoute } from '../api/routeApi';
import type { RouteRequest, RouteResult } from '../types/route';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import './RouteInputPage.scss';
import SearchingOverlay from '../components/SearchingOverlay';

const RouteInputPage: React.FC = () => {
  const navigate = useNavigate();

  const [points, setPoints] = useState<string[]>(['', '']);
  const [departureTime, setDepartureTime] = useState('12:00');
  const [stayTimes, setStayTimes] = useState<string[]>(['']);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const isPC = window.innerWidth > 768;
    if (isPC) {
      setPoints(['川崎駅', '品川駅']);
    }
  }, []);

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    // 経由地部分だけ並び替え (pointsの1〜length-2)
    const newPoints = [...points];
    const newStayTimes = [...stayTimes];

    const waypoints = newPoints.slice(1, newPoints.length - 1);
    const stays = [...newStayTimes];

    // 並び替え
    const [removedWaypoint] = waypoints.splice(startIndex, 1);
    waypoints.splice(endIndex, 0, removedWaypoint);

    const [removedStay] = stays.splice(startIndex, 1);
    stays.splice(endIndex, 0, removedStay);

    // 更新
    newPoints.splice(1, waypoints.length, ...waypoints);
    setPoints(newPoints);

    setStayTimes(stays);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedPoints = points.map(p => p.trim());
    const filteredPoints = trimmedPoints.filter(p => p !== '');

    if (filteredPoints.length < 2) {
      setError(t('error_input_origin_destination'));
      return;
    }

    const origin = filteredPoints[0];
    const destination = filteredPoints[filteredPoints.length - 1];
    const waypoints = filteredPoints.slice(1, -1);

    // stayTimesのインデックスに対応する形で抽出
    const originalWaypointIndices = points
      .map((p, i) => (i !== 0 && i !== points.length - 1 && p.trim() !== '' ? i : -1))
      .filter(i => i !== -1);

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

    setIsSearching(true);

    try {
      const result: RouteResult = await searchRoute(reqData);

      setTimeout(() => {
        navigate('/result', {
          state: {
            routeQuery: reqData,
            routeResult: result,
          },
        });
      }, 100); 
    } catch (error) {
      console.error(error);
      setError(t('error_route_search'));
      setIsSearching(false);
    }
  };

  return (
    <>
      {isSearching && <SearchingOverlay />}
      <div className="route-input">
        <h1 className="route-input__title">{t('route_input')}</h1>

        {/* 出発地 */}
        <div className="route-input__block">
          <label className="route-input__label">{t('departure')}</label>
          <div className="route-input__row">
            <input
              type="text"
              value={points[0]}
              onChange={(e) => handlePointChange(0, e.target.value)}
              placeholder={t('departure')}
              className="route-input__input"
            />
          </div>
        </div>

        {/* 経由地 ドラッグ＆ドロップ対応 */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="waypoints">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {points.slice(1, points.length - 1).map((point, index) => (
                  <Draggable key={index} draggableId={`waypoint-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        className={`route-input__block ${snapshot.isDragging ? 'dragging' : ''
                          }`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <label className="route-input__label">{t('waypoint', { index: index + 1 })}</label>
                        <div className="route-input__row">
                          {/* ドラッグハンドル */}
                          <div
                            {...provided.dragHandleProps}
                            className="drag-handle"
                            aria-label={t('drag_handle')}
                            title={t('drag_handle')}
                          >
                            ☰
                          </div>

                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handlePointChange(index + 1, e.target.value)}
                            placeholder={t('waypoint', { index: index + 1 })}
                            className="route-input__input"
                          />

                          <div className="duration-div">
                            <input
                              type="number"
                              min="0"
                              value={stayTimes[index] || ''}
                              onChange={(e) => handleStayTimeChange(index, e.target.value)}
                              placeholder={t('stay_minutes') + t('minutes')}
                              className="route-input__stay-time"
                            />
                          </div>

                          <button
                            onClick={() => removeWaypoint(index + 1)}
                            className="route-input__remove-btn"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* 目的地 */}
        <div className="route-input__block">
          <label className="route-input__label">{t('destination')}</label>
          <div className="route-input__row">
            <input
              type="text"
              value={points[points.length - 1]}
              onChange={(e) => handlePointChange(points.length - 1, e.target.value)}
              placeholder={t('destination')}
              className="route-input__input"
            />
          </div>
        </div>

        <button onClick={addWaypoint} className="route-input__add-btn">
          {t('add_waypoint')}
        </button>

        <div className="route-input__time">
          <label className="route-input__label">{t('departure_time')}</label>
          <TimePicker
            onChange={setDepartureTime}
            value={departureTime}
            className="route-input__timepicker"
          />
        </div>

        {error && <div className="route-input__error">{error}</div>}

        <button onClick={handleSubmit} className="route-input__submit">
          {t('search')}
        </button>
      </div>
    </>
  );
};

export default RouteInputPage;
