import { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Perfil.css';

function Perfil() {
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'João Silva',
    username: 'joaosilva',
    bio: 'Artista digital e músico apaixonado por criar experiências únicas através da arte',
    location: 'São Paulo, Brasil',
    website: 'www.joaosilva.art',
    joinDate: 'Março 2023'
  });

  const stats = {
    posts: 42,
    followers: 1247,
    following: 234,
    likes: 5832
  };

  const posts = [
    { id: 1, type: 'music', title: 'Sigilo - Nova Faixa', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', likes: 156, comments: 23 },
    { id: 2, type: 'art', title: 'Arte Digital Abstrata', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80', likes: 89, comments: 12 },
    { id: 3, type: 'photo', title: 'Paisagem Urbana', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80', likes: 234, comments: 45 },
    { id: 4, type: 'music', title: 'Beat Experimental', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80', likes: 67, comments: 8 },
    { id: 5, type: 'art', title: 'Ilustração Digital', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=300&q=80', likes: 198, comments: 31 },
    { id: 6, type: 'photo', title: 'Retrato Artístico', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', likes: 145, comments: 19 }
  ];

  const achievements = [
    { icon: '🏆', title: 'Artista Destaque', description: 'Mais de 1000 curtidas em uma publicação' },
    { icon: '🎵', title: 'Músico Ativo', description: '10 músicas publicadas' },
    { icon: '🎨', title: 'Criador Versátil', description: 'Publicou em 3 categorias diferentes' },
    { icon: '👥', title: 'Influenciador', description: 'Mais de 1000 seguidores' }
  ];

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-cover">
              <div className="profile-avatar">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face" alt="Perfil" />
                <div className="avatar-badge">✓</div>
              </div>
            </div>
            <div className="profile-info">
              <div className="profile-main">
                <h1>{userInfo.name}</h1>
                <p className="username">@{userInfo.username}</p>
                <p className="bio">{userInfo.bio}</p>
                <div className="profile-meta">
                  <span>📍 {userInfo.location}</span>
                  <span>🌐 {userInfo.website}</span>
                  <span>📅 Entrou em {userInfo.joinDate}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? '💾 Salvar' : '✏️ Editar Perfil'}
                </button>
                <button className="share-btn">🔗 Compartilhar</button>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <h3>{stats.posts}</h3>
              <span>Publicações</span>
            </div>
            <div className="stat">
              <h3>{stats.followers.toLocaleString()}</h3>
              <span>Seguidores</span>
            </div>
            <div className="stat">
              <h3>{stats.following}</h3>
              <span>Seguindo</span>
            </div>
            <div className="stat">
              <h3>{stats.likes.toLocaleString()}</h3>
              <span>Curtidas</span>
            </div>
          </div>

          <div className="profile-tabs">
            <button 
              className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              📝 Publicações
            </button>
            <button 
              className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              🏆 Conquistas
            </button>
            <button 
              className={`tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              ℹ️ Sobre
            </button>
          </div>

          <div className="profile-content">
            {activeTab === 'posts' && (
              <div className="content-grid">
                {posts.map(post => (
                  <div key={post.id} className="content-item">
                    <div className="content-image">
                      <img src={post.image} alt={post.title} />
                      <div className="content-overlay">
                        <div className="content-stats">
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                    </div>
                    <div className="content-info">
                      <div className="content-type">
                        {post.type === 'music' && '🎵'}
                        {post.type === 'art' && '🎨'}
                        {post.type === 'photo' && '📸'}
                      </div>
                      <h4>{post.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="achievements-grid">
                {achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="about-section">
                <div className="about-card">
                  <h3>📊 Estatísticas</h3>
                  <div className="stats-detailed">
                    <div className="stat-item">
                      <span className="stat-label">Total de visualizações</span>
                      <span className="stat-value">25.4K</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Média de curtidas</span>
                      <span className="stat-value">139</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Engajamento</span>
                      <span className="stat-value">8.2%</span>
                    </div>
                  </div>
                </div>
                <div className="about-card">
                  <h3>🎯 Interesses</h3>
                  <div className="interests-tags">
                    <span className="tag">Música Eletrônica</span>
                    <span className="tag">Arte Digital</span>
                    <span className="tag">Fotografia</span>
                    <span className="tag">Design</span>
                    <span className="tag">Tecnologia</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Perfil;