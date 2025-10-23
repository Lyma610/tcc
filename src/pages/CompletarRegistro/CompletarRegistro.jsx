import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import UsuarioService from '../../services/UsuarioService';
import './CompletarRegistro.css';

function CompletarRegistro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    bio: ''
  });

  const currentUser = UsuarioService.getCurrentUser();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações após desmontagem

    const loadUserData = async () => {
      // Se não for visitante, redirecionar
      if (!currentUser || 
          (currentUser.nivelAcesso !== 'VISITANTE' && 
           currentUser.status !== 'TerminarRegistro' &&
           currentUser.statusUsuario !== 'TerminarRegistro' && 
           !currentUser.isVisitor)) {
        navigate('/home');
        return;
      }

      try {
        // Buscar dados completos do usuário no backend
        console.log('=== BUSCANDO DADOS DO USUÁRIO (UMA VEZ) ===');
        console.log('ID do usuário:', currentUser.id);
        
        if (currentUser.id) {
          const response = await UsuarioService.findById(currentUser.id);
          if (response && response.data && isMounted) {
            console.log('Dados do usuário encontrados:', response.data);
            setUserData(response.data);
            
            // Preencher formulário com dados reais
            setFormData({
              nome: response.data.nome || '',
              email: response.data.email || '',
              senha: '',
              confirmarSenha: '',
              bio: response.data.bio || ''
            });
          }
        } else {
          console.warn('ID do usuário não encontrado, usando dados do localStorage');
          if (isMounted) {
            setUserData(currentUser);
            setFormData(prev => ({
              ...prev,
              nome: currentUser.nome || '',
              email: currentUser.email || ''
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        // Usar dados do localStorage como fallback
        if (isMounted) {
          setUserData(currentUser);
          setFormData(prev => ({
            ...prev,
            nome: currentUser.nome || '',
            email: currentUser.email || ''
          }));
        }
      } finally {
        if (isMounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUserData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Array de dependências vazio para executar apenas uma vez

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validações
    if (!formData.nome || !formData.email || !formData.senha) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      console.log('=== COMPLETANDO REGISTRO ===');
      console.log('ID do usuário:', currentUser.id);
      console.log('Dados do formulário:', formData);

      // Preparar dados para atualização
      const updateData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        bio: formData.bio,
        nivelAcesso: 'ARTISTA', // Mudar para artista
        statusUsuario: 'ATIVO' // Ativar conta
      };

      console.log('Dados para atualização:', updateData);

      // Primeiro, atualizar dados básicos
      const basicUpdateData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        nivelAcesso: 'ARTISTA',
        statusUsuario: 'ATIVO' // Ativar conta
      };

      // Validação adicional dos dados
      if (!basicUpdateData.nome || basicUpdateData.nome.length < 2) {
        setError('Nome deve ter pelo menos 2 caracteres');
        setLoading(false);
        return;
      }

      if (!basicUpdateData.email || !basicUpdateData.email.includes('@')) {
        setError('Email inválido');
        setLoading(false);
        return;
      }

      console.log('Atualizando dados básicos:', basicUpdateData);
      
      try {
        const response = await UsuarioService.editar(currentUser.id, basicUpdateData);
        console.log('Resposta da atualização básica:', response);
        
        if (response && response.data) {
          // Depois, alterar senha e ativar conta
          console.log('Alterando senha e ativando conta...');
          const passwordUpdateData = {
            senha: formData.senha
          };
          
          const passwordResponse = await UsuarioService.alterarSenha(currentUser.id, passwordUpdateData);
          console.log('Resposta da alteração de senha:', passwordResponse);
        
          // Atualizar dados no localStorage
          const updatedUser = {
            ...currentUser,
            ...basicUpdateData,
            statusUsuario: 'ATIVO', // Forçar status ATIVO
            isVisitor: false
          };
          
          console.log('Usuário atualizado no localStorage:', updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          setSuccess('Registro completado com sucesso! Bem-vindo como Artista!');
          
          setTimeout(() => {
            navigate('/perfil');
          }, 2000);
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      } catch (editError) {
        console.error('Erro na edição:', editError);
        throw editError; // Re-throw para ser capturado pelo catch principal
      }
    } catch (err) {
      console.error('Erro ao completar registro:', err);
      
      // Tratamento específico de erros
      if (err.response?.status === 500) {
        setError('Erro interno do servidor. Tente novamente em alguns minutos.');
      } else if (err.response?.status === 400) {
        setError('Dados inválidos. Verifique as informações e tente novamente.');
      } else if (err.response?.status === 404) {
        setError('Usuário não encontrado. Faça login novamente.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(err.response?.data?.message || 'Erro ao completar registro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto busca dados do usuário
  if (loadingUser) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="main-content">
          <div className="complete-registration-container">
            <div className="complete-registration-content">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando seus dados...</p>
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
        <div className="complete-registration-container">
          <div className="complete-registration-content">
            <div className="complete-registration-header">
              <div className="complete-registration-icon">🎨</div>
              <h1>Complete seu Registro como Artista</h1>
              <p>Finalize seu cadastro para acessar todas as funcionalidades da plataforma</p>
              {userData && (
                <div className="user-info">
                  <p><strong>Dados atuais:</strong> {userData.nome} ({userData.email})</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="complete-registration-form">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha *</label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar Senha *</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite a senha novamente"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio (Opcional)</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Conte um pouco sobre você e suas criações..."
                  rows="4"
                />
              </div>

              {error && <div className="form-error">{error}</div>}
              {success && <div className="form-success">{success}</div>}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-complete"
                  disabled={loading}
                >
                  {loading ? 'Completando...' : '🎨 Completar Registro como Artista'}
                </button>
              </div>
            </form>

            <div className="complete-registration-benefits">
              <h3>🎉 Como Artista você terá:</h3>
              <ul>
                <li>✅ Perfil completo personalizado</li>
                <li>✅ Poder postar suas criações</li>
                <li>✅ Interagir com outras obras</li>
                <li>✅ Acessar todas as funcionalidades</li>
                <li>✅ Participar da comunidade artística</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CompletarRegistro;
