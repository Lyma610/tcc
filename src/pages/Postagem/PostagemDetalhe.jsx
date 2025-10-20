
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import http from '../../common/http-common';
import PostagemService from '../../services/PostagemService';
import './PostagemDetalhe.css';

function PostagemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await PostagemService.findById(id);
        setPost(response.data);
      } catch (err) {
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
                {post.usuario?.fotoPerfil || post.usuario?.foto ? (
                  <img src={post.usuario?.fotoPerfil || post.usuario?.foto} alt={post.usuario?.nome || 'Usuário'} />
                ) : (
                  <div className="avatar-placeholder"><i className="bi bi-person-fill"></i></div>
                )}
              </div>
              <div className="insta-user-meta">
                <span className="insta-username">{post.usuario?.nome || 'Usuário'}</span>
                <span className="insta-user-handle">@{post.usuario?.username || 'usuario'}</span>
              </div>
              <button className="insta-follow-btn">Seguir</button>
            </div>
            <div className="insta-post-content">
              <span className="insta-legenda">{post.legenda || ''}</span>
              {post.descricao && <p className="insta-descricao">{post.descricao}</p>}
            </div>
            <div className="insta-actions-row">
              <button className={`insta-action-btn${liked ? ' liked' : ''}`} onClick={() => setLiked(l => !l)}>
                <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
              <button className="insta-action-btn"><i className="bi bi-chat"></i></button>
              <button className="insta-action-btn"><i className="bi bi-share"></i></button>
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
    </div>
  );
}

export default PostagemDetalhe;
