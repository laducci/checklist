import { Link, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Layout() {
  const navigate = useNavigate();
  const user = api.getCurrentUser();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="nav">
        <h1>Sistema de Auditoria de Qualidade</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ul className="nav-links">
            <li><Link to="/audits">Auditorias</Link></li>
            <li><Link to="/audits/new">Nova Auditoria</Link></li>
            <li><Link to="/non-conformities">Não Conformidades</Link></li>
          </ul>
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{user?.name} ({user?.role})</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
