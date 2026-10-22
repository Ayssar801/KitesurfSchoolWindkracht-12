// Importeer React, hooks, navigatie, de header en hulpfuncties
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch, getUser } from '../utils/api';

// Vaste lijst van leslocaties die onderaan de pagina worden getoond
const locations = [
  { name: 'Zandvoort', desc: 'Uitstekende golven en gezellige surf-vibes.' },
  { name: 'Muiderberg', desc: 'Ondiep water, ideaal voor beginners om te oefenen.' },
  { name: 'Wijk aan Zee', desc: 'Brede stranden en de beste windcondities.' },
  { name: 'IJmuiden', desc: 'Ruime spot met vlak water achter de pieren.' },
  { name: 'Scheveningen', desc: 'De meest bekende kitesurfspot van Nederland.' },
  { name: 'Hoek van Holland', desc: 'Mooie golven en uitstekende windstroming.' }
];

// Lespakketpagina: haalt pakketten op van de server en toont ze als kaartjes
const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = getUser();

  // Haal de lespakketten op van de server zodra de pagina laadt
  useEffect(() => {
    apiFetch('/packages')
      .then(setPackages)
      .catch(() => setError('Er is een fout opgetreden bij het ophalen van de lespakketten.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header />

      {/* Hero-sectie met de paginatitel */}
      <section className="pkg-hero">
        <div className="container hero-content">
          <h1 className="pkg-hero-title">Kitesurf Lespakketten</h1>
          <p className="pkg-hero-subtitle">
            Kies het lespakket dat bij jou past. Al onze lessen worden gegeven door gecertificeerde instructeurs op de mooiste locaties van Nederland.
          </p>
        </div>
      </section>

      {/* Sectie met de pakketkaartjes */}
      <section className="section-padding">
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Lespakketten laden...</p>
          ) : error ? (
            <div className="alert alert-danger" style={{ textAlign: 'center' }}>{error}</div>
          ) : (
            <div className="pkg-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ backgroundColor: 'rgba(2,132,199,0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '12px', fontSize: '15px', textAlign: 'center', padding: '6px 16px', borderRadius: '8px', alignSelf: 'flex-end' }}>
                    {pkg.max_people === 1 ? '1 Persoon (Privé)' : `Max. ${pkg.max_people} Personen (Duo)`}
                  </div>
                  <div className="glass-card pkg-card">
                    <h3 className="pkg-name">{pkg.name}</h3>
                    <div className="pkg-price">&euro;{pkg.price},-</div>
                    <div className="pkg-meta">
                      <span><strong>Lessen:</strong> {pkg.lesson_count} {pkg.lesson_count === 1 ? 'les' : 'lessen'} ({pkg.lesson_count} dagdelen)</span><br />
                      <span><strong>Lesduur:</strong> {pkg.hours} uur</span>
                    </div>
                    <p className="pkg-desc">{pkg.description}</p>

                    {/* Toon de juiste knop op basis van de rol van de gebruiker */}
                    {user ? (
                      user.role === 'customer' ? (
                        <Link to="/customer" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Boek deze les</Link>
                      ) : (
                        <div style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Log in als Klant om te boeken</div>
                      )
                    ) : (
                      <Link to="/register" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Registreer &amp; Boek</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sectie met een overzicht van de leslocaties */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Leslocaties</h2>
          <div className="location-grid">
            {locations.map((loc, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>{loc.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{loc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  );
};

export default Packages;
