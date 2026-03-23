import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, MapPin, LayoutDashboard, User, LogOut, LogIn } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const getLinks = () => {
    if (!user) {
      return [
        { name: 'Início', path: '/', icon: <ShieldCheck size={20} /> },
        { name: 'Entrar', path: '/auth', icon: <LogIn size={20} /> }
      ];
    }
    if (user.role === 'council') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> }
      ];
    }
    return [
      { name: 'Início', path: '/', icon: <ShieldCheck size={20} /> },
      { name: 'Reportar', path: '/report', icon: <MapPin size={20} /> },
      { name: 'Perfil', path: '/profile', icon: <User size={20} /> },
    ];
  };

  const navLinks = getLinks();

  return (
    <nav className="navbar glass-panel animate-fade-in">
      <div className="navbar-container">
        <Link to={user?.role === 'council' ? '/dashboard' : '/'} className="navbar-logo">
          <ShieldCheck size={28} color="var(--accent-primary)" />
          <span className="text-gradient">CityGuards</span>
        </Link>
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span className="nav-text">{link.name}</span>
            </Link>
          ))}
          {user && (
            <button className="nav-link logout-btn" onClick={onLogout} style={{background: 'transparent', cursor: 'pointer', border: 'none'}}>
              <LogOut size={20} color="var(--danger)" />
              <span className="nav-text" style={{color: 'var(--danger)'}}>Sair</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
