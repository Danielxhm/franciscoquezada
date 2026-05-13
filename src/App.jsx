import React, { useState, useCallback, useEffect } from 'react';
import { Home, Video as VideoIcon, MessageSquare, Settings, Phone, LogOut } from 'lucide-react';
import Login from './Login.jsx';
import HomeScreen from './Home.jsx';
import IdentityVerification from './IdentityVerification.jsx';
import VideoChat from './VideoChat.jsx';
import './App.css';

function ConnectingOverlay({ onConnected }) {
  const [phase, setPhase] = useState(0);
  const phases = [
    { text: 'Inicializando camara y microfono...', sub: 'Verificando permisos del dispositivo' },
    { text: 'Conectando al servidor...', sub: 'Estableciendo canal seguro' },
    { text: 'Estableciendo conexion con el entrevistador...', sub: 'Negociando parametros de media' },
    { text: 'Conectado', sub: 'Entrando a la sala de entrevista' },
  ];

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 1600),
      setTimeout(() => setPhase(2), 3200),
      setTimeout(() => setPhase(3), 4800),
      setTimeout(() => onConnected(), 5800),
    ];
    return () => t.forEach(clearTimeout);
  }, [onConnected]);

  const cur = phases[phase];
  const done = phase === 3;

  return (
    <div className={`connecting-overlay ${done ? 'fade-out' : ''}`}>
      <div className="connecting-rings">
        <div className="ring ring-1"/><div className="ring ring-2"/><div className="ring ring-3"/>
      </div>
      <div className="connecting-content">
        <div className={`connecting-avatar ${done ? 'connected' : ''}`}>
          {done ? <Phone size={32}/> : <VideoIcon size={32}/>}
          {!done && <div className="connecting-spinner"/>}
        </div>
        <h2 className="connecting-title" key={phase}>{cur.text}</h2>
        <p className="connecting-sub" key={`s${phase}`}>{cur.sub}</p>
        <div className="connecting-dots">
          {phases.map((_,i) => (
            <div key={i} className={`cdot ${i<=phase?'active':''} ${i===phase?'current':''}`}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('login');
  const [showLogout, setShowLogout] = useState(false);

  const handleLogin = useCallback(() => setView('home'), []);
  const handleJoin = useCallback(() => setView('verify'), []);
  const handleVerified = useCallback(() => setView('connecting'), []);
  const handleConnected = useCallback(() => setView('call'), []);
  const handleLogout = useCallback(() => {
    setShowLogout(false);
    setView('login');
  }, []);

  if (view === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      {view === 'verify' && (
        <IdentityVerification
          onVerified={handleVerified}
        />
      )}

      {view === 'connecting' && <ConnectingOverlay onConnected={handleConnected} />}

      {view === 'home' && (
        <div className="sidebar">
          <div className="logo-container">
            <img src="/log.png" alt="Logo" className="sidebar-logo" />
          </div>
          <button className="nav-item active" id="nav-home"><Home size={22} /></button>
          <button className="nav-item" id="nav-video"><VideoIcon size={22} /></button>
          <button className="nav-item" id="nav-chat"><MessageSquare size={22} /></button>
          <div className="nav-spacer" />
          <button className="nav-item" id="nav-settings"><Settings size={22} /></button>
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" onClick={() => setShowLogout(!showLogout)}>
              <img src="/profiles/interviewer.png" alt="Profile" className="sidebar-avatar-img" />
            </div>
            {showLogout && (
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={14} />
                <span>Salir</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="main-content">
        {view === 'home' && <HomeScreen onJoin={handleJoin} />}
        {view === 'call' && <VideoChat />}
      </div>
    </div>
  );
}

export default App;