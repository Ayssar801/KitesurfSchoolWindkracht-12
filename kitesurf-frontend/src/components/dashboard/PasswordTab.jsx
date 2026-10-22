// Importeer React, hooks en de API-hulpfunctie
import React, { useState } from 'react';
import { apiFetch } from '../../utils/api';

// Wachtwoordtabblad: stelt de gebruiker in staat zijn/haar wachtwoord te wijzigen
const PasswordTab = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Valideert of de wachtwoorden overeenkomen en verstuurt het wijzigingsverzoek naar de API
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Controleer of de nieuwe wachtwoorden overeenkomen
    if (newPassword !== newPasswordConfirmation) {
      setError('Nieuwe wachtwoorden komen niet overeen.');
      return;
    }

    try {
      await apiFetch('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation
        })
      });
      setMessage('Wachtwoord succesvol gewijzigd.');
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Wachtwoord Wijzigen</h2>

      <form onSubmit={handleUpdatePassword} style={{ marginTop: '20px' }}>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group">
          <label>Huidig Wachtwoord</label>
          <input type="password" className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Nieuw Wachtwoord</label>
          <input type="password" className="form-control" value={newPassword} placeholder="Minimaal 12 tekens, hoofdletter, cijfer, leesteken" onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Nieuw Wachtwoord Bevestigen</label>
          <input type="password" className="form-control" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
          Wachtwoord Bijwerken
        </button>
      </form>
    </div>
  );
};

export default PasswordTab;
