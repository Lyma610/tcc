import { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Notificacoes.css';

function Notificacoes() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'like', 
      user: 'Maria Santos', 
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      content: 'curtiu sua música "Sigilo"', 
      time: '2 min', 
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    { 
      id: 2, 
      type: 'follow', 
      user: 'Carlos Artista', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      content: 'começou a seguir você', 
      time: '1h', 
      read: false,
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    },
    { 
      id: 3, 
      type: 'comment', 
      user: 'Ana Silva', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      content: 'comentou: "Incrível trabalho! Parabéns pela criatividade"', 
      time: '3h', 
      read: true,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    { 
      id: 4, 
      type: 'like', 
      user: 'Pedro Costa', 
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      content: 'curtiu sua arte digital "Paisagem Urbana"', 
      time: '1d', 
      read: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    { 
      id: 5, 
      type: 'share', 
      user: 'Luiza Mendes', 
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      content: 'compartilhou sua fotografia', 
      time: '2d', 
      read: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    { 
      id: 6, 
      type: 'achievement', 
      user: 'Sistema', 
      avatar: null,
      content: 'Você desbloqueou a conquista "Artista Destaque"!', 
      time: '3d', 
      read: false,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    { 
      id: 7, 
      type: 'mention', 
      user: 'Rafael Oliveira', 
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      content: 'mencionou você em um comentário', 
      time: '1 sem', 
      read: true,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    const icons = {
      like: '❤️',
      follow: '👤',
      comment: '💬',
      share: '🔗',
      achievement: '🏆',
      mention: '📢'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      like: '#ff4757',
      follow: '#3742fa',
      comment: '#2ed573',
      share: '#ffa502',
      achievement: '#ff6348',
      mention: '#5352ed'
    };
    return colors[type] || '#747d8c';
  };

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="main-content">
        <div className="notifications-header-main">
          <h2 className="page-title">🔔 Notificações</h2>
          {unreadCount > 0 && (
            <div className="unread-badge">{unreadCount} não lidas</div>
          )}
        </div>
        
        <div className="notifications-container">
          <div className="notifications-controls">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todas ({notifications.length})
              </button>
              <button 
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Não lidas ({unreadCount})
              </button>
              <button 
                className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                Lidas ({notifications.length - unreadCount})
              </button>
            </div>
            
            <div className="action-buttons">
              <button className="mark-all-read" onClick={markAllAsRead}>
                ✓ Marcar todas como lidas
              </button>
            </div>
          </div>
          
          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <h3>Nenhuma notificação encontrada</h3>
                <p>Você está em dia com suas notificações!</p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className="notification-main">
                    <div className="notification-avatar">
                      {notif.avatar ? (
                        <img src={notif.avatar} alt={notif.user} />
                      ) : (
                        <div className="system-avatar">🎆</div>
                      )}
                    </div>
                    
                    <div 
                      className="notification-icon"
                      style={{ backgroundColor: getNotificationColor(notif.type) }}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-text">
                        <strong>{notif.user}</strong> {notif.content}
                      </div>
                      <div className="notification-meta">
                        <span className="notification-time">{notif.time}</span>
                        {!notif.read && <span className="new-badge">Novo</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    {!notif.read && (
                      <button 
                        className="mark-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        title="Marcar como lida"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      title="Excluir notificação"
                    >
                      ×
                    </button>
                  </div>
                  
                  {!notif.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Notificacoes;