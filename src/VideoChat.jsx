import React, { useEffect, useRef, useState } from 'react';
import { User, Shield } from 'lucide-react';

const MicClosed = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
    <g fill="currentColor" fillRule="evenodd" strokeWidth="1.5" clipRule="evenodd">
      <path d="M2.47 2.47a.75.75 0 0 1 1.06 0l18 18a.75.75 0 1 1-1.06 1.06l-18-18a.75.75 0 0 1 0-1.06"/>
      <path d="M8.25 4.384a3.134 3.134 0 0 1 3.134-3.134H12A3.75 3.75 0 0 1 15.75 5v5.5a.75.75 0 0 1-1.23.576L9.378 6.791A3.13 3.13 0 0 1 8.25 4.384M14 14.75A5.75 5.75 0 0 1 8.25 9h1.5A4.25 4.25 0 0 0 14 13.25z"/>
      <path d="M5 9.25a.75.75 0 0 1 .75.75v1a6.25 6.25 0 1 0 12.5 0v-1a.75.75 0 0 1 1.5 0v1a7.75 7.75 0 0 1-15.5 0v-1A.75.75 0 0 1 5 9.25"/>
      <path d="M12 17.25a.75.75 0 0 1 .75.75v3.25H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25V18a.75.75 0 0 1 .75-.75"/>
    </g>
  </svg>
);

const MicOpen = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M16 6.429C16 4.535 14.21 3 12 3S8 4.535 8 6.429v5.142C8 13.465 9.79 15 12 15s4-1.535 4-3.429z"/>
      <path d="M5 11a7 7 0 1 0 14 0m-7 7v3m-4 0h8"/>
    </g>
  </svg>
);

const SendIcon = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m2 21l21-9L2 3v7l15 2l-15 2z"/>
  </svg>
);

function formatTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  const p = n => String(n).padStart(2,'0');
  return h > 0 ? `${p(h)}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
}

const MAIN_VIDEO_LOOP_START = 120;
const MAIN_VIDEO_LOOP_END = 146;

export default function VideoChat() {
  const localVideoRef = useRef(null);
  const mainVideoRef = useRef(null);
  const mainVideoLoopRef = useRef(false);
  const [recordState, setRecordState] = useState('idle');
  const recordStateRef = useRef('idle');
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [elapsed, setElapsed] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const timerRef = useRef(null);
  const waveBarsRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    let afId;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const an = ctx.createAnalyser(); an.fftSize = 64;
        const src = ctx.createMediaStreamSource(stream); src.connect(an);
        audioContextRef.current = ctx; analyserRef.current = an; sourceRef.current = src;
        const bl = an.frequencyBinCount, da = new Uint8Array(bl); dataArrayRef.current = da;
        const update = () => {
          if (recordStateRef.current === 'recording' && analyserRef.current) {
            analyserRef.current.getByteFrequencyData(da);
            const step = Math.floor(bl/8);
            for (let i=0;i<8;i++){let s=0;for(let j=0;j<step;j++)s+=da[i*step+j];
              if(waveBarsRef.current[i])waveBarsRef.current[i].style.height=`${4+(s/step/255)*32}px`;}
          } else { for(let i=0;i<8;i++) if(waveBarsRef.current[i]) waveBarsRef.current[i].style.height='3px'; }
          afId = requestAnimationFrame(update);
        };
        update();
      } catch(e){ console.error(e); }
    };
    start();
    if(mainVideoRef.current) {
      mainVideoRef.current.muted = false;
      mainVideoRef.current.volume = 1;
      mainVideoRef.current.play().catch(()=>{});
    }
    timerRef.current = setInterval(()=>setElapsed(p=>p+1),1000);
    const fadeTimer = setTimeout(()=>setVideoReady(true), 500);
    return () => {
      if(afId) cancelAnimationFrame(afId);
      if(localVideoRef.current?.srcObject) localVideoRef.current.srcObject.getTracks().forEach(t=>t.stop());
      if(audioContextRef.current) audioContextRef.current.close();
      if(timerRef.current) clearInterval(timerRef.current);
      clearTimeout(fadeTimer);
    };
  }, []);

  const toggle = ()=>{ const n = recordState==='idle'?'recording':'idle'; setRecordState(n); recordStateRef.current=n; };

  const restartMainVideoLoop = () => {
    const video = mainVideoRef.current;
    if (!video) return;
    video.currentTime = MAIN_VIDEO_LOOP_START;
    video.play().catch(()=>{});
  };

  const handleMainVideoLoaded = () => {
    const video = mainVideoRef.current;
    if (!video) return;
    mainVideoLoopRef.current = false;
    video.currentTime = 0;
  };

  const handleMainVideoEnded = () => {
    mainVideoLoopRef.current = true;
    restartMainVideoLoop();
  };

  const handleMainVideoTimeUpdate = () => {
    const video = mainVideoRef.current;
    if (!mainVideoLoopRef.current || !video) return;
    if (video.currentTime >= MAIN_VIDEO_LOOP_END) restartMainVideoLoop();
  };

  return (
    <>

      <div className="center-column">
        <div className="header">
          <div className="header-info">
            <h4>Viernes, 25 Agosto 2026</h4>
            <h1>Entrevista Nuevo Ingreso</h1>
          </div>
          <div className="call-timer">
            <span className="timer-label">Tiempo en llamada</span>
            <div className="timer-badge">
              <span className="timer-dot"/>
              <span>{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>
        <div className="video-area">
          <div className="video-label-top">
            <Shield size={16} color="#4ade80"/> Entrevistador IA
          </div>
          {/* Aqui iba el video anterior: src="/untitled.mp4" */}
          <video ref={mainVideoRef} className={`main-video ${videoReady ? 'visible' : ''}`}
            src="/render1.mp4" autoPlay playsInline
            onLoadedMetadata={handleMainVideoLoaded}
            onEnded={handleMainVideoEnded}
            onTimeUpdate={handleMainVideoTimeUpdate}/>
          <div className="floating-user-video">
            <video ref={localVideoRef} className="local-video" autoPlay muted playsInline/>
            <div className="local-video-overlay-simple">
              <div className="name-glass"><User size={10} color="#60a5fa"/>Tatiana Portillo (Tu)</div>
              <div className="mic-glass">
                {recordState==='idle'?<MicClosed size={14} style={{color:'#f87171'}}/>:<MicOpen size={14} style={{color:'#4ade80'}}/>}
              </div>
            </div>
          </div>
          <div className="floating-audio-controls">
            <div className="audio-text-simple">
              <h3>{recordState==='idle'?'La IA esta esperando...':'Escuchando tu respuesta...'}</h3>
              <p>{recordState==='idle'?'Pulsa grabar cuando estes listo para contestar.':'Al terminar, pulsa nuevamente para enviar y continuar.'}</p>
            </div>
            <div className={`wave-visualizer-simple ${recordState==='recording'?'active':''}`}>
              {[...Array(8)].map((_,i)=><div key={i} className="wave-bar" ref={el=>waveBarsRef.current[i]=el}/>)}
            </div>
            <button className={`btn-record-simple ${recordState==='recording'?'recording':''}`} onClick={toggle} id="btn-record">
              {recordState==='idle'?<MicClosed size={24}/>:<MicOpen size={24}/>}
            </button>
          </div>
        </div>
      </div>

      <div className="right-sidebar">
        <div className="sidebar-panel-container full-height-panel">
          <div className="tabs-glass">
            <button className={`tab ${sidebarTab==='chat'?'active':''}`} onClick={()=>setSidebarTab('chat')} id="tab-chat">Chat en Vivo</button>
            <button className={`tab ${sidebarTab==='notes'?'active':''}`} onClick={()=>setSidebarTab('notes')} id="tab-notes">Notas</button>
          </div>
          {sidebarTab==='chat'?(
            <>
              <div className="panel-title" style={{justifyContent:'center',margin:'0 0 14px 0'}}>
                <span style={{fontWeight:600,fontSize:'14px',color:'#ccc'}}>Chat en vivo</span>
              </div>
              <div className="message-list">
                <div className="message">
                  <img src="/profiles/interviewer.png" alt="Tatiana Portillo" className="msg-avatar"/>
                  <div>
                    <div className="msg-header"><span className="msg-author">Tatiana Portillo</span><span className="msg-time">09:52</span></div>
                    <div className="msg-content">Tengo una duda, los horarios de clase llegan junto al correo de aceptacion?</div>
                  </div>
                </div>
                <div className="message">
                  <img src="/profiles/ent.png" alt="Entrevistador" className="msg-avatar"/>
                  <div>
                    <div className="msg-header"><span className="msg-author">Entrevistador</span><span className="msg-time">09:55</span></div>
                    <div className="msg-content">Asi es, en tu email de aprobacion se adjuntaran todas las indicaciones y horarios.</div>
                  </div>
                </div>
              </div>
              <div className="chat-input">
                <input type="text" placeholder="Escribe al Entrevistador..." id="chat-input-field"/>
                <button className="btn-send" id="btn-send"><SendIcon size={18}/></button>
              </div>
            </>
          ):(
            <div className="notes-container">
              <div className="panel-title" style={{justifyContent:'center',margin:'0 0 14px 0'}}>
                <span style={{fontWeight:600,fontSize:'14px',color:'#ccc'}}>Recordatorios</span>
              </div>
              <div className="reminders-list">
                <div className="reminder-item">
                  <div className="reminder-dot"/>
                  <span>Recuerdar preguntar por las becas disponibles.</span>
                </div>
                <div className="reminder-item">
                  <div className="reminder-dot"/>
                  <span>El examen es el proximo lunes.</span>
                </div>
                <div className="reminder-item">
                  <div className="reminder-dot"/>
                  <span>Revisar el portal del alumno.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
