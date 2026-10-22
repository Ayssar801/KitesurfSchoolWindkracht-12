// Importeer React, hooks, navigatiefuncties, iconen en hulpfuncties
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getUser, removeAuthToken, apiFetch } from '../utils/api';

// Navigatieheader die bovenaan elke pagina wordt weergegeven
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getUser();
  const navigate = useNavigate();

  // Logt de gebruiker uit: verwijdert token en stuurt door naar de loginpagina
  const handleLogout = async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (e) {
      console.error("Logout error", e);
    }
    removeAuthToken();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <span className="logo-accent">Windkracht</span>-12
        </Link>

        {/* Hamburgerknop voor mobiele schermen */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-toggle-btn" aria-label="Menu openen">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/packages" className="nav-link" onClick={() => setMenuOpen(false)}>Lespakketten</Link>

          {/* Toon gebruikersnaam, rol en dashboardlink als ingelogd, anders inlog/registratieknoppen */}
          {user ? (
            <div className="user-info">
              <span className="user-text">
                Ingelogd als: <strong style={{ color: 'var(--primary)' }}>{user.name}</strong> ({user.role === 'owner' ? 'Eigenaar' : user.role === 'instructor' ? 'Instructeur' : 'Klant'})
              </span>
              {user.role === 'customer' && <Link to="/customer" className="nav-link" onClick={() => setMenuOpen(false)}>Mijn Dashboard</Link>}
              {user.role === 'instructor' && <Link to="/instructor" className="nav-link" onClick={() => setMenuOpen(false)}>Instructeur Dashboard</Link>}
              {user.role === 'owner' && <Link to="/owner" className="nav-link" onClick={() => setMenuOpen(false)}>Beheerderspaneel</Link>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Uitloggen
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Inloggen</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Registreren</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
