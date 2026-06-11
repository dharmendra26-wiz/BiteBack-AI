import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'SHOP') return '/shop/dashboard';
    if (user.role === 'FOOD_BANK') return '/foodbank/dashboard';
    return '/browse';
  };

  return (
    <nav className="nav">
      <div className="container flex items-center justify-between" style={{ width: '100%' }}>
        <Link to="/" className="nav-logo">🌿 Vesta AI</Link>

        <div className="flex items-center gap-4">
          <Link to="/browse" className="btn btn-ghost text-sm">Browse</Link>

          {user ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-ghost text-sm">Dashboard</Link>
              {user.role === 'SHOP' && (
                <>
                  <Link to="/shop/scanner" className="btn btn-ghost text-sm">📷 Scanner</Link>
                  <Link to="/shop/impact" className="btn btn-ghost text-sm">🌍 Impact</Link>
                </>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">
                  {user.businessName || user.username}
                </span>
                <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
