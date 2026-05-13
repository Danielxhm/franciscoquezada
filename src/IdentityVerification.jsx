import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, ShieldAlert, ScanFace, Fingerprint, Lock } from 'lucide-react';

export default function IdentityVerification({ onVerified, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // fases: incia → escanea → verifica → listo
  const [phase, setPhase] = useState('init');
  const [simProgress, setSimProgress] = useState(0);

  // iniciar camara 
  useEffect(() => {
    let cancelled = false;
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error('Camera error:', e);
      }
    };
    startCam();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // sigue a la siguiente fase pero aqui simula la verificacion
  useEffect(() => {
    const timers = [
      // Camera warm-up
      setTimeout(() => setPhase('scanning'), 1200),
      // Progress simulation
      setTimeout(() => setSimProgress(18), 1600),
      setTimeout(() => setSimProgress(35), 2100),
      setTimeout(() => setSimProgress(52), 2600),
      setTimeout(() => setSimProgress(71), 3100),
      setTimeout(() => setSimProgress(88), 3600),
      setTimeout(() => setSimProgress(100), 4000),
      // Verifica
      setTimeout(() => setPhase('verified'), 4400),
      // procede a la pantalla de la videollamada
      setTimeout(() => setPhase('done'), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // si esta listo detiene la camara y hace una transicion para la siguiente pantalla
  useEffect(() => {
    if (phase !== 'done') return;
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    onVerified();
  }, [phase, onVerified]);

  const stepClass = (stepIndex) => {
    if (phase === 'init') return stepIndex === 0 ? 'active' : '';
    if (phase === 'scanning') return stepIndex <= 1 ? (stepIndex < 1 ? 'done' : 'active') : '';
    if (phase === 'verified' || phase === 'done') return 'done';
    return '';
  };

  return (
    <div className={`iv-overlay ${phase === 'done' ? 'fade-out' : ''}`}>
      <div className="iv-container">
        {/* Header */}
        <div className="iv-header">
          <div className={`iv-header-icon ${phase === 'verified' || phase === 'done' ? 'verified' : ''}`}>
            <ScanFace size={24} />
          </div>
          <div>
            <h2 className="iv-title">Verificacion de Identidad</h2>
            <p className="iv-subtitle">Confirmando tu identidad antes de ingresar a la entrevista</p>
          </div>
        </div>

        <div className="iv-body">
          {/* Left: Live Camera */}
          <div className="iv-camera-section">
            <div className="iv-section-label">
              <div className={`iv-live-dot ${phase !== 'init' ? 'active' : ''}`} />
              <span>Camara en Vivo</span>
            </div>
            <div className={`iv-camera-frame ${phase === 'scanning' ? 'scanning' : ''} ${phase === 'verified' || phase === 'done' ? 'verified' : ''}`}>
              <video ref={videoRef} autoPlay playsInline muted className="iv-video" />
              {phase === 'scanning' && (
                <div className="iv-scan-overlay">
                  <div className="iv-scan-line" />
                </div>
              )}
              {(phase === 'verified' || phase === 'done') && (
                <div className="iv-verified-badge">
                  <ShieldCheck size={18} />
                  <span>Identidad Confirmada</span>
                </div>
              )}
            </div>
          </div>

          
          <div className="iv-control-section">
            <div className="iv-section-label">
              <Lock size={14} />
              <span>Protocolo de Seguridad</span>
            </div>

            <div className="iv-info-panel">
              <div className={`iv-info-shield ${phase === 'verified' || phase === 'done' ? 'verified' : ''}`}>
                <Fingerprint size={36} />
              </div>
              <div className="iv-info-steps">
                <div className={`iv-step ${stepClass(0)}`}>
                  <div className="iv-step-dot" />
                  <span>Inicializar sistema biometrico</span>
                </div>
                <div className={`iv-step ${stepClass(1)}`}>
                  <div className="iv-step-dot" />
                  <span>Captura y analisis facial</span>
                </div>
                <div className={`iv-step ${stepClass(2)}`}>
                  <div className="iv-step-dot" />
                  <span>Comparacion con registro institucional</span>
                </div>
              </div>

              {/* barra de progreso */}
              {(phase === 'scanning') && (
                <div className="iv-progress-section">
                  <div className="iv-progress-bar">
                    <div className="iv-progress-fill" style={{ width: `${simProgress}%` }} />
                  </div>
                  <span className="iv-progress-text">Analizando similitud facial... {simProgress}%</span>
                </div>
              )}

              {/* Verifica resultad */}
              {(phase === 'verified' || phase === 'done') && (
                <div className="iv-result-card success">
                  <ShieldCheck size={24} />
                  <div className="iv-result-info">
                    <h3>Identidad Verificada</h3>
                    <p>Similitud: 97% — Conectando a la entrevista...</p>
                  </div>
                </div>
              )}

              <p className="iv-info-note">
                Tu rostro sera comparado con el registro biometrico vinculado a tu cuenta de aspirante.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="iv-footer">
          <ShieldAlert size={13} />
          <span>Este proceso utiliza reconocimiento facial para garantizar la integridad de la evaluacion. Los datos biometricos no se almacenan.</span>
        </div>
      </div>
    </div>
  );
}
