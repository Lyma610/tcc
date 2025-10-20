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
    if (!nome || !signupEmail || !signupSenha) {
      setSignupError('Preencha todos os campos');
      return;
    }
    setLoadingSignup(true);
    try {
      const resp = await UsuarioService.signup(nome, signupEmail, signupSenha);
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
            <input value={signupEmail} onChange={e => setSignupEmail(e.target.value)} type="email" placeholder="Email" />
            <input value={signupSenha} onChange={e => setSignupSenha(e.target.value)} type="password" placeholder="Senha" />
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
