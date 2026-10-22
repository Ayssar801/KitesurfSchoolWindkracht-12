// Importeer React, hooks, de API-hulpfunctie en setUser voor het opslaan van bijgewerkte gegevens
import React, { useState } from 'react';
import { apiFetch, setUser } from '../../utils/api';

// Profieltabblad: stelt de gebruiker in staat zijn/haar persoonsgegevens bij te werken
const ProfileTab = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');
  const [birthDate, setBirthDate] = useState(user.birth_date || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bsn, setBsn] = useState(user.bsn || '');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Verstuurt de bijgewerkte profielgegevens naar de API en slaat de nieuwe data op in de browser
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Bepaal de velden die verstuurd moeten worden; BSN alleen voor instructeurs en eigenaren
    const body = { name, address, city, birth_date: birthDate, phone };
    if (user.role === 'owner' || user.role === 'instructor') {
      body.bsn = bsn;
    }

    try {
      const data = await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setUser(data.user);
      setMessage('Profiel succesvol bijgewerkt.');
      if (onUpdateUser) onUpdateUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '550px', margin: '0 auto' }}>
      <h2>Mijn Persoonsgegevens ({user.role === 'owner' ? 'Eigenaar' : user.role === 'instructor' ? 'Instructeur' : 'Klant'})</h2>

      <form onSubmit={handleUpdateProfile} style={{ marginTop: '20px' }}>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group">
          <label>Volledige Naam</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Adres</label>
          <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Woonplaats</label>
          <input type="text" className="form-control" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Geboortedatum</label>
          <input type="date" className="form-control" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>

        {/* BSN alleen tonen voor medewerkers (instructeur of eigenaar) */}
        {(user.role === 'owner' || user.role === 'instructor') && (
          <div className="form-group">
            <label>BSN-nummer</label>
            <input type="text" className="form-control" value={bsn} onChange={(e) => setBsn(e.target.value)} />
          </div>
        )}

        <div className="form-group">
          <label>Telefoonnummer / Mobiel</label>
          <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
          Gegevens Opslaan
        </button>
      </form>
    </div>
  );
};

export default ProfileTab;
