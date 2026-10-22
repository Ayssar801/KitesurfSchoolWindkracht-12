// Importeer React, hooks, de header, API-hulpfuncties en alle subcomponenten
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { apiFetch, getUser } from '../utils/api';
import ProfileTab from '../components/dashboard/ProfileTab';
import PasswordTab from '../components/dashboard/PasswordTab';
import CustomerLessonsManager from '../components/dashboard/CustomerLessonsManager';
import CancelLessonModal from '../components/dashboard/CancelLessonModal';
import { formatStartTime } from '../utils/booking';

// Instructeurdashboard: lesplanning, klantenbeheer, profiel en wachtwoord
const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [user, setUserState] = useState(getUser() || {});

  // State voor de lesplanning
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [calendarView, setCalendarView] = useState('week');

  // State voor klantenbeheer
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerMessage, setCustomerMessage] = useState(null);
  const [customerError, setCustomerError] = useState(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', password: '', passwordConfirm: '', address: '', city: '', birth_date: '', phone: '' });

  const [selectedCustomerForLessons, setSelectedCustomerForLessons] = useState(null);
  const [packages, setPackages] = useState([]);
  const [locations, setLocations] = useState([]);

  // State voor de annuleringsmodal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingLesson, setCancellingLesson] = useState(null);

  useEffect(() => { fetchInstructorData(); }, []);

  // Haalt tegelijk lessen, klanten, pakketten en locaties op van de server
  const fetchInstructorData = async () => {
    try {
      setLoadingLessons(true);
      setLoadingCustomers(true);
      const [lessonsData, custData, pkgs, locs] = await Promise.all([
        apiFetch('/instructor/lessons'),
        apiFetch('/users'),
        apiFetch('/packages'),
        apiFetch('/locations')
      ]);
      setLessons(lessonsData);
      setCustomers(custData);
      setPackages(pkgs);
      setLocations(locs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLessons(false);
      setLoadingCustomers(false);
    }
  };

  // Voegt een nieuwe klant toe; controleert eerst of de wachtwoorden overeenkomen
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setCustomerMessage(null);
    setCustomerError(null);
    if (newCustomer.password !== newCustomer.passwordConfirm) {
      setCustomerError('Wachtwoorden komen niet overeen.');
      return;
    }
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ ...newCustomer, role: 'customer', birth_date: newCustomer.birth_date || null })
      });
      setCustomerMessage('Klant succesvol toegevoegd.');
      setAddingCustomer(false);
      setNewCustomer({ name: '', email: '', password: '', passwordConfirm: '', address: '', city: '', birth_date: '', phone: '' });
      fetchInstructorData();
    } catch (err) {
      setCustomerError(err.message);
    }
  };

  // Werkt de gegevens van een bestaande klant bij
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setCustomerMessage(null);
    setCustomerError(null);
    try {
      await apiFetch(`/users/${editingCustomer.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingCustomer.name, email: editingCustomer.email, address: editingCustomer.address, city: editingCustomer.city, birth_date: editingCustomer.birth_date, phone: editingCustomer.phone })
      });
      setCustomerMessage('Klantgegevens succesvol bijgewerkt.');
      setEditingCustomer(null);
      fetchInstructorData();
    } catch (err) {
      setCustomerError(err.message);
    }
  };

  // Verwijdert een klant na bevestiging
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze klant wilt verwijderen?')) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setCustomerMessage('Klant succesvol verwijderd.');
      fetchInstructorData();
    } catch (err) {
      setCustomerError(err.message);
    }
  };

  // Filtert de lessen op dag, week of huidige maand op basis van de gekozen kalenderweergave
  const getFilteredLessons = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return lessons.filter(l => {
      const d = new Date(l.lesson_date);
      d.setHours(0, 0, 0, 0);
      if (calendarView === 'day') return d.getTime() === today.getTime();
      if (calendarView === 'week') { const nw = new Date(today); nw.setDate(today.getDate() + 7); return d >= today && d <= nw; }
      if (calendarView === 'month') return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      return true;
    });
  };

  return (
    <div>
      <Header />
      <div className="container dashboard-container">
        <h1>Instructeur Dashboard</h1>

        {/* Navigatietabbladen */}
        <div className="tab-nav">
          <button className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('calendar')}>Lesplanning</button>
          <button className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('customers')}>Mijn Klanten</button>
          <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('profile')}>Mijn Profiel</button>
          <button className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('password')}>Wachtwoord Wijzigen</button>
        </div>

        {/* Tabblad: lesplanning als kalenderoverzicht (dag/week/maand) */}
        {activeTab === 'calendar' && (
          <div className="glass-card">
            <div className="calendar-header">
              <h2>Lesplanning</h2>
              <div className="calendar-view-buttons">
                {['day', 'week', 'month'].map(v => (
                  <button key={v} onClick={() => setCalendarView(v)} className={`btn calendar-view-btn ${calendarView === v ? 'btn-primary' : 'btn-secondary'}`}>
                    {v === 'day' ? 'Vandaag' : v === 'week' ? 'Deze Week' : 'Huidige Maand'}
                  </button>
                ))}
              </div>
            </div>

            {loadingLessons ? <p>Bezig met laden...</p> : getFilteredLessons().length === 0 ? (
              <p className="text-muted">Geen lessen gepland voor deze selectie.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Datum</th><th>Klant</th><th>Pakket</th><th>Locatie</th><th>Status</th><th>Actie</th></tr></thead>
                  <tbody>
                    {getFilteredLessons().map(l => (
                      <tr key={l.id}>
                        <td>{new Date(l.lesson_date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })} — {formatStartTime(l.start_time)} ({l.daypart})</td>
                        <td><strong>{l.reservation.customer.name}</strong><br /><span className="res-info-subtext">{l.reservation.customer.phone || '-'}</span></td>
                        <td>{l.reservation.package.name}</td>
                        <td>{l.reservation.location.name}</td>
                        <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                        <td>{l.status === 'gepland' && <button onClick={() => { setCancellingLesson(l); setCancelModalOpen(true); }} className="btn btn-danger">Annuleren</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tabblad: klantenbeheer */}
        {activeTab === 'customers' && (
          <div className="glass-card">
            {selectedCustomerForLessons ? (
              // Toon de CustomerLessonsManager als er een klant is geselecteerd
              <CustomerLessonsManager
                customer={selectedCustomerForLessons}
                onBack={() => setSelectedCustomerForLessons(null)}
                showInstructorSelect={false}
                packages={packages}
                locations={locations}
                onRefreshDashboard={fetchInstructorData}
              />
            ) : (
              <div>
                <div className="header-row">
                  <h2>Mijn Toegewezen Klanten</h2>
                  <button onClick={() => { setAddingCustomer(!addingCustomer); setEditingCustomer(null); setCustomerMessage(null); setCustomerError(null); }} className="btn btn-primary">
                    {addingCustomer ? 'Sluiten' : 'Klant Toevoegen'}
                  </button>
                </div>

                {customerMessage && <div className="alert alert-success">{customerMessage}</div>}
                {customerError && <div className="alert alert-danger">{customerError}</div>}

                {/* Formulier voor het toevoegen van een nieuwe klant */}
                {addingCustomer && (
                  <div className="dashboard-form-card">
                    <h3>Nieuwe Klant Toevoegen</h3>
                    <form onSubmit={handleAddCustomer}>
                      {['name', 'email'].map(f => <div key={f} className="form-group"><label>{f === 'name' ? 'Naam' : 'E-mailadres'}</label><input type={f === 'email' ? 'email' : 'text'} className="form-control" value={newCustomer[f]} onChange={(e) => setNewCustomer({ ...newCustomer, [f]: e.target.value })} required /></div>)}
                      <div className="form-group"><label>Wachtwoord</label><input type="password" className="form-control" value={newCustomer.password} onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })} required /></div>
                      <div className="form-group"><label>Bevestig Wachtwoord</label><input type="password" className="form-control" value={newCustomer.passwordConfirm} onChange={(e) => setNewCustomer({ ...newCustomer, passwordConfirm: e.target.value })} required /></div>
                      {['address', 'city'].map(f => <div key={f} className="form-group"><label>{f === 'address' ? 'Adres' : 'Woonplaats'}</label><input type="text" className="form-control" value={newCustomer[f]} onChange={(e) => setNewCustomer({ ...newCustomer, [f]: e.target.value })} /></div>)}
                      <div className="form-group"><label>Geboortedatum</label><input type="date" className="form-control" value={newCustomer.birth_date} onChange={(e) => setNewCustomer({ ...newCustomer, birth_date: e.target.value })} /></div>
                      <div className="form-group"><label>Telefoonnummer</label><input type="text" className="form-control" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} /></div>
                      <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setAddingCustomer(false)}>Annuleren</button>
                        <button type="submit" className="btn btn-primary">Klant Opslaan</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Inline bewerkingsformulier voor een bestaande klant */}
                {editingCustomer && (
                  <div className="dashboard-form-card">
                    <h3>Klantgegevens bewerken</h3>
                    <form onSubmit={handleUpdateCustomer}>
                      <div className="form-group"><label>Naam</label><input type="text" className="form-control" value={editingCustomer.name} onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })} required /></div>
                      <div className="form-group"><label>E-mailadres</label><input type="email" className="form-control" value={editingCustomer.email} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} required /></div>
                      {['address', 'city', 'phone'].map(f => <div key={f} className="form-group"><label>{f === 'address' ? 'Adres' : f === 'city' ? 'Woonplaats' : 'Telefoonnummer'}</label><input type="text" className="form-control" value={editingCustomer[f] || ''} onChange={(e) => setEditingCustomer({ ...editingCustomer, [f]: e.target.value })} /></div>)}
                      <div className="form-group"><label>Geboortedatum</label><input type="date" className="form-control" value={editingCustomer.birth_date || ''} onChange={(e) => setEditingCustomer({ ...editingCustomer, birth_date: e.target.value })} /></div>
                      <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>Annuleren</button>
                        <button type="submit" className="btn btn-primary">Opslaan</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Klantenlijst als tabel met lessen beheren, bewerken en verwijderen */}
                {loadingCustomers ? <p>Bezig met laden...</p> : customers.length === 0 ? (
                  <p className="text-muted">Je hebt momenteel geen toegewezen klanten.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Naam</th><th>E-mail</th><th>Woonplaats</th><th>Mobiel</th><th>Acties</th></tr></thead>
                      <tbody>
                        {customers.map(c => (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.email}</td>
                            <td>{c.city || '-'}</td>
                            <td>{c.phone || '-'}</td>
                            <td>
                              <div className="actions-row">
                                <button onClick={() => setSelectedCustomerForLessons(c)} className="btn btn-primary">Lessen Beheren</button>
                                <button onClick={() => { setEditingCustomer({ ...c }); setCustomerMessage(null); setCustomerError(null); }} className="btn btn-secondary">Bewerken</button>
                                <button onClick={() => handleDeleteCustomer(c.id)} className="btn btn-danger">Verwijderen</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && <ProfileTab user={user} onUpdateUser={setUserState} />}
        {activeTab === 'password' && <PasswordTab />}
      </div>

      <CancelLessonModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        lesson={cancellingLesson}
        role="instructor"
        onSuccess={fetchInstructorData}
      />
    </div>
  );
};

export default InstructorDashboard;
