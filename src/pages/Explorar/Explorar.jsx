import { useState } from 'react'
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Explorar.css';

function Explorar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [posts] = useState([
    { 
      id: 1, 
      user: 'maria_arts', 
      name: 'Maria Silva',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop', 
      likes: 1234, 
      caption: 'Explorando texturas digitais com técnicas de pintura tradicional. Esta peça representa a fusão entre o clássico e o contemporâneo. 🎨✨ #arte #digital #contemporanea', 
      time: '2h', 
      comments: 47,
      verified: true
    },
    { 
      id: 2, 
      user: 'joao_painter', 
      name: 'João Santos',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop', 
      likes: 892, 
      caption: 'Aquarela sobre papel Fabriano 300g. Inspiração nas paisagens do interior de Minas Gerais. A transparência da água captura a essência da manhã. 🌊🎨', 
      time: '4h', 
      comments: 23,
      verified: false
    },
    { 
      id: 3, 
      user: 'ana_sculptor', 
      name: 'Ana Costa',
      image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=500&h=500&fit=crop', 
      likes: 2156, 
      caption: 'Escultura em bronze patinado - "Movimento Perpétuo". 6 meses de trabalho resultaram nesta peça que explora a dinâmica do movimento humano. 🗿✨', 
      time: '6h', 
      comments: 89,
      verified: true
    },
    {
      id: 4,
      user: 'carlos_photo',
      name: 'Carlos Mendes',
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&h=500&fit=crop',
      likes: 567,
      caption: 'Fotografia fine art - série "Luzes Urbanas". Capturando a poesia escondida nas ruas da cidade durante o crepúsculo. 📸🌆',
      time: '8h',
      comments: 31,
      verified: false
    },
    {
      id: 5,
      user: 'lucia_ceramics',
      name: 'Lúcia Ferreira',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
      likes: 743,
      caption: 'Cerâmica artesanal queimada em forno a lenha. Cada peça é única, moldada à mão com argila local. Tradição que passa de geração em geração. 🏺',
      time: '12h',
      comments: 18,
      verified: true
    },
    {
      id: 6,
      user: 'pedro_street',
      name: 'Pedro Lima',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop',
      likes: 1876,
      caption: 'Arte urbana - mural colaborativo no centro da cidade. 3 dias de trabalho intenso com a comunidade local. A arte transforma espaços! 🎨🏙️',
      time: '1d',
      comments: 156,
      verified: false
    }
  ])

  const [suggestions] = useState([
    { user: 'carlos_digital', name: 'Carlos Digital', followers: '12.3k', category: 'Arte Digital' },
    { user: 'lucia_photo', name: 'Lúcia Fotógrafa', followers: '8.7k', category: 'Fotografia' },
    { user: 'pedro_design', name: 'Pedro Designer', followers: '15.1k', category: 'Design Gráfico' },
    { user: 'sofia_ilustra', name: 'Sofia Ilustradora', followers: '6.4k', category: 'Ilustração' }
  ])

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(postId)) {
        newLiked.delete(postId)
      } else {
        newLiked.add(postId)
      }
      return newLiked
    })
  }

  return (
    <div className="explorar-layout">
      <Sidebar />
      <main className="main-content">
        <div className="explorar-header">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              placeholder="Buscar artistas, obras..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="main-layout">
          <div className="main-feed">
            <div className="posts-feed">
              {posts.filter(post => 
                searchTerm === '' || 
                post.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.caption.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(post => (
                <article key={post.id} className="post">
                  <div className="post-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div>
                        <div className="user-name-container">
                          <h4>{post.name}</h4>
                          {post.verified && <i className="bi bi-patch-check-fill verified-badge"></i>}
                        </div>
                        <span className="username">@{post.user} • {post.time}</span>
                      </div>
                    </div>
                    <button className="btn-more"><i className="bi bi-three-dots"></i></button>
                  </div>
                  
                  <div className="post-image">
                    <img src={post.image} alt="Post" />
                  </div>
                  
                  <div className="post-actions">
                    <div className="action-buttons">
                      <button 
                        className={`action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <i className={`bi ${likedPosts.has(post.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i> 
                        {likedPosts.has(post.id) ? post.likes + 1 : post.likes}
                      </button>
                      <button className="action-btn"><i className="bi bi-chat"></i> {post.comments}</button>
                      <button className="action-btn"><i className="bi bi-share"></i></button>
                    </div>
                    <button className="save-btn"><i className="bi bi-bookmark"></i></button>
                  </div>
                  
                  <div className="post-content">
                    <p><strong>{post.name}</strong> {post.caption}</p>
                    <div className="post-engagement">
                      <span className="likes-count">{post.likes.toLocaleString()} curtidas</span>
                      <button className="view-comments">Ver todos os {post.comments} comentários</button>
                      <div className="post-timestamp">{post.time}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="right-sidebar">
            <div className="suggestions-widget">
              <h3>Sugestões para você</h3>
              {suggestions.map((suggestion, i) => (
                <div key={i} className="suggestion-item">
                  <div className="suggestion-avatar">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="suggestion-info">
                    <h4>{suggestion.name}</h4>
                    <p className="username">@{suggestion.user}</p>
                    <p className="category">{suggestion.category}</p>
                    <p className="followers">{suggestion.followers} seguidores</p>
                  </div>
                  <button className="btn-follow">Seguir</button>
                </div>
              ))}
            </div>
            
            <div className="trending-widget">
              <h3>Tendências em Arte</h3>
              {[
                { tag: '#ArteDigital', count: '12.3k posts' },
                { tag: '#Pintura', count: '8.7k posts' },
                { tag: '#Escultura', count: '5.2k posts' },
                { tag: '#Fotografia', count: '15.1k posts' }
              ].map((trend, i) => (
                <div key={i} className="trending-item">
                  <span className="hashtag">{trend.tag}</span>
                  <span className="count">{trend.count}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Explorar;