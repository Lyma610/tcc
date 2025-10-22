import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPrompt.css';

function LoginPrompt({ 
  title = "Login Necessário", 
  message = "Para acessar esta funcionalidade, você precisa fazer login como Artista.",
  showUpgrade = true 
}) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/');
  };

  const handleUpgrade = () => {
    navigate('/completar-registro');
  };

  return (
    <div className="login-prompt-container">
      <div className="login-prompt-content">
        <div className="login-prompt-icon">🔒</div>
        <h2>{title}</h2>
        <p>{message}</p>
        
        <div className="login-prompt-actions">
          <button 
            className="btn-login"
            onClick={handleLogin}
          >
            🎨 Fazer Login como Artista
          </button>
          
          {showUpgrade && (
          <button 
            className="btn-upgrade"
            onClick={handleUpgrade}
          >
            🎨 Completar Registro
          </button>
          )}
          
          <button 
            className="btn-back"
            onClick={() => window.history.back()}
          >
            ← Voltar
          </button>
        </div>
        
        <div className="login-prompt-info">
          <p><strong>Como Artista você pode:</strong></p>
          <ul>
            <li>✅ Postar suas criações</li>
            <li>✅ Acessar perfil completo</li>
            <li>✅ Interagir com outras obras</li>
            <li>✅ Personalizar sua experiência</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPrompt;
