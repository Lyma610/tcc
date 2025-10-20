import { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Configuracoes.css';

function Configuracoes() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    pushNotifications: true,
    darkMode: false,
    autoPlay: true,
    highQuality: true,
    language: 'pt',
    privacy: 'public',
    twoFactor: false,
    dataUsage: 'normal'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="main-content">
        <div className="settings-header">
          <h2 className="page-title">⚙️ Configurações</h2>
          <p className="page-subtitle">Personalize sua experiência na plataforma</p>
        </div>
        
        <div className="settings-container">
          <div className="settings-section">
            <div className="section-header">
              <h3>🔔 Notificações</h3>
              <p>Gerencie como você recebe atualizações</p>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Notificações gerais</span>
                <small>Receber todas as notificações da plataforma</small>
              </div>
              <label className="toggle-">
                <input type="checkbox" checked={settings.notifications} onChange={() => handleToggle('notifications')} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Notificações por email</span>
                <small>Receber resumos semanais por email</small>
              </div>
              <label className="toggle-">
                <input type="checkbox" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Notificações push</span>
                <small>Alertas instantâneos no navegador</small>
              </div>
              <label className="toggle-">
                <input type="checkbox" checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h3>🎨 Aparência</h3>
              <p>Customize a interface do aplicativo</p>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Modo escuro</span>
                <small>Interface com cores escuras</small>
              </div>
              <label className="toggle-">
                <input type="checkbox" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h3>🎵 Reprodução</h3>
              <p>Configure como o conteúdo é reproduzido</p>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Reprodução automática</span>
                <small>Iniciar automaticamente o próximo conteúdo</small>
              </div>
              <label className="toggle-">
                <input type="checkbox" checked={settings.autoPlay} onChange={() => handleToggle('autoPlay')} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Alta qualidade</span>
                <small>Reproduzir em qualidade máxima disponível</small>
              </div>
              <label className="toggle-">
                <input type="checkbox" checked={settings.highQuality} onChange={() => handleToggle('highQuality')} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Uso de dados</span>
                <small>Controle o consumo de internet</small>
              </div>
              <select value={settings.dataUsage} onChange={(e) => handleSelectChange('dataUsage', e.target.value)}>
                <option value="low">Baixo</option>
                <option value="normal">Normal</option>
                <option value="high">Alto</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h3>🌍 Idioma e Região</h3>
              <p>Defina seu idioma preferido</p>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Idioma do aplicativo</span>
                <small>Escolha o idioma da interface</small>
              </div>
              <select value={settings.language} onChange={(e) => handleSelectChange('language', e.target.value)}>
                <option value="pt">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h3>🔒 Privacidade e Segurança</h3>
              <p>Proteja sua conta e dados pessoais</p>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Perfil público</span>
                <small>Permitir que outros vejam seu perfil</small>
              </div>
              <select value={settings.privacy} onChange={(e) => handleSelectChange('privacy', e.target.value)}>
                <option value="public">Público</option>
                <option value="friends">Apenas amigos</option>
                <option value="private">Privado</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span>Autenticação de dois fatores</span>
                <small>Adicione uma camada extra de segurança</small>
              </div>
              <label className="toggle-">
                <input type="checkbox" checked={settings.twoFactor} onChange={() => handleToggle('twoFactor')} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn-save">💾 Salvar Alterações</button>
            <button className="btn-reset">🔄 Restaurar Padrões</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Configuracoes;