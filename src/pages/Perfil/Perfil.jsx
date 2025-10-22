import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';
import http from '../../common/http-common';
import PostagemService from '../../services/PostagemService';
import Sidebar from '../../components/Sidebar/Sidebar';
import LoginPrompt from '../../components/LoginPrompt/LoginPrompt';
import './Perfil.css';
import './EditProfile.css';

function Perfil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, likes: 0 });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Verificar se é visitante
  const currentUser = UsuarioService.getCurrentUser();
  const isVisitor = currentUser?.nivelAcesso === 'VISITANTE' || 
                   currentUser?.isVisitor === true ||
                   currentUser?.status === 'TerminarRegistro' ||
                   currentUser?.statusUsuario === 'TerminarRegistro' ||
                   !currentUser;
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    bio: ''
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const fileInputRef = useRef(null);
  const compressedFileRef = useRef(null);

  const convertPhotoToDataURL = (foto) => {
    if (!foto) return null;
    
    try {
      if (typeof foto === 'string') {
        if (foto.startsWith('data:image')) return foto;
        if (foto.length > 100) return `data:image/jpeg;base64,${foto}`;
        return null;
      }
      
      let fotoBytes;
      
      if (Array.isArray(foto)) {
        fotoBytes = new Uint8Array(foto);
      } else if (foto.data) {
        fotoBytes = new Uint8Array(foto.data);
      } else if (foto instanceof Uint8Array) {
        fotoBytes = foto;
      } else {
        return null;
      }
      
      const base64String = btoa(String.fromCharCode.apply(null, fotoBytes));
      return `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      console.error('Erro ao converter foto:', error);
      return null;
    }
  };

  useEffect(() => {
    if (isEditing && userInfo) {
      setEditForm({
        nome: userInfo.nome || '',
        email: userInfo.email || '',
        bio: userInfo.bio || ''
      });
    }
  }, [isEditing, userInfo]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.3);
        };
      };
    });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: 'image/jpeg',
        });
        setPreviewImage(URL.createObjectURL(compressedBlob));
        compressedFileRef.current = compressedFile;
      } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
        alert('Erro ao processar a imagem. Tente novamente.');
      }
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordForm.novaSenha !== passwordForm.confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
      }

      if (passwordForm.novaSenha.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres!');
        return;
      }

      await UsuarioService.alterarSenha(userInfo.id, {
        senha: passwordForm.novaSenha
      });

      setShowPasswordChange(false);
      setPasswordForm({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });
      alert('Senha alterada com sucesso!');
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      alert('Erro ao alterar senha. Verifique a senha atual e tente novamente.');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('nome', editForm.nome || '');
      formData.append('email', editForm.email || '');
      formData.append('bio', editForm.bio || '');

      const compressedFile = compressedFileRef.current;
      if (compressedFile) {
        formData.append('file', compressedFile);
      }

      await UsuarioService.editar(userInfo.id, formData);

      const updatedUserData = await UsuarioService.getCurrentUserFull();
      if (updatedUserData) {
        const storageData = { ...updatedUserData };
        if (storageData.foto && storageData.foto instanceof Uint8Array) {
          storageData.foto = Array.from(storageData.foto);
        }
        if (updatedUserData.fotoPerfil) {
          storageData.fotoPerfil = updatedUserData.fotoPerfil;
        }
        localStorage.setItem('user', JSON.stringify(storageData));

        setUserInfo(updatedUserData);
        await fetchUserPosts(updatedUserData.id);
      }
      setIsEditing(false);
      setPreviewImage(null);
      alert('✅ Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta publicação?')) {
      return;
    }

    try {
      await PostagemService.delete(postId);
      alert('✅ Publicação excluída com sucesso!');
      
      // Atualizar lista de posts removendo o deletado
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Atualizar contador de posts
      setStats(prev => ({
        ...prev,
        posts: Math.max(0, prev.posts - 1)
      }));
    } catch (error) {
      console.error('Erro ao excluir publicação:', error);
      alert('❌ Erro ao excluir publicação. Tente novamente.');
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await UsuarioService.getCurrentUserFull();
      if (!userData) {
        setError('Usuário não autenticado.');
        setLoading(false);
        return;
      }

      setUserInfo(userData);

      setStats({
        posts: userData.postsCount || 0,
        followers: userData.followersCount || 0,
        following: userData.followingCount || 0,
        likes: userData.likesCount || 0
      });

      await fetchUserPosts(userData.id);
      
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setError('Erro ao carregar dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const allResp = await PostagemService.findAll();
      const all = allResp.data || [];
      const userPosts = all.filter(p => p.usuario && (p.usuario.id == userId));
      const mapped = userPosts.map(p => ({
        id: p.id,
        title: p.legenda || p.descricao || 'Sem título',
        image: p.id ? `${http.mainInstance.defaults.baseURL}postagem/image/${p.id}` : null,
        likes: p.curtidas || 0,
        comments: p.comentariosCount || 0,
        type: p.categoria?.nome?.toLowerCase() || 'art'
      }));
      setPosts(mapped);
      
      setStats(prev => ({
        ...prev,
        posts: mapped.length
      }));
    } catch (err) {
      console.error('Erro ao buscar postagens do usuário:', err);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getProfileImage = () => {
    if (previewImage) return previewImage;
    
    const photoURL = convertPhotoToDataURL(userInfo?.foto);
    if (photoURL) return photoURL;
    
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' font-size='48' font-family='Arial' text-anchor='middle' dominant-baseline='middle'%3E👤%3C/text%3E%3C/svg%3E";
  };

  if (loading) {
    return <div className="home-layout"><Sidebar /><main className="main-content"><div className="profile-container"><p>Carregando perfil...</p></div></main></div>;
  }
  if (error) {
    return <div className="home-layout"><Sidebar /><main className="main-content"><div className="profile-container"><p>{error}</p></div></main></div>;
  }
  if (!userInfo) {
    return null;
  }

  // Se for visitante, mostrar prompt para completar registro
  if (isVisitor) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="main-content">
          <div className="visitor-complete-registration">
            <div className="visitor-complete-content">
              <div className="visitor-complete-icon">🎨</div>
              <h2>Complete seu Registro</h2>
              <p>Para acessar seu perfil completo e todas as funcionalidades, você precisa se registrar como <strong>Artista</strong>.</p>
              
              <div className="visitor-complete-benefits">
                <h3>Como Artista você terá:</h3>
                <ul>
                  <li>✅ Perfil completo personalizado</li>
                  <li>✅ Poder postar suas criações</li>
                  <li>✅ Interagir com outras obras</li>
                  <li>✅ Acessar todas as funcionalidades</li>
                </ul>
              </div>
              
              <div className="visitor-complete-actions">
                <button 
                  className="btn-complete-registration"
                  onClick={() => navigate('/completar-registro')}
                >
                  🎨 Completar Registro como Artista
                </button>
                <button 
                  className="btn-continue-visitor"
                  onClick={() => navigate('/home')}
                >
                  👤 Continuar como Visitante
                </button>
              </div>
              
              <div className="visitor-complete-info">
                <p><strong>Dica:</strong> Você pode continuar explorando como visitante, mas para postar e acessar o perfil completo, precisará se registrar como Artista.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="main-content">
        {isEditing ? (
          <div className="edit-profile-container">
            <h2>Editar Perfil</h2>
            <div className="edit-form">
              <div className="form-group photo-upload">
                <label>Foto de Perfil</label>
                <div className="avatar-edit">
                  <img 
                    src={getProfileImage()}
                    alt="Preview" 
                    style={{ objectFit: 'cover', width: '120px', height: '120px', borderRadius: '50%' }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows="3"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="form-input"
                />
              </div>


              <button
                type="button"
                className="btn-password"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                {showPasswordChange ? '- Cancelar alteração de senha' : '+ Alterar senha'}
              </button>

              {showPasswordChange && (
                <div className="password-change-section">
                  <div className="form-group">
                    <label>Senha Atual</label>
                    <input
                      type="password"
                      value={passwordForm.senhaAtual}
                      onChange={(e) => setPasswordForm({...passwordForm, senhaAtual: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Nova Senha</label>
                    <input
                      type="password"
                      value={passwordForm.novaSenha}
                      onChange={(e) => setPasswordForm({...passwordForm, novaSenha: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={passwordForm.confirmarSenha}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmarSenha: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-save"
                    onClick={handlePasswordChange}
                  >
                    Alterar Senha
                  </button>
                </div>
              )}

              <div className="form-actions">
                <button 
                  className="btn-cancel" 
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewImage(null);
                  }}
                >
                  Cancelar
                </button>
                <button className="btn-save" onClick={handleEditSubmit}>
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-cover">
                <div className="profile-avatar">
                  <img 
                    src={getProfileImage()}
                    alt="Perfil"
                    style={{ objectFit: 'cover', width: '120px', height: '120px', borderRadius: '50%' }}
                  />
                  <div className="avatar-badge">✓</div>
                </div>
              </div>
              <div className="profile-info">
                <div className="profile-main">
                  <h1>{userInfo.nome || userInfo.name}</h1>
                  <p className="username">@{userInfo.username || userInfo.email}</p>
                  <p className="bio">{userInfo.bio || 'Olá gente'}</p>
                  <div className="profile-meta">
                    <span>📅 Entrou em {userInfo.joinDate || new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    ✏️ Editar Perfil
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
                  {posts.length === 0 ? (
                    <p>Nenhuma publicação encontrada.</p>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="content-item">
                        <div className="content-image" onClick={() => navigate(`/postagem/${post.id}`)}>
                          <img src={post.image} alt={post.title} />
                          <div className="content-overlay">
                            <div className="content-stats">
                              <span>❤️ {post.likes}</span>
                              <span>💬 {post.comments}</span>
                            </div>
                          </div>
                        </div>
                        <div className="content-info">
                          <h4>{post.title}</h4>
                          <button 
                            className="delete-post-btn"
                            onClick={() => handleDeletePost(post.id)}
                            title="Excluir publicação"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="achievements-grid">
                  <p>🏆 Conquistas em breve!</p>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="about-section">
                  <div className="about-card">
                    <h3>📊 Estatísticas</h3>
                    <div className="stats-detailed">
                      <div className="stat-item">
                        <span className="stat-label">Total de visualizações</span>
                        <span className="stat-value">Em breve</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Perfil;