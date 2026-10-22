// Importeer React, hooks, navigatie, de header en hulpfuncties voor inloggen
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch, setAuthToken, setUser } from '../utils/api';

// Inlogpagina: stuurt na succesvol inloggen de gebruiker door naar het juiste dashboard
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verstuurt het inlogformulier naar de API en slaat het token op bij succes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setAuthToken(data.access_token);
      setUser(data.user);

      // Redirect op basis van rol
      if (data.user.role === 'customer') navigate('/customer');
      else if (data.user.role === 'instructor') navigate('/instructor');
      else if (data.user.role === 'owner') navigate('/owner');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Inloggen mislukt. Controleer je gegevens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container centered-container">
        <div className="glass-card centered-card">
          <h2 className="centered-title">Inloggen</h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label>E-mailadres</label>
              <input type="email" className="form-control" placeholder="Bijv. terence@windkracht12.nl" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Wachtwoord</label>
              <input type="password" className="form-control" placeholder="Je wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '20px', color: 'var(--text-secondary)' }}>
              Nog geen account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Registreer hier</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
