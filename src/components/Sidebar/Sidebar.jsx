import './Sidebar.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaCog, FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';
import UsuarioService from '../../services/UsuarioService';
import logoImage from '../../assets/images/logo.png';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Confirmar logout
    if (window.confirm('Tem certeza que deseja sair?')) {
      // Fazer logout
      UsuarioService.logout();
      // Redirecionar para login
      navigate('/');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/home" className="sidebar-logo">
        <img src={logoImage} alt="Inspirart Logo" />
      </Link>
      </div>
      <nav className="sidebar-nav">
        <Link to="/musicas"><span role="img" aria-label="músicas">🎵</span> músicas</Link>
        <Link to="/filmes"><span role="img" aria-label="filmes">🎬</span> filmes</Link>
        <Link to="/artes-digitais"><span role="img" aria-label="artes digitais">🖼️</span> artes digitais</Link>
        <Link to="/explorar"><span role="img" aria-label="explorar">🔍</span> explorar</Link>
        <Link to="/obras"><span role="img" aria-label="obras">📚</span> obras</Link>
        <Link to="/publicar"><span role="img" aria-label="publicar">➕</span> publicar</Link>
      </nav>
      <div className="sidebar-footer">
        <Link to="/configuracoes"><FaCog aria-label="configurações" /></Link>
        <Link to="/perfil"><FaUser aria-label="perfil" /></Link>
        <button 
          onClick={handleLogout}
          className="sidebar-logout-btn"
          aria-label="sair"
          title="Sair"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar; 