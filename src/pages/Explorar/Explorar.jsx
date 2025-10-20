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
        // Normalizar foto do usuário em cada post (converter array/obj -> data URL)
        const normalizedPosts = (postsData || []).map(p => {
          try {
            if (p.usuario && p.usuario.foto) {
              const f = p.usuario.foto;
              if (typeof f === 'string' && f.startsWith('data:image')) {
                p.usuario.foto = f; // já ok
              } else {
                const arr = f.data || f;
                if (arr && arr.length) {
                  const bytes = new Uint8Array(arr);
                  let binary = '';
                  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                  p.usuario.foto = btoa(binary);
                }
              }
            }
          } catch (err) {
            console.error('Erro ao normalizar foto do post:', err, p);
          }
          return p;
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
        setSuggestions(suggestionsData || []);
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
              ) : posts.filter(post => 
                searchTerm === '' || 
                post.legenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(post => (
                <article key={post.id} className="post">
                  <div className="post-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {post.usuario?.foto ? (
                          <img 
                              src={ExplorarService.getUserPhotoUrl(post.usuario.foto)}
                            alt={post.usuario.nome}
                          />
                        ) : (
                          <i className="bi bi-person-fill"></i>
                        )}
                      </div>
                      <div>
                        <div className="user-name-container">
                          <h4>{post.usuario?.nome || 'Usuário'}</h4>
                          {post.usuario?.verificado && <i className="bi bi-patch-check-fill verified-badge"></i>}
                        </div>
                        <span className="username">@{post.usuario?.username || 'usuario'} • {formatarData(post.dataCadastro)}</span>
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
                        {likedPosts.has(post.id) ? 1 : 0}
                      </button>
                      <button className="action-btn"><i className="bi bi-chat"></i> 0</button>
                      <button className="action-btn"><i className="bi bi-share"></i></button>
                    </div>
                    <button className="save-btn"><i className="bi bi-bookmark"></i></button>
                  </div>
                  
                  <div className="post-content">
                    <p><strong>{post.usuario?.nome || 'Usuário'}</strong> {post.legenda}</p>
                    {post.descricao && <p className="post-description">{post.descricao}</p>}
                    <div className="post-engagement">
                      <span className="post-info">
                        {post.categoria?.nome && <span className="categoria">{post.categoria.nome}</span>}
                        {post.genero?.nome && <span className="genero">{post.genero.nome}</span>}
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
              ) : suggestions.map((suggestion) => (
                <div key={suggestion.id} className="suggestion-item">
                  <div className="suggestion-avatar">
                    {suggestion.foto ? (
                        <img src={suggestion.fotoUrl} alt={suggestion.nome} />
                    ) : (
                      <i className="bi bi-person-fill"></i>
                    )}
                  </div>
                  <div className="suggestion-info">
                    <div className="user-name-container">
                      <h4>{suggestion.nome}</h4>
                      {suggestion.verificado && <i className="bi bi-patch-check-fill verified-badge"></i>}
                    </div>
                    <p className="username">@{suggestion.username}</p>
                    <p className="category">{suggestion.categoriaPrincipal?.nome || 'Artista'}</p>
                    <p className="followers">{suggestion.seguidores} seguidores</p>
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