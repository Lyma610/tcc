import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import http from '../../common/http-common';
import PostagemService from '../../services/PostagemService';
import UsuarioService from '../../services/UsuarioService';
import LoginPrompt from '../../components/LoginPrompt/LoginPrompt';
import './PostagemDetalhe.css';

function PostagemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Verificar se é visitante
  const currentUser = UsuarioService.getCurrentUser();
  const isVisitor = currentUser?.nivelAcesso === 'VISITANTE' || 
                   currentUser?.isVisitor === true ||
                   currentUser?.status === 'TerminarRegistro' ||
                   currentUser?.statusUsuario === 'TerminarRegistro' ||
                   !currentUser;

  // Funções para lidar com interações de visitantes
  const handleVisitorInteraction = (action) => {
    if (isVisitor) {
      setShowLoginPrompt(true);
      return;
    }
    // Se não for visitante, executar a ação normalmente
    action();
  };

  const handleLike = () => {
    handleVisitorInteraction(() => {
      setLiked(l => !l);
    });
  };

  const handleComment = () => {
    handleVisitorInteraction(() => {
      // Lógica de comentário aqui
      console.log('Comentando...');
    });
  };

  const handleShare = () => {
    handleVisitorInteraction(() => {
      // Lógica de compartilhamento aqui
      console.log('Compartilhando...');
    });
  };

  const handleFollow = () => {
    handleVisitorInteraction(() => {
      // Lógica de seguir aqui
      console.log('Seguindo...');
    });
  };

  // Função para normalizar usuário (converter byte[] em base64)
  const normalizeUser = (user) => {
    if (!user) return user;
    try {
      // Se já tiver foto como dataURL
      if (user.foto && typeof user.foto === 'string' && user.foto.startsWith('data:image')) {
        user.fotoPerfil = user.foto;
        return user;
      }

      // Caso foto venha como objeto { data: [...] } ou array de bytes
      const fotoArray = user.foto && (user.foto.data || user.foto);
      if (fotoArray && Array.isArray(fotoArray) && fotoArray.length > 0) {
        const bytes = new Uint8Array(fotoArray);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64String = btoa(binary);
        user.fotoPerfil = `data:image/jpeg;base64,${base64String}`;
      } else if (user.foto && typeof user.foto === 'string') {
        // pode ser que backend retorne apenas a string base64 sem prefixo
        const possibleBase64 = user.foto;
        const isBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(possibleBase64.replace(/\s+/g, ''));
        if (isBase64) {
          const dataUrl = `data:image/jpeg;base64,${possibleBase64.replace(/\s+/g, '')}`;
          user.fotoPerfil = dataUrl;
        }
      }
    } catch (err) {
      console.error('Erro ao normalizar usuário:', err);
    }
    return user;
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await PostagemService.findById(id);
        const postData = response.data;
        
        console.log('Post carregado:', postData);
        console.log('Usuario:', postData.usuario);
        console.log('Foto do usuario:', postData.usuario?.foto);
        
        // Normalizar a foto do usuário da postagem
        if (postData.usuario) {
          postData.usuario = normalizeUser(postData.usuario);
          console.log('Usuario normalizado:', postData.usuario);
          console.log('FotoPerfil gerada:', postData.usuario.fotoPerfil);
        }
        
        setPost(postData);
        
      } catch (err) {
        console.error('Erro ao carregar postagem:', err);
        setError('Erro ao carregar postagem.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div style={{padding: 24, color: '#fff'}}>Carregando...</div>;
  if (error) return <div style={{padding: 24, color: '#ff7777'}}>{error}</div>;
  if (!post) return <div style={{padding: 24, color: '#fff'}}>Postagem não encontrada.</div>;

  const avatarUrl = post.usuario?.fotoPerfil;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content detalhe-content">
        <div className="insta-detail-container">
          <div className="insta-image-area">
            <button className="voltar-btn" onClick={() => navigate(-1)} title="Voltar">&larr;</button>
            <img
              className="insta-img"
              src={post.id ? `${http.mainInstance.defaults.baseURL}postagem/image/${post.id}` : 'https://placehold.co/400x400?text=Sem+Imagem'}
              alt={post.legenda || 'Postagem'}
            />
          </div>
          <div className="insta-info-area">
            <div className="insta-user-row">
              <div className="insta-avatar">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={post.usuario?.nome || 'Usuário'}
                    onError={(e) => {
                      console.error('Erro ao carregar imagem de perfil');
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="avatar-placeholder"><i class="bi bi-person-fill"></i></div>';
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder"><i className="bi bi-person-fill"></i></div>
                )}
              </div>
              <div className="insta-user-meta">
                <span className="insta-username">{post.usuario?.nome || 'Usuário'}</span>
                <span className="insta-user-handle">@{post.usuario?.email?.split('@')[0] || 'usuario'}</span>
              </div>
              <button className="insta-follow-btn" onClick={handleFollow}>Seguir</button>
            </div>
            <div className="insta-post-content">
              <span className="insta-legenda">{post.legenda || ''}</span>
              {post.descricao && <p className="insta-descricao">{post.descricao}</p>}
            </div>
            <div className="insta-actions-row">
              <button className={`insta-action-btn${liked ? ' liked' : ''}`} onClick={handleLike}>
                <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
              <button className="insta-action-btn" onClick={handleComment}><i className="bi bi-chat"></i></button>
              <button className="insta-action-btn" onClick={handleShare}><i className="bi bi-share"></i></button>
            </div>
            <div className="insta-meta-row">
              <span className="insta-meta">{post.categoria?.nome || ''} • {post.genero?.nome || ''}</span>
            </div>
            <div className="insta-comments">
              <div className="insta-comments-title">Comentários</div>
              <div className="insta-comments-placeholder">(Em breve...)</div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de Login Prompt */}
      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginPrompt 
              title="Login Necessário"
              message="Para interagir com as postagens (curtir, comentar, compartilhar), você precisa fazer login como Artista."
              showUpgrade={true}
            />
            <button 
              className="modal-close"
              onClick={() => setShowLoginPrompt(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostagemDetalhe;