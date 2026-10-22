// Importeer React, hooks, de header, API-hulpfuncties en alle subcomponenten
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { apiFetch, getUser } from '../utils/api';
import ProfileTab from '../components/dashboard/ProfileTab';
import PasswordTab from '../components/dashboard/PasswordTab';
import CustomerLessonsManager from '../components/dashboard/CustomerLessonsManager';
import CancelLessonModal from '../components/dashboard/CancelLessonModal';
import { formatStartTime } from '../utils/booking';

// Eigenaarsdashboard: volledig beheer van gebruikers, betalingen, roosters, profiel en wachtwoord
const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [user, setUserState] = useState(getUser() || {});

  // State voor gebruikersbeheer
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer', address: '', city: '', birth_date: '', phone: '', bsn: '' });
  const [userMessage, setUserMessage] = useState(null);
  const [userError, setUserError] = useState(null);

  // State voor betalingsbeheer
  const [unpaidReservations, setUnpaidReservations] = useState([]);
  const [loadingUnpaid, setLoadingUnpaid] = useState(true);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [finalizingRes, setFinalizingRes] = useState(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [finalizeError, setFinalizeError] = useState(null);

  // State voor instructeursroosters
  const [instructors, setInstructors] = useState([]);
  const [scheduleInstructorId, setScheduleInstructorId] = useState('');
  const [instructorLessons, setInstructorLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [calendarView, setCalendarView] = useState('week');
  const [bookingStats, setBookingStats] = useState({ popular_locations: [], popular_packages: [] });
  const [loadingStats, setLoadingStats] = useState(false);

  // State voor de annuleringsmodal en het klantlessen-beheer
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingLesson, setCancellingLesson] = useState(null);
  const [selectedCustomerForLessons, setSelectedCustomerForLessons] = useState(null);
  const [packages, setPackages] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => { fetchOwnerData(); }, [activeTab]);

  // Haalt de benodigde data op op basis van het actieve tabblad
  const fetchOwnerData = async () => {
    try {
      const [pkgs, locs] = await Promise.all([apiFetch('/packages'), apiFetch('/locations')]);
      setPackages(pkgs);
      setLocations(locs);

      if (activeTab === 'users' || activeTab === 'billing') {
        const insts = await apiFetch('/users?role=instructor');
        setInstructors(insts);
      }

      if (activeTab === 'users') {
        setLoadingUsers(true);
        const uData = await apiFetch(`/users${selectedRoleFilter ? `?role=${selectedRoleFilter}` : ''}`);
        setUsers(uData);
      } else if (activeTab === 'billing') {
        setLoadingUnpaid(true);
        const resData = await apiFetch('/owner/unpaid-reservations');
        setUnpaidReservations(resData);
      } else if (activeTab === 'schedules') {
        const insts = await apiFetch('/users?role=instructor');
        setInstructors(insts);
        if (insts.length > 0 && !scheduleInstructorId) {
          setScheduleInstructorId(insts[0].id.toString());
          fetchInstructorLessons(insts[0].id);
        }
      } else if (activeTab === 'stats') {
        setLoadingStats(true);
        setBookingStats(await apiFetch('/owner/booking-stats'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
      setLoadingUnpaid(false);
      setLoadingStats(false);
    }
  };

  // Haalt de lessen op van een specifieke instructeur voor het roosteroverzicht
  const fetchInstructorLessons = async (instId) => {
    if (!instId) return;
    setLoadingLessons(true);
    try {
      const data = await apiFetch(`/instructor/lessons?instructor_id=${instId}`);
      setInstructorLessons(data);
    } catch (e) { console.error(e); }
    finally { setLoadingLessons(false); }
  };

  // Voegt een nieuwe gebruiker toe aan het systeem
  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserError(null);
    try {
      await apiFetch('/users', { method: 'POST', body: JSON.stringify({ ...newUser, bsn: newUser.role === 'instructor' ? newUser.bsn : null }) });
      setUserMessage('Gebruiker succesvol aangemaakt.');
      setNewUserOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'customer', address: '', city: '', birth_date: '', phone: '', bsn: '' });
      fetchOwnerData();
    } catch (err) { setUserError(err.message); }
  };

  // Werkt de gegevens van een bestaande gebruiker bij
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUserError(null);
    try {
      await apiFetch(`/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(editingUser) });
      setUserMessage('Gebruiker succesvol bijgewerkt.');
      setEditingUser(null);
      fetchOwnerData();
    } catch (err) { setUserError(err.message); }
  };

  // Verwijdert een gebruiker na bevestiging
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setUserMessage('Gebruiker succesvol verwijderd.');
      fetchOwnerData();
    } catch (err) { alert(err.message); }
  };

  // Schakelt de actieve/geblokkeerde status van een gebruiker om
  const handleToggleStatus = async (id) => {
    try {
      await apiFetch(`/owner/users/${id}/toggle-status`, { method: 'PATCH' });
      setUserMessage('Gebruiker status aangepast.');
      fetchOwnerData();
    } catch (err) { alert(err.message); }
  };

  // Maakt een reservering definitief na ontvangst van de betaling en wijst een instructeur toe
  const handleFinalizePayment = async (e) => {
    e.preventDefault();
    setFinalizeError(null);
    try {
      await apiFetch(`/owner/reservations/${finalizingRes.id}/finalize`, { method: 'PATCH', body: JSON.stringify({ instructor_id: selectedInstructorId }) });
      setFinalizeModalOpen(false);
      fetchOwnerData();
    } catch (err) { setFinalizeError(err.message); }
  };

  // Filtert de instructeurslessen op dag, week of huidige maand
  const getFilteredLessons = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return instructorLessons.filter(l => {
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
        <h1>Beheerderspaneel (Eigenaar)</h1>

        {/* Navigatietabbladen */}
        <div className="tab-nav">
          <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>Gebruikersbeheer</button>
          <button className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('billing')}>Betalingen &amp; Facturen</button>
          <button className={`btn ${activeTab === 'schedules' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('schedules')}>Instructeurs Rooster</button>
          <button className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('stats')}>Populairste keuzes</button>
          <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('profile')}>Mijn Profiel</button>
          <button className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('password')}>Wachtwoord</button>
        </div>

        {/* Tabblad: gebruikersbeheer */}
        {activeTab === 'users' && (
          <div className="glass-card">
            {selectedCustomerForLessons ? (
              // Toon de CustomerLessonsManager als er een klant is geselecteerd
              <CustomerLessonsManager customer={selectedCustomerForLessons} onBack={() => setSelectedCustomerForLessons(null)} showInstructorSelect={true} instructors={instructors} packages={packages} locations={locations} onRefreshDashboard={fetchOwnerData} />
            ) : (
              <div>
                {/* Koptekst met rolfilter en knop om een gebruiker toe te voegen */}
                <div className="header-row">
                  <h2>Gebruikerslijst</h2>
                  <div className="actions-group">
                    <select className="form-control" value={selectedRoleFilter} onChange={(e) => {
                      setSelectedRoleFilter(e.target.value);
                      setLoadingUsers(true);
                      apiFetch(`/users${e.target.value ? `?role=${e.target.value}` : ''}`).then(setUsers).finally(() => setLoadingUsers(false));
                    }}>
                      <option value="">Alle rollen</option>
                      <option value="customer">Klanten</option>
                      <option value="instructor">Instructeurs</option>
                      <option value="owner">Eigenaren</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => { setNewUserOpen(true); setUserMessage(null); setUserError(null); }}>+ Gebruiker Toevoegen</button>
                  </div>
                </div>

                {userMessage && <div className="alert alert-success">{userMessage}</div>}

                {/* Inline bewerkingsformulier voor een bestaande gebruiker */}
                {editingUser && (
                  <div className="edit-section">
                    <h3>Gebruiker bewerken</h3>
                    <form onSubmit={handleUpdateUser} className="grid-form">
                      {userError && <div className="alert alert-danger">{userError}</div>}
                      <div className="form-group"><label>Naam</label><input type="text" className="form-control" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} required /></div>
                      <div className="form-group"><label>E-mailadres</label><input type="email" className="form-control" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required /></div>
                      <div className="form-group"><label>Nieuw Wachtwoord (Optioneel)</label><input type="password" className="form-control" placeholder="Laat leeg om niet te wijzigen" onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} /></div>
                      <div className="form-group"><label>Gebruikersrol</label>
                        <select className="form-control" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} required>
                          <option value="customer">Klant</option><option value="instructor">Instructeur</option><option value="owner">Eigenaar</option>
                        </select>
                      </div>
                      {['address', 'city', 'phone', 'bsn'].map(f => <div key={f} className="form-group"><label>{f === 'address' ? 'Adres' : f === 'city' ? 'Woonplaats' : f === 'phone' ? 'Mobiel' : 'BSN-nummer'}</label><input type="text" className="form-control" value={editingUser[f] || ''} onChange={(e) => setEditingUser({ ...editingUser, [f]: e.target.value })} /></div>)}
                      <div className="form-group"><label>Geboortedatum</label><input type="date" className="form-control" value={editingUser.birth_date || ''} onChange={(e) => setEditingUser({ ...editingUser, birth_date: e.target.value })} /></div>
                      <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Annuleren</button>
                        <button type="submit" className="btn btn-primary">Opslaan</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Modal voor het toevoegen van een nieuwe gebruiker */}
                {newUserOpen && (
                  <div className="modal-overlay">
                    <div className="glass-card modal-card large">
                      <h3>Nieuwe Gebruiker toevoegen</h3>
                      <form onSubmit={handleAddUser} className="grid-form">
                        {userError && <div className="alert alert-danger">{userError}</div>}
                        <div className="form-group"><label>Naam</label><input type="text" className="form-control" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required /></div>
                        <div className="form-group"><label>E-mail</label><input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required /></div>
                        <div className="form-group"><label>Wachtwoord</label><input type="password" className="form-control" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required /></div>
                        <div className="form-group"><label>Gebruikersrol</label>
                          <select className="form-control" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} required>
                            <option value="customer">Klant</option><option value="instructor">Instructeur</option>
                          </select>
                        </div>
                        {['address', 'city', 'phone'].map(f => <div key={f} className="form-group"><label>{f === 'address' ? 'Adres' : f === 'city' ? 'Woonplaats' : 'Telefoon / Mobiel'}</label><input type="text" className="form-control" value={newUser[f]} onChange={(e) => setNewUser({ ...newUser, [f]: e.target.value })} /></div>)}
                        <div className="form-group"><label>Geboortedatum</label><input type="date" className="form-control" value={newUser.birth_date} onChange={(e) => setNewUser({ ...newUser, birth_date: e.target.value })} /></div>
                        {/* BSN is verplicht voor instructeurs */}
                        {newUser.role === 'instructor' && (
                          <div className="form-group form-group-full">
                            <label>BSN-nummer (Verplicht voor instructeurs)</label>
                            <input type="text" className="form-control" value={newUser.bsn} onChange={(e) => setNewUser({ ...newUser, bsn: e.target.value })} required />
                          </div>
                        )}
                        <div className="form-actions">
                          <button type="button" className="btn btn-secondary" onClick={() => setNewUserOpen(false)}>Annuleren</button>
                          <button type="submit" className="btn btn-primary">Toevoegen</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Gebruikerslijst als tabel */}
                {loadingUsers ? <p>Bezig met laden...</p> : (
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Naam</th><th>E-mail / Rol</th><th>Woonplaats</th><th>Actief</th><th>Acties</th></tr></thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td data-label="Naam"><strong>{u.name}</strong></td>
                            <td data-label="E-mail / Rol">{u.email}<br /><span className="badge-role-pill">{u.role === 'owner' ? 'Eigenaar' : u.role === 'instructor' ? 'Instructeur' : 'Klant'}</span></td>
                            <td data-label="Woonplaats">{u.city || '-'}</td>
                            <td data-label="Actief"><span className={`badge ${u.is_active ? 'badge-definitief' : 'badge-geannuleerd'}`}>{u.is_active ? 'Actief' : 'Geblokkeerd'}</span></td>
                            <td data-label="Acties">
                              <div className="actions-row">
                                {u.role === 'customer' && <button className="btn btn-primary" onClick={() => setSelectedCustomerForLessons(u)}>Lessen Beheren</button>}
                                <button className="btn btn-secondary" onClick={() => { setEditingUser({ ...u }); setUserMessage(null); setUserError(null); }}>Bewerken</button>
                                <button className={`btn ${u.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleStatus(u.id)}>{u.is_active ? 'Blokkeer' : 'Deblokkeer'}</button>
                                {u.role !== 'owner' && <button className="btn btn-danger" onClick={() => handleDeleteUser(u.id)}>Verwijder</button>}
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

        {/* Tabblad: betalingen en facturen (onbetaalde reserveringen) */}
        {activeTab === 'billing' && (
          <div className="glass-card">
            <h2>Onbetaalde Reserveringen</h2>
            <p className="text-muted">Zodra de betaling binnen is, kun je deze definitief maken en een instructeur toewijzen.</p>
            {loadingUnpaid ? <p>Bezig met laden...</p> : unpaidReservations.length === 0 ? (
              <p className="text-muted">Geen onbetaalde reserveringen gevonden.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Klant</th><th>Pakket</th><th>Locatie</th><th>Totaal</th><th>Status</th><th>Actie</th></tr></thead>
                  <tbody>
                    {unpaidReservations.map(res => (
                      <tr key={res.id}>
                        <td data-label="Klant"><strong>{res.customer.name}</strong><br /><span className="res-info-subtext">{res.customer.email}</span></td>
                        <td data-label="Pakket">{res.package.name}</td>
                        <td data-label="Locatie">{res.location.name}</td>
                        <td data-label="Totaal"><strong>&euro;{res.total_price},-</strong></td>
                        <td data-label="Status">{res.payment_submitted ? <span className="badge badge-definitief">Betaling gemeld!</span> : <span className="badge badge-voorlopig">Wachtend</span>}</td>
                        <td data-label="Actie"><button className="btn btn-success" onClick={() => { setFinalizingRes(res); setSelectedInstructorId(res.instructor_id?.toString() || ''); setFinalizeError(null); setFinalizeModalOpen(true); }}>Betaling Ontvangen</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tabblad: instructeursrooster per instructeur */}
        {activeTab === 'schedules' && (
          <div className="glass-card">
            <div className="header-row">
              <h2>Instructeurs Planningen</h2>
              <div className="actions-group">
                <select className="form-control" value={scheduleInstructorId} onChange={(e) => { setScheduleInstructorId(e.target.value); fetchInstructorLessons(e.target.value); }}>
                  {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>
                <select className="form-control" value={calendarView} onChange={(e) => setCalendarView(e.target.value)}>
                  <option value="day">Dagoverzicht (Vandaag)</option>
                  <option value="week">Weekoverzicht (Komende 7 dagen)</option>
                  <option value="month">Maandoverzicht (Huidige maand)</option>
                </select>
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
                        <td data-label="Datum">{new Date(l.lesson_date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })} — {formatStartTime(l.start_time)} ({l.daypart})</td>
                        <td data-label="Klant"><strong>{l.reservation.customer.name}</strong></td>
                        <td data-label="Pakket">{l.reservation.package.name}</td>
                        <td data-label="Locatie">{l.reservation.location.name}</td>
                        <td data-label="Status"><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                        <td data-label="Actie">
                          {l.status === 'gepland' && <button className="btn btn-danger" onClick={() => { setCancellingLesson(l); setCancelModalOpen(true); }}>Annuleren</button>}
                          {l.status === 'geannuleerd' && <span className="text-danger-inline">Geannuleerd: {l.cancellation_reason || '-'}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="glass-card popularity-dashboard">
            <div className="popularity-header">
              <div>
                <p className="popularity-eyebrow">Inzicht in boekingen</p>
                <h2>Populairste keuzes</h2>
                <p className="text-muted">De meest gekozen locaties en lespakketten op basis van actieve reserveringen.</p>
              </div>
              <span className="popularity-badge">Top 5</span>
            </div>
            {loadingStats ? <p>Statistieken laden...</p> : (
              <div className="popularity-grid">
                {[
                  { title: 'Populairste locaties', items: bookingStats.popular_locations },
                  { title: 'Populairste lespakketten', items: bookingStats.popular_packages },
                ].map(({ title, items }) => {
                  const maxBookings = Math.max(1, ...items.map((item) => Number(item.bookings_count)));
                  return (
                    <section className="popularity-panel" key={title}>
                      <div className="popularity-panel-heading">
                        <h3>{title}</h3>
                      </div>
                      {items.length === 0 ? <p className="popularity-empty">Er zijn nog geen boekingen om te tonen.</p> : (
                        <ol className="popularity-list">
                          {items.map((item, index) => (
                            <li className="popularity-item" key={item.id}>
                              <div className="popularity-item-top">
                                <span className={`popularity-rank${index === 0 ? ' is-first' : ''}`}>{index + 1}</span>
                                <strong>{item.name}</strong>
                                <span className="popularity-count">{item.bookings_count} {item.bookings_count === 1 ? 'boeking' : 'boekingen'}</span>
                              </div>
                              <div className="popularity-track" aria-label={`${Math.round((Number(item.bookings_count) / maxBookings) * 100)} procent van de hoogste boekingen`}>
                                <span style={{ width: `${Math.max(8, (Number(item.bookings_count) / maxBookings) * 100)}%` }} />
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && <ProfileTab user={user} onUpdateUser={setUserState} />}
        {activeTab === 'password' && <PasswordTab />}
      </div>

      {/* Modal voor het definitief maken van een betaling en toewijzen van een instructeur */}
      {finalizeModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-card">
            <h3>Betaling Bevestigen &amp; Definitief maken</h3>
            <p>Reservering #{finalizingRes?.id} van <strong>{finalizingRes?.customer.name}</strong>. Een beschikbare instructeur is alvast toegewezen. Je kunt de toewijzing hier controleren of aanpassen:</p>
            <form onSubmit={handleFinalizePayment}>
              {finalizeError && <div className="alert alert-danger">{finalizeError}</div>}
              <div className="form-group">
                <label>Instructeur Toewijzen</label>
                <select className="form-control" value={selectedInstructorId} onChange={(e) => setSelectedInstructorId(e.target.value)} required>
                  <option value="">-- Kies Instructeur --</option>
                  {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setFinalizeModalOpen(false)}>Sluiten</button>
                <button type="submit" className="btn btn-success">Bevestig &amp; Activeer Cursus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CancelLessonModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} lesson={cancellingLesson} role="owner" onSuccess={() => { if (scheduleInstructorId) fetchInstructorLessons(scheduleInstructorId); }} />
    </div>
  );
};

export default OwnerDashboard;
