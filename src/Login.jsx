import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form-wrapper">
          <div className="login-logo-area">
            <img src="/log.png" alt="Logo" className="login-logo" />
            <h1 className="login-title">Bienvenido</h1>
            <p className="login-subtitle">Portal de entrevistas</p>
          </div>
          <div className="login-divider" />
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                type="email"
                className="login-input"
                defaultValue="jquezada@itca.edu.sv"
                readOnly
              />
            </div>
            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  defaultValue="Entrevista2026"
                  readOnly
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" defaultChecked />
                <span>Recordarme</span>
              </label>
            </div>
            <button type="submit" className="login-btn">
              <span>Iniciar Sesion</span>
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="login-footer-text">Credenciales proporcionadas por la institucion</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <div className="login-image-area">
            <img src="/login.png" alt="Institucion" className="login-image" />
          </div>
          <div className="login-card-bottom">
            <h2>Plataforma de Admision Academica</h2>
            <p>
              Te damos la bienvenida al sistema de evaluacion dirigida. El acceso a este
              modulo es exclusivo para aspirantes preseleccionados. Ingresa tus
              credenciales asignadas a continuacion para iniciar la entrevista que
              definira tu ingreso a nuestra institucion.
            </p>
            <div className="login-dots">
              <span className="ldot active" />
              <span className="ldot" />
              <span className="ldot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
