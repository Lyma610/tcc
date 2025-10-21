import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import ExplorarService from '../../services/ExplorarService';
import './Explorar.css';

function Explorar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Função auxiliar para converter foto em data URL
  const convertPhotoToDataURL = (foto) => {
    if (!foto) return null;
    
    try {
      // Se já é uma data URL, retorna direto
      if (typeof foto === 'string') {
        if (foto.startsWith('data:image')) {
          return foto;
        }
        // Se é uma string longa (base64), adiciona o prefixo
        if (foto.length > 100) {
          return `data:image/jpeg;base64,${foto}`;
        }
        return null;
      }
      
      // Converte array/objeto para Uint8Array
      let fotoBytes;
      if (Array.isArray(foto)) {
        fotoBytes = new Uint8Array(foto);
      } else if (foto.data) {
        fotoBytes = new Uint8Array(foto.data);
      } else if (foto instanceof Uint8Array) {
        fotoBytes = foto;
      } else {
        console.warn('📸 Formato de foto desconhecido:', typeof foto);
        return null;
      }
      
      // Converte para base64
      const base64String = btoa(String.fromCharCode.apply(null, fotoBytes));
      return `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      console.error('❌ Erro ao converter foto:', error);
      return null;
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar posts
        setLoading(true);
        const postsData = await ExplorarService.findAllPostagens();
        
        // Normalizar foto do usuário em cada post
        const normalizedPosts = (postsData || []).map(post => {
          if (post.usuario && post.usuario.foto) {
            const fotoUrl = convertPhotoToDataURL(post.usuario.foto);
            post.usuario.fotoUrl = fotoUrl;
          }
          return post;
        });
        
        setPosts(normalizedPosts);
      } catch (err) {
        console.error('Erro ao carregar posts:', err);
        setError('Erro ao carregar as postagens');
      } finally {
        setLoading(false);
      }

      try {
        // Buscar sugestões
        setLoadingSuggestions(true);
        const suggestionsData = await ExplorarService.getSugestoesUsuarios();
        
        // Normalizar fotos das sugestões
        const normalizedSuggestions = (suggestionsData || []).map(user => {
          if (user.foto) {
            user.fotoUrl = convertPhotoToDataURL(user.foto);
          }
          return user;
        });
        
        setSuggestions(normalizedSuggestions);
      } catch (err) {
        console.error('Erro ao carregar sugestões:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchData();
  }, []);

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  const filteredPosts = posts.filter(post => 
    searchTerm === '' || 
    post.legenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {loading ? (
                <div className="loading">Carregando postagens...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : filteredPosts.length === 0 ? (
                <div className="no-results">Nenhuma postagem encontrada</div>
              ) : filteredPosts.map(post => (
                <article key={post.id} className="post">
                  <div className="post-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {post.usuario?.fotoUrl ? (
                          <img 
                            src={post.usuario.fotoUrl}
                            alt={post.usuario.nome}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <i 
                          className="bi bi-person-fill" 
                          style={{ display: post.usuario?.fotoUrl ? 'none' : 'flex' }}
                        ></i>
                      </div>
                      <div>
                        <div className="user-name-container">
                          <h4>{post.usuario?.nome || 'Usuário'}</h4>
                          {post.usuario?.verificado && <i className="bi bi-patch-check-fill verified-badge"></i>}
                        </div>
                        <span className="username">
                          @{post.usuario?.username || post.usuario?.email || 'usuario'} • {formatarData(post.dataCadastro)}
                        </span>
                      </div>
                    </div>
                    <button className="btn-more"><i className="bi bi-three-dots"></i></button>
                  </div>
                  
                  <div className="post-image" style={{ cursor: 'pointer' }} onClick={() => navigate(`/postagem/${post.id}`)}>
                    <img src={ExplorarService.getImageUrl(post.id)} alt="Post" />
                  </div>
                  
                  <div className="post-actions">
                    <div className="action-buttons">
                      <button 
                        className={`action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <i className={`bi ${likedPosts.has(post.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i> 
                        {post.curtidas || 0}
                      </button>
                      <button className="action-btn">
                        <i className="bi bi-chat"></i> {post.comentarios || 0}
                      </button>
                      <button className="action-btn"><i className="bi bi-share"></i></button>
                    </div>
                    <button className="save-btn"><i className="bi bi-bookmark"></i></button>
                  </div>
                  
                  <div className="post-content">
                    <p><strong>{post.usuario?.nome || 'Usuário'}</strong> {post.legenda}</p>
                    {post.descricao && <p className="post-description">{post.descricao}</p>}
                    <div className="post-engagement">
                      <span className="post-info">
                        {post.categoria?.nome && <span className="categoria">📁 {post.categoria.nome}</span>}
                        {post.genero?.nome && <span className="genero">🎯 {post.genero.nome}</span>}
                      </span>
                      <div className="post-timestamp">{formatarData(post.dataCadastro)}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="right-sidebar">
            <div className="suggestions-widget">
              <h3>Sugestões para você</h3>
              {loadingSuggestions ? (
                <div className="loading">Carregando sugestões...</div>
              ) : suggestions.length === 0 ? (
                <div className="no-suggestions">Nenhuma sugestão disponível</div>
              ) : suggestions.map((suggestion) => (
                <div key={suggestion.id} className="suggestion-item">
                  <div className="suggestion-avatar">
                    {suggestion.fotoUrl ? (
                      <img 
                        src={suggestion.fotoUrl} 
                        alt={suggestion.nome}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <i 
                      className="bi bi-person-fill"
                      style={{ display: suggestion.fotoUrl ? 'none' : 'flex' }}
                    ></i>
                  </div>
                  <div className="suggestion-info">
                    <div className="user-name-container">
                      <h4>{suggestion.nome}</h4>
                      {suggestion.verificado && <i className="bi bi-patch-check-fill verified-badge"></i>}
                    </div>
                    <p className="username">@{suggestion.username || suggestion.email}</p>
                    <p className="category">{suggestion.categoriaPrincipal?.nome || 'Artista'}</p>
                    <p className="followers">{suggestion.seguidores || 0} seguidores</p>
                  </div>
                  <button className="btn-follow">Seguir</button>
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