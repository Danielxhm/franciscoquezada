import React, { useMemo } from 'react';
import { Calendar, Clock, Hash, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos Dias';
  if (h < 19) return 'Buenas Tardes';
  return 'Buenas Noches';
}

function MiniCalendar() {
  const year = 2026, month = 7;
  const today = 17;
  const eventDay = 23;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`b${i}`} className="cal-cell empty" />);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    let cls = 'cal-cell';
    if (d === today) cls += ' today';
    if (d === eventDay) cls += ' event';
    return <div key={d} className={cls}>{d}</div>;
  });

  const totalCells = blanks.length + days.length;
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailing = Array.from({ length: trailingCount }, (_, i) => (
    <div key={`t${i}`} className="cal-cell empty next-month">{i + 1}</div>
  ));

  return (
    <div className="calendar-widget">
      <div className="cal-header">
        <h3>Calendario</h3>
      </div>
      <div className="cal-nav">
        <button className="cal-nav-btn"><ChevronLeft size={16} /></button>
        <span className="cal-month">Agosto 2026</span>
        <button className="cal-nav-btn"><ChevronRight size={16} /></button>
      </div>
      <div className="cal-weekdays">
        {['D','L','M','M','J','V','S'].map((d, i) => <div key={i} className="cal-weekday">{d}</div>)}
      </div>
      <div className="cal-grid">
        {blanks}
        {days}
        {trailing}
      </div>
    </div>
  );
}

export default function HomeScreen({ onJoin }) {
  const greeting = useMemo(getGreeting, []);

  return (
    <>
      <div className="home-center">
        <div className="home-hero">
          <h1 className="home-greeting">{greeting}, Tatiana Portillo</h1>
          <p className="home-description">
            Tu entrevista se encuentra ya agendada, puedes visualizarla en el panel
            derecho y verificar el dia y la hora, cuando sea el momento haz click
            en unirse a la entrevista para comenzar.
          </p>
          <button className="btn-join" onClick={onJoin} id="btn-join">
            <div className="btn-join-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span>Unirse a la Entrevista</span>
          </button>
        </div>
      </div>

      <div className="right-sidebar">
        <div className="sidebar-panel-container full-height-panel home-sidebar-panel">
          <MiniCalendar />
          <div className="event-divider" />
          <div className="event-details">
            <div className="event-top">
              <div className="event-icon-box">
                <Calendar size={18} />
              </div>
              <div>
                <span className="event-label">Programada</span>
                <span className="event-value">23 de Agosto, 2026</span>
              </div>
            </div>
            <h3 className="event-title">Entrevista Nuevo Ingreso</h3>
            <div className="event-row">
              <Clock size={14} className="event-row-icon" />
              <div>
                <span className="event-label">Horario</span>
                <span className="event-value">09:00 - 09:20</span>
              </div>
            </div>
            <div className="event-row">
              <Globe size={14} className="event-row-icon" />
              <div>
                <span className="event-label">Zona Horaria</span>
                <span className="event-value">(GMT -06:00)</span>
              </div>
            </div>
            <div className="event-row">
              <Hash size={14} className="event-row-icon" />
              <div>
                <span className="event-label">ID de Reunion</span>
                <span className="event-value">1200-909-321</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
