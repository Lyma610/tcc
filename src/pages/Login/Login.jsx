import React, { useState } from 'react';
import '../Login/Login.css';
import { FaGooglePlusG, FaFacebookF, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';


function Login() {
  const [isActive, setIsActive] = useState(false);

  // login state
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // signup state
  const [nome, setNome] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupSenha, setSignupSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('VISITANTE'); // VISITANTE ou ARTISTA (será mapeado para nivelAcesso)
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (!email || !senha) {
      setLoginError('Preencha email e senha');
      return;
    }
    setLoadingLogin(true);
    try {
      const user = await UsuarioService.signin(email, senha);
      if (user) {
        navigate('/home');
      } else {
        setLoginError('Credenciais inválidas');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setLoginError(err.response?.data?.message || err.message || 'Erro ao realizar login');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);
    
    // Se for visitante, só precisa do nome
    if (tipoUsuario === 'VISITANTE') {
      if (!nome) {
        setSignupError('Digite seu nome para continuar como visitante');
        return;
      }
      setLoadingSignup(true);
      try {
        // Criar usuário visitante com dados mockados no banco
        const visitorData = {
          nome: nome,
          email: `visitor_${Date.now()}@temp.com`, // Email temporário único
          senha: 'temp_password_123', // Senha temporária
          nivelAcesso: 'VISITANTE',
          statusUsuario: 'TerminarRegistro', // Status especial para visitantes
          isVisitor: true
        };
        
        // Cadastrar no banco de dados
        const response = await UsuarioService.signup(
          visitorData.nome, 
          visitorData.email, 
          visitorData.senha, 
          'VISITANTE'
        );
        
        if (response && response.data) {
          console.log('=== RESPOSTA DO CADASTRO ===');
          console.log('Dados retornados do backend:', response.data);
          console.log('Status no backend:', response.data.status);
          console.log('StatusUsuario no backend:', response.data.statusUsuario);
          console.log('ID do usuário:', response.data.id);
          console.log('==========================');
          
          // Usar os dados reais retornados pelo backend
          const userData = {
            ...response.data,
            isVisitor: true
          };
          
          console.log('=== USUÁRIO CRIADO COM SUCESSO ===');
          console.log('Usuário:', userData);
          console.log('Status:', userData.statusUsuario);
          console.log('Tipo:', userData.nivelAcesso);
          console.log('ID:', userData.id);
          console.log('=================================');
          
          // Salvar no localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          setSignupSuccess('Bem-vindo como visitante! Você pode explorar o conteúdo.');
          setTimeout(() => {
            navigate('/home');
          }, 1500);
        }
      } catch (err) {
        console.error('Erro ao criar visitante:', err);
        setSignupError('Erro ao criar conta de visitante');
      } finally {
        setLoadingSignup(false);
      }
      return;
    }
    
    // Para artistas, precisa de todos os campos
    if (!nome || !signupEmail || !signupSenha) {
      setSignupError('Preencha todos os campos');
      return;
    }
    setLoadingSignup(true);
    try {
      const resp = await UsuarioService.signup(nome, signupEmail, signupSenha, tipoUsuario);
      setSignupSuccess('Conta criada com sucesso! Faça login.');
      setIsActive(false);
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setSignupError(err.response?.data?.message || err.message || 'Erro ao criar conta');
    } finally {
      setLoadingSignup(false);
    }
  };

  return (
    <div className="Login">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">
        <div className="form-container sign-up">
          <form onSubmit={handleSignup}>
            <h1>Crie sua Conta</h1>
            <div className="social-icons">
              <a href="#" className="icon"><FaGooglePlusG /></a>
              <a href="#" className="icon"><FaFacebookF /></a>
              <a href="#" className="icon"><FaGithub /></a>
              <a href="#" className="icon"><FaLinkedinIn /></a>
            </div>
            <span>ou use seu e-mail para se registrar</span>
            <input value={nome} onChange={e => setNome(e.target.value)} type="text" placeholder="Nome" />
            <input 
              value={signupEmail} 
              onChange={e => setSignupEmail(e.target.value)} 
              type="email" 
              placeholder="Email" 
              disabled={tipoUsuario === 'VISITANTE'}
              style={{
                opacity: tipoUsuario === 'VISITANTE' ? 0.5 : 1,
                cursor: tipoUsuario === 'VISITANTE' ? 'not-allowed' : 'text'
              }}
            />
            <input 
              value={signupSenha} 
              onChange={e => setSignupSenha(e.target.value)} 
              type="password" 
              placeholder="Senha" 
              disabled={tipoUsuario === 'VISITANTE'}
              style={{
                opacity: tipoUsuario === 'VISITANTE' ? 0.5 : 1,
                cursor: tipoUsuario === 'VISITANTE' ? 'not-allowed' : 'text'
              }}
            />
            
            {/* Seleção de Tipo de Usuário */}
            <div className="user-type-selection">
              <label className="user-type-label">Tipo de Usuário:</label>
              <div className="user-type-buttons">
                <button
                  type="button"
                  className={`user-type-btn ${tipoUsuario === 'VISITANTE' ? 'active' : ''}`}
                  onClick={() => setTipoUsuario('VISITANTE')}
                >
                  👤 Visitante
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${tipoUsuario === 'ARTISTA' ? 'active' : ''}`}
                  onClick={() => setTipoUsuario('ARTISTA')}
                >
                  🎨 Artista
                </button>
              </div>
              <small className="user-type-info">
                {/* {tipoUsuario === 'VISITANTE' 
                  ? 'Visitantes podem visualizar conteúdo mas não podem postar'
                  : 'Artistas podem postar e compartilhar suas criações'
                } */}
              </small>
            </div>
            
            {signupError && <div className="form-error">{signupError}</div>}
            {signupSuccess && <div className="form-success">{signupSuccess}</div>}
            <button className="button" type="submit" disabled={loadingSignup}>{loadingSignup ? 'Registrando...' : 'Registrar'}</button>
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Entre</h1>
            <div className="social-icons">
              <a href="#" className="icon"><FaGooglePlusG /></a>
              <a href="#" className="icon"><FaFacebookF /></a>
              <a href="#" className="icon"><FaGithub /></a>
              <a href="#" className="icon"><FaLinkedinIn /></a>
            </div>
            <span>ou use seu e-mail e senha</span>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" />
            <input value={senha} onChange={e => setSenha(e.target.value)} type="password" placeholder="Senha" />
            <a href="#">Esqueceu sua senha?</a>
            {loginError && <div className="form-error">{loginError}</div>}
            <button className="button" type="submit" disabled={loadingLogin}>{loadingLogin ? 'Entrando...' : 'Entrar'}</button>
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Bem vindo de volta!</h1>
              <p>Insira seus dados pessoais para usar todos os recursos do site</p>
              <button className="hidden button" onClick={() => setIsActive(false)}>Entrar</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Olá, Amigo!</h1>
              <p>Registre seus dados pessoais para usar todos os recursos do site</p>
              <button className="hidden button" onClick={() => setIsActive(true)}>Registrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
