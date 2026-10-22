// Importeer React, hooks, routingfuncties, de header en hulpfuncties voor inloggen
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch, setAuthToken, setUser } from '../utils/api';

// Accountactiveringspagina: de gebruiker stelt hier zijn wachtwoord in via de link uit de activatiemail
const Activate = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Controleert of het wachtwoord voldoet aan alle eisen (minimaal 12 tekens, hoofdletter, cijfer, leesteken)
  const validate = (pw) => {
    if (pw.length < 12) return 'Wachtwoord moet minimaal 12 tekens lang zijn.';
    if (!/[A-Z]/.test(pw)) return 'Wachtwoord moet ten minste één hoofdletter bevatten.';
    if (!/[0-9]/.test(pw)) return 'Wachtwoord moet ten minste één getal bevatten.';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Wachtwoord moet ten minste één leesteken bevatten (bijv. @, #, $, !).';
    return null;
  };

  // Valideert het wachtwoord en activeert het account via de API; logt daarna direct in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) return setError('Wachtwoorden komen niet overeen.');
    const validationError = validate(password);
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const data = await apiFetch('/activate', {
        method: 'POST',
        body: JSON.stringify({ token, password, password_confirmation: passwordConfirmation })
      });
      setSuccess(true);
      setAuthToken(data.access_token);
      setUser(data.user);
      // Stuur de gebruiker na 2 seconden door naar zijn dashboard
      setTimeout(() => navigate('/customer'), 2000);
    } catch (err) {
      setError(err.message || 'Activering mislukt. De code is mogelijk ongeldig of verlopen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container centered-container">
        <div className="glass-card centered-card">
          <h2 className="centered-title">Account Activeren</h2>
          <p className="centered-subtitle">Kies een veilig wachtwoord om je registratie te voltooien.</p>

          {/* Na activering: toon een succesbericht, anders het activatieformulier */}
          {success ? (
            <div className="alert alert-success" style={{ textAlign: 'center' }}>Account succesvol geactiveerd! Je wordt nu ingelogd...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Overzicht van de wachtwoordeisen */}
              <div className="requirements-box">
                <strong>Wachtwoord eisen:</strong>
                <ul style={{ margin: '8px 0 0 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <li>Minimaal 12 tekens lang</li>
                  <li>Ten minste één hoofdletter</li>
                  <li>Ten minste één cijfer</li>
                  <li>Ten minste één leesteken (bijv. @, #, !, ?, %)</li>
                </ul>
              </div>

              <div className="form-group">
                <label>Kies Wachtwoord</label>
                <input type="password" className="form-control" placeholder="Minimaal 12 tekens" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Wachtwoord Bevestigen</label>
                <input type="password" className="form-control" placeholder="Voer nogmaals in" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Bezig met activeren...' : 'Account Activeren'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activate;
