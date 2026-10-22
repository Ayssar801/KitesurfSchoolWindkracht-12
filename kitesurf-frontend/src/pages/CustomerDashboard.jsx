// Importeer React, hooks, de header, API-hulpfuncties en alle subcomponenten
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { apiFetch, getUser } from '../utils/api';
import ProfileTab from '../components/dashboard/ProfileTab';
import PasswordTab from '../components/dashboard/PasswordTab';
import CancelLessonModal from '../components/dashboard/CancelLessonModal';
import { formatStartTime, getStartTimes } from '../utils/booking';

// Klantdashboard: overzicht van reserveringen, boekingsformulier, profiel en wachtwoord
const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('reservations');
  const [user, setUserState] = useState(getUser() || {});
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [packages, setPackages] = useState([]);
  const [locations, setLocations] = useState([]);

  // State voor het boekingsformulier
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [daypart, setDaypart] = useState('');
  const [startTime, setStartTime] = useState('');
  const [lessonDates, setLessonDates] = useState([]);
  const [duoName, setDuoName] = useState('');
  const [duoEmail, setDuoEmail] = useState('');
  const [duoAddress, setDuoAddress] = useState('');
  const [duoCity, setDuoCity] = useState('');
  const [duoPhone, setDuoPhone] = useState('');
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // State voor de annuleringsmodal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingLesson, setCancellingLesson] = useState(null);
  const [cancellingReservation, setCancellingReservation] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  // Haalt tegelijk reserveringen, pakketten en locaties op van de server
  const fetchDashboardData = async () => {
    try {
      setLoadingReservations(true);
      const [resData, pkgs, locs] = await Promise.all([
        apiFetch('/reservations'),
        apiFetch('/packages'),
        apiFetch('/locations')
      ]);
      setReservations(resData);
      setPackages(pkgs);
      setLocations(locs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReservations(false);
    }
  };

  // Meldt aan de server dat de klant de betaling heeft overgemaakt
  const handleConfirmPayment = async (id) => {
    try {
      await apiFetch(`/reservations/${id}/confirm-payment`, { method: 'PATCH' });
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Werkt het aantal lesdatumvelden bij op basis van het gekozen pakket
  const handlePackageChange = (id) => {
    setSelectedPackageId(id);
    const pkg = packages.find(p => p.id === parseInt(id));
    setLessonDates(pkg ? Array(pkg.lesson_count).fill('') : []);
  };

  // Maakt een nieuwe reservering aan voor de ingelogde klant
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingMessage(null);
    setBookingError(null);
    try {
      const result = await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          package_id: selectedPackageId,
          location_id: selectedLocationId,
          daypart,
          start_time: startTime,
          lesson_dates: lessonDates,
          duo_name: duoName || null,
          duo_email: duoEmail || null,
          duo_address: duoAddress || null,
          duo_city: duoCity || null,
          duo_phone: duoPhone || null
        })
      });
      setBookingMessage(`Reservering geplaatst. Instructeur ${result.reservation.instructor.name} is toegewezen. Controleer je e-mail voor de betalingsgegevens.`);
      setSelectedPackageId(''); setSelectedLocationId('');
      setDaypart('');
      setStartTime('');
      setDuoName(''); setDuoEmail(''); setDuoAddress(''); setDuoCity(''); setDuoPhone('');
      setLessonDates([]);
      fetchDashboardData();
    } catch (err) {
      setBookingError(err.message);
    }
  };

  const openCancelModal = (res, lesson) => {
    setCancellingReservation(res);
    setCancellingLesson(lesson);
    setCancelModalOpen(true);
  };

  const selectedPkg = packages.find(p => p.id === parseInt(selectedPackageId));

  return (
    <div>
      <Header />
      <div className="container dashboard-container">
        <h1>Klant Dashboard</h1>

        {/* Navigatietabbladen */}
        <div className="tab-nav">
          <button className={`btn ${activeTab === 'reservations' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('reservations')}>Mijn Reserveringen</button>
          <button className={`btn ${activeTab === 'book' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('book')}>Nieuwe Reservering</button>
          <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('profile')}>Mijn Profiel</button>
          <button className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('password')}>Wachtwoord Wijzigen</button>
        </div>

        {/* Tabblad: overzicht van alle reserveringen van de klant */}
        {activeTab === 'reservations' && (
          <div className="glass-card">
            <h2>Jouw Reserveringen</h2>
            {loadingReservations ? (
              <p>Bezig met laden...</p>
            ) : reservations.length === 0 ? (
              <p className="text-muted">Je hebt nog geen reserveringen gemaakt.</p>
            ) : reservations.map((res) => (
              <div key={res.id} className="res-card">
                <div className="res-header">
                  <div>
                    <h3>{res.package.name}</h3>
                    <p className="res-subtitle">Locatie: {res.location.name} | Instructeur: {res.instructor?.name || 'Nog toe te wijzen'}</p>
                  </div>
                  <div className="res-meta">
                    <div className="badge-row">
                      <span className={`badge badge-${res.status}`}>{res.status}</span>
                      <span className={`badge badge-${res.payment_status}`}>{res.payment_status}</span>
                    </div>
                  </div>
                </div>

                {/* Lesrijen met een annuleringsknop per geplande les */}
                <div className="res-body">
                  <h4 className="section-subtitle">Lesdata:</h4>
                  <div className="lessons-grid">
                    {res.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="lesson-item">
                        <span>Les {idx + 1}: {new Date(lesson.lesson_date).toLocaleDateString('nl-NL')} — {formatStartTime(lesson.start_time)} ({lesson.daypart})</span>
                        {lesson.status === 'gepland' ? (
                          <button onClick={() => openCancelModal(res, lesson)} className="btn btn-secondary">Annuleren</button>
                        ) : (
                          <span className="cancelled">Geannuleerd</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer: prijs en betalingsknop (alleen zichtbaar als nog openstaand) */}
                <div className="res-footer">
                  <span className="price">Totaalbedrag: &euro;{res.total_price},-</span>
                  {res.payment_status === 'openstaand' && (
                    <div>
                      {res.payment_submitted ? (
                        <span className="payment-status">Betaling doorgegeven (in behandeling)</span>
                      ) : (
                        <button onClick={() => handleConfirmPayment(res.id)} className="btn btn-success">Ik heb betaald</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabblad: boekingsformulier voor een nieuwe reservering */}
        {activeTab === 'book' && (
          <div className="glass-card form-container-centered">
            <h2>Nieuwe Reservering Boeken</h2>
            <form onSubmit={handleCreateBooking}>
              {bookingMessage && <div className="alert alert-success">{bookingMessage}</div>}
              {bookingError && <div className="alert alert-danger">{bookingError}</div>}

              <div className="form-group">
                <label>Kies Cursus / Pakket</label>
                <select className="form-control" value={selectedPackageId} onChange={(e) => handlePackageChange(e.target.value)} required>
                  <option value="">-- Selecteer Pakket --</option>
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name} - &euro;{p.price},- ({p.lesson_count} lessen)</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Kies Locatie</label>
                <select className="form-control" value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} required>
                  <option value="">-- Selecteer Locatie --</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Kies Dagdeel</label>
                <select className="form-control" value={daypart} onChange={(e) => { setDaypart(e.target.value); setStartTime(''); }} required>
                  <option value="">-- Selecteer Dagdeel --</option>
                  <option value="ochtend">Ochtend</option>
                  <option value="middag">Middag</option>
                </select>
                <small>We wijzen automatisch een instructeur toe die op alle gekozen lesdatums plek heeft.</small>
              </div>

              {daypart && (
                <div className="form-group">
                  <label>Starttijd</label>
                  <select className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                    <option value="">-- Kies een starttijd --</option>
                    {getStartTimes(daypart).map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                  <small>Ochtend: 09:00–11:00 · Middag: 12:00–17:00. De eindtijd hangt af van de lesduur.</small>
                </div>
              )}

              {/* Datumselectie: één veld per les in het gekozen pakket */}
              {selectedPkg && (
                <div className="section-divider">
                  <h4 className="section-subtitle">Kies lesdata ({selectedPkg.lesson_count} lessen):</h4>
                  {Array.from({ length: selectedPkg.lesson_count }).map((_, idx) => (
                    <div key={idx} className="form-group">
                      <label>Datum Les {idx + 1}</label>
                      <input type="date" className="form-control" value={lessonDates[idx] || ''} onChange={(e) => { const d = [...lessonDates]; d[idx] = e.target.value; setLessonDates(d); }} required />
                    </div>
                  ))}
                </div>
              )}

              {/* Duo-gegevens: alleen zichtbaar als het pakket meer dan 1 persoon toestaat */}
              {selectedPkg && selectedPkg.max_people > 1 && (
                <div className="section-divider">
                  <h4 className="section-subtitle">Duo-deelnemer (Optioneel):</h4>
                  <div className="form-group"><label>Naam</label><input type="text" className="form-control" value={duoName} onChange={(e) => setDuoName(e.target.value)} /></div>
                  <div className="form-group"><label>E-mailadres</label><input type="email" className="form-control" value={duoEmail} onChange={(e) => setDuoEmail(e.target.value)} /></div>
                  <div className="form-group"><label>Adres</label><input type="text" className="form-control" value={duoAddress} onChange={(e) => setDuoAddress(e.target.value)} /></div>
                  <div className="form-group"><label>Woonplaats</label><input type="text" className="form-control" value={duoCity} onChange={(e) => setDuoCity(e.target.value)} /></div>
                  <div className="form-group"><label>Telefoonnummer</label><input type="text" className="form-control" value={duoPhone} onChange={(e) => setDuoPhone(e.target.value)} /></div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full">Reservering Bevestigen</button>
            </form>
          </div>
        )}

        {activeTab === 'profile' && <ProfileTab user={user} onUpdateUser={setUserState} />}
        {activeTab === 'password' && <PasswordTab />}
      </div>

      <CancelLessonModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        lesson={cancellingLesson}
        reservation={cancellingReservation}
        role="customer"
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default CustomerDashboard;
