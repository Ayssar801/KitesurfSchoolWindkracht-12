// Importeer React, navigatie, iconen en de header-component
import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Package, Calendar, CreditCard } from 'lucide-react';
import Header from '../components/Header';

// Vaste data: leslocaties en de 4 stappen van het reserveringsproces
const locations = [
  { name: 'Zandvoort', desc: 'Uitstekende golven en gezellige surf-vibes.' },
  { name: 'Muiderberg', desc: 'Ondiep water, ideaal voor beginners om te oefenen.' },
  { name: 'Wijk aan Zee', desc: 'Brede stranden en de beste windcondities.' },
  { name: 'IJmuiden', desc: 'Ruime spot met vlak water achter de pieren.' },
  { name: 'Scheveningen', desc: 'De meest bekende kitesurfspot van Nederland.' },
  { name: 'Hoek van Holland', desc: 'Mooie golven en uitstekende windstroming.' }
];

const steps = [
  { id: 1, title: 'Registratie', desc: 'Maak snel en eenvoudig een account aan.', icon: <UserPlus size={32} color="#00b4d8" /> },
  { id: 2, title: 'Pakket kiezen', desc: 'Selecteer het lespakket dat bij jou past.', icon: <Package size={32} color="#00b4d8" /> },
  { id: 3, title: 'Datum kiezen', desc: 'Kies een geschikte datum en tijd.', icon: <Calendar size={32} color="#00b4d8" /> },
  { id: 4, title: 'Betaling bevestigen', desc: 'Betaal veilig online om je boeking te voltooien.', icon: <CreditCard size={32} color="#00b4d8" /> }
];

// Homepagina met hero-sectie, uitleg over kitesurfen, reserveringsstappen, locaties en footer
const Home = () => (
  <div>
    <Header />

    {/* Hero-sectie: grote banner met actielijnen en knoppen */}
    <section className="hero-section">
      <div className="container hero-content">
        <h1 className="hero-title">Bedwing de Wind &amp; Golven</h1>
        <p className="hero-subtitle">
          Leer professioneel en veilig kitesurfen bij <strong>KiteSurfSchool Windkracht-12</strong>.
          Ervaren instructeurs, de nieuwste materialen en de beste locaties in Nederland.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>Nu Registreren &amp; Boeken</Link>
          <Link to="/packages" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>Bekijk Lespakketten</Link>
        </div>
      </div>
    </section>

    {/* Sectie: uitleg over de sport met een afbeelding */}
    <section className="section-padding">
      <div className="container grid-cols-2" style={{ alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Over Kitesurfen</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '16px' }}>
            Kitesurfen is de ultieme watersport waarbij je op een kleine surfplank staat en je laat voorttrekken door een vlieger (kite). Met de juiste wind kun je enorme snelheden behalen en metershoge sprongen maken!
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Bij <strong>Windkracht-12</strong> geven we al 8 jaar les. Veiligheid staat bij ons voorop. De maximale groepsgrootte is <strong>2 personen per instructeur</strong>. Alle benodigde materialen (kite, board, wetsuit en trapeze) zijn inbegrepen in de prijs!
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src="/kitesurf_hero.png" alt="Kitesurfer in actie" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(15,23,42,0.1)' }} />
        </div>
      </div>
    </section>

    {/* Sectie: 4 stappen die uitleggen hoe het reserveringsproces werkt */}
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="container">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Hoe werkt reserveren?</h2>
        <div className="step-grid">
          {steps.map((step) => (
            <div key={step.id} className="glass-card step-card">
              <div className="step-icon-wrapper">{step.icon}</div>
              <h3 className="step-title">{step.id}. {step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Sectie: overzicht van alle leslocaties in Nederland */}
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
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

    {/* Afsluitende sectie met strandfoto */}
    <section className="section-padding">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Ready to Ride?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          Al onze instructeurs rijden met professionele kitespullen vanuit Utrecht naar de locaties aan het strand. Meld je aan en ontmoet ons direct aan de zee!
        </p>
        <img src="/kitesurf_beach.png" alt="Kitesurf strand en kites" style={{ width: '100%', maxWidth: '1100px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(15,23,42,0.1)' }} />
      </div>
    </section>

    <footer className="main-footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Gemaakt in het kader van het Kitesurfschool Windkracht-12 project.</p>
      </div>
    </footer>
  </div>
);

export default Home;
