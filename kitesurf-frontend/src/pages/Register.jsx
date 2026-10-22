// Importeer React, hooks, navigatie, de header en de API-hulpfunctie
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

// Registratiepagina: na registratie wordt een activatiemail gestuurd
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Verstuurt naam en e-mail naar de API; bij succes wordt de activatiemail-melding getoond
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email })
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registratie mislukt. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container centered-container">
        <div className="glass-card centered-card">
          <h2 className="centered-title">Registreren</h2>

          {/* Na registratie: toon melding over de activatiemail, anders het formulier */}
          {success ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: '12px' }}>Welkom bij Windkracht-12!</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                We hebben een activatie-e-mail gestuurd naar <strong>{email}</strong>.
                Klik op de activatielink in die e-mail om je account te activeren en je wachtwoord in te stellen.
              </p>
              <div style={{ marginTop: '24px' }}>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>Ga naar Inloggen</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="form-group">
                <label>Volledige Naam</label>
                <input type="text" className="form-control" placeholder="Bijv. Jan Jansen" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>E-mailadres</label>
                <input type="email" className="form-control" placeholder="Bijv. jan@test.nl" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Bezig met registreren...' : 'Registreren'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '20px', color: 'var(--text-secondary)' }}>
                Heb je al een account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Log hier in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
