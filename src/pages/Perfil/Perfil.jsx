import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';
import http from '../../common/http-common';
import PostagemService from '../../services/PostagemService';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Perfil.css';
import './EditProfile.css';


function Perfil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, likes: 0 });
  const [posts, setPosts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    bio: '',
    nivelAcesso: 'USER'
  });

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200; // Reduzido para 200px
          const MAX_HEIGHT = 200; // Reduzido para 200px
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
            // Comprimir mais a imagem (reduzido para 30%)
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
      // Apenas os campos que o backend aceita
      formData.append('nome', editForm.nome || '');
      formData.append('email', editForm.email || '');
      formData.append('nivelAcesso', userInfo.nivelAcesso || 'USER');
      formData.append('bio', editForm.bio || '');

      // Adicionar arquivo se houver
      const file = fileInputRef.current?.files[0];
      const compressedFile = compressedFileRef.current;
      if (compressedFile) {
        try {
          console.log('Enviando arquivo comprimido:', compressedFile.name, compressedFile.type, compressedFile.size);
          formData.append('file', compressedFile);
        } catch (error) {
          console.error('Erro ao anexar arquivo:', error);
          alert('Erro ao processar a imagem. Tente novamente.');
          return;
        }
      } else if (file) {
        // fallback: enviar o arquivo original
        formData.append('file', file);
      }

      // Atualizar dados do usuário
      await UsuarioService.editar(userInfo.id, formData);

      // Buscar os dados atualizados normalizados e atualizar o estado/localStorage
      const updatedUserData = await UsuarioService.getCurrentUserFull();
      if (updatedUserData) {
        // Atualizar localStorage com a versão bruta (para compatibilidade com outras partes)
        const storageData = { ...updatedUserData };
        if (storageData.foto && storageData.foto instanceof Uint8Array) {
          storageData.foto = Array.from(storageData.foto);
        }
        // garantir que fotoPerfil esteja presente no localStorage (data URL)
        if (updatedUserData.fotoPerfil) {
          storageData.fotoPerfil = updatedUserData.fotoPerfil;
        }
        localStorage.setItem('user', JSON.stringify(storageData));

        setUserInfo(updatedUserData);
        // Recarregar postagens do usuário (caso a foto/metadata influencie)
        await fetchUserPosts(updatedUserData.id);
      }
      setIsEditing(false);
      setPreviewImage(null);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Erro ao atualizar perfil. Tente novamente.');
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

      console.log('Dados do usuário carregados (normalizados):', userData);

      setUserInfo(userData);

      // Atualizar stats com os dados do usuário
      setStats({
        posts: userData.postsCount || 0,
        followers: userData.followersCount || 0,
        following: userData.followingCount || 0,
        likes: userData.likesCount || 0
      });

      // Buscar postagens do usuário
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
      console.log('Total posts from API:', all.length);
      const userPosts = all.filter(p => p.usuario && (p.usuario.id == userId));
      console.log('Posts belonging to userId', userId, ':', userPosts.length);
      // mapear para o formato usado na UI
      const mapped = userPosts.map(p => ({
        id: p.id,
        title: p.legenda || p.descricao || 'Sem título',
        image: p.id ? `${http.mainInstance.defaults.baseURL}postagem/image/${p.id}` : null,
        likes: p.curtidas || 0,
        comments: p.comentariosCount || 0,
        type: p.categoria?.nome?.toLowerCase() || 'art'
      }));
      setPosts(mapped);
    } catch (err) {
      console.error('Erro ao buscar postagens do usuário:', err);
      setPosts([]);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchUserData();
  }, []);
  if (loading) {
    return <div className="home-layout"><Sidebar /><main className="main-content"><div className="profile-container"><p>Carregando perfil...</p></div></main></div>;
  }
  if (error) {
    return <div className="home-layout"><Sidebar /><main className="main-content"><div className="profile-container"><p>{error}</p></div></main></div>;
  }
  if (!userInfo) {
    return null;
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
                    src={(() => {
                      if (previewImage) {
                          return previewImage;
                        }
                        if (userInfo.fotoPerfilBlob) {
                          return userInfo.fotoPerfilBlob;
                        }
                        if (userInfo.fotoPerfil) {
                          return userInfo.fotoPerfil;
                        }
                      if (userInfo.foto) {
                        try {
                          let fotoBytes;
                          if (typeof userInfo.foto === 'string' && userInfo.foto.startsWith('data:image')) {
                            return userInfo.foto;
                          } else if (Array.isArray(userInfo.foto)) {
                            fotoBytes = new Uint8Array(userInfo.foto);
                          } else if (userInfo.foto.data) {
                            fotoBytes = new Uint8Array(userInfo.foto.data);
                          }
                          if (fotoBytes) {
                            const base64String = btoa(String.fromCharCode.apply(null, fotoBytes));
                            return `data:image/jpeg;base64,${base64String}`;
                          }
                        } catch (error) {
                          console.error('Erro ao converter foto preview:', error);
                        }
                      }
                      return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23999' font-size='12' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>Usuário</text></svg>";
                    })()}
                    alt="Preview" 
                    style={{ objectFit: 'cover', width: '120px', height: '120px', borderRadius: '50%' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23999' font-size='12' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>Usuário</text></svg>";
                    }}
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
                  src={(() => {
                    // Primeiro verifica se tem fotoPerfil (que é a URL processada)
                    if (userInfo.fotoPerfilBlob) {
                      return userInfo.fotoPerfilBlob;
                    }
                    if (userInfo.fotoPerfil) {
                      return userInfo.fotoPerfil;
                    }
                    
                    // Se não tem foto, retorna a imagem padrão
                    if (!userInfo.foto) {
                      return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23999' font-size='12' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>Usuário</text></svg>";
                    }
                    
                    try {
                      let fotoBytes;
                      if (typeof userInfo.foto === 'string') {
                        // Se a foto já está em base64 ou URL
                        if (userInfo.foto.startsWith('data:image')) {
                          return userInfo.foto;
                        }
                      } else if (Array.isArray(userInfo.foto)) {
                        // Se a foto é um array de números
                        fotoBytes = new Uint8Array(userInfo.foto);
                      } else if (userInfo.foto.data) {
                        // Se a foto é um objeto com propriedade data
                        fotoBytes = new Uint8Array(userInfo.foto.data);
                      }

                      if (fotoBytes) {
                        const base64String = btoa(String.fromCharCode.apply(null, fotoBytes));
                        return `data:image/jpeg;base64,${base64String}`;
                      }

                      throw new Error('Formato de foto inválido');
                    } catch (error) {
                      console.error('Erro ao converter foto:', error, userInfo.foto);
                      return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23999' font-size='12' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>Usuário</text></svg>";
                    }
                  })()}
                  alt="Perfil"
                  style={{ objectFit: 'cover', width: '120px', height: '120px', borderRadius: '50%' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23999' font-size='12' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>Usuário</text></svg>";
                  }}
                />
                <div className="avatar-badge">✓</div>
              </div>
            </div>
            <div className="profile-info">
              <div className="profile-main">
                <h1>{userInfo.nome || userInfo.name}</h1>
                <p className="username">@{userInfo.username || userInfo.email}</p>
                <p className="bio">{userInfo.bio || ' '}</p>
                <div className="profile-meta">
                  <span> Entrou em {userInfo.joinDate || '-'}</span>
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
                {posts.length === 0 ? (
                  <p>Nenhuma publicação encontrada.</p>
                ) : (
                  posts.map(post => (
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
                  ))
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="achievements-grid">
                {achievements.length === 0 ? (
                  <p>Nenhuma conquista encontrada.</p>
                ) : (
                  achievements.map((achievement, index) => (
                    <div key={index} className="achievement-item">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                    </div>
                  ))
                )}
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
        )}
      </main>
    </div>
  );
}

export default Perfil;