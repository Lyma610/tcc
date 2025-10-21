import './Sidebar.css';
import { Link } from 'react-router-dom';
import { FaCog, FaUser, FaBell } from 'react-icons/fa';
import logoImage from '../../assets/images/logo.png';

function Sidebar() {
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
      </div>
    </aside>
  );
}

export default Sidebar; 