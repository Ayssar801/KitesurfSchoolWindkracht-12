// Importeer React, hooks, de API-hulpfunctie en de annuleringsmodal
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import CancelLessonModal from './CancelLessonModal';
import { formatStartTime, getStartTimes } from '../../utils/booking';

// Component voor het beheren van reserveringen en lessen van een specifieke klant
// Wordt gebruikt in zowel het instructeur- als het eigenaarsdashboard
const CustomerLessonsManager = ({ customer, onBack, showInstructorSelect, instructors = [], packages = [], locations = [], onRefreshDashboard }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // State voor het boekingsformulier
  const [showForm, setShowForm] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [daypart, setDaypart] = useState('');
  const [startTime, setStartTime] = useState('');
  const [bookingInstructorId, setBookingInstructorId] = useState('');
  const [lessonDates, setLessonDates] = useState([]);
  const [duo, setDuo] = useState({ name: '', email: '', address: '', city: '', phone: '' });
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // State voor het verplaatsen en annuleren van lessen
  const [rescheduleDates, setRescheduleDates] = useState({});
  const [rescheduleTimes, setRescheduleTimes] = useState({});
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingLesson, setCancellingLesson] = useState(null);

  useEffect(() => { fetchReservations(); }, [customer.id]);

  // Haalt alle reserveringen van de geselecteerde klant op van de server
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/users/${customer.id}/reservations`);
      setReservations(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Ververst zowel de lokale reserveringen als het bovenliggende dashboard
  const refresh = () => { fetchReservations(); if (onRefreshDashboard) onRefreshDashboard(); };

  // Werkt het aantal lesdatumvelden bij als een ander pakket wordt gekozen
  const handlePackageChange = (id) => {
    setSelectedPackageId(id);
    const pkg = packages.find(p => p.id === parseInt(id));
    setLessonDates(pkg ? Array(pkg.lesson_count).fill('') : []);
  };

  // Maakt een nieuwe reservering aan voor de geselecteerde klant
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingMessage(null);
    setBookingError(null);
    try {
      const result = await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: customer.id,
          package_id: selectedPackageId,
          location_id: selectedLocationId,
          daypart,
          start_time: startTime,
          lesson_dates: lessonDates,
          instructor_id: showInstructorSelect ? (bookingInstructorId || null) : null,
          duo_name: duo.name || null,
          duo_email: duo.email || null,
          duo_address: duo.address || null,
          duo_city: duo.city || null,
          duo_phone: duo.phone || null
        })
      });
      setBookingMessage(`Reservering aangemaakt; toegewezen aan ${result.reservation.instructor.name}.`);
      setSelectedPackageId(''); setSelectedLocationId(''); setBookingInstructorId('');
      setDaypart('');
      setStartTime('');
      setLessonDates([]);
      setDuo({ name: '', email: '', address: '', city: '', phone: '' });
      setShowForm(false);
      refresh();
    } catch (err) { setBookingError(err.message); }
  };

  // Verplaatst een les naar de nieuw gekozen datum
  const handleReschedule = async (lessonId) => {
    const newDate = rescheduleDates[lessonId];
    if (!newDate) return alert('Selecteer eerst een geldige datum.');
    setMessage(null); setError(null);
    try {
      const lesson = reservations.flatMap((reservation) => reservation.lessons).find((item) => item.id === lessonId);
      const startTime = rescheduleTimes[lessonId] || formatStartTime(lesson?.start_time);
      await apiFetch(`/lessons/${lessonId}/reschedule`, { method: 'PATCH', body: JSON.stringify({ lesson_date: newDate, start_time: startTime }) });
      setMessage('Les succesvol verplaatst.');
      setRescheduleDates(prev => { const c = { ...prev }; delete c[lessonId]; return c; });
      setRescheduleTimes(prev => { const c = { ...prev }; delete c[lessonId]; return c; });
      refresh();
    } catch (err) { setError(err.message); }
  };

  // Verwijdert een volledige reservering na bevestiging
  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze reservering volledig wilt verwijderen?')) return;
    try {
      await apiFetch(`/reservations/${id}`, { method: 'DELETE' });
      setMessage('Reservering succesvol verwijderd.');
      refresh();
    } catch (err) { setError(err.message); }
  };

  const selectedPkg = packages.find(p => p.id === parseInt(selectedPackageId));

  return (
    <div>
      {/* Koptekst met de naam van de klant en een terugknop */}
      <div className="header-row">
        <h2>Lessen beheren voor {customer.name}</h2>
        <button onClick={onBack} className="btn btn-secondary">&larr; Terug naar Lijst</button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Formulier sluiten' : 'Nieuwe Reservering Toevoegen'}
      </button>

      {/* Boekingsformulier: pakket, locatie, datums en optionele duo-gegevens */}
      {showForm && (
        <div className="dashboard-form-card">
          <h3>Nieuwe Reservering Toevoegen</h3>
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
            </div>

            {daypart && (
              <div className="form-group">
                <label>Starttijd</label>
                <select className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                  <option value="">-- Kies een starttijd --</option>
                  {getStartTimes(daypart).map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
                <small>De eindtijd hangt af van de lesduur.</small>
              </div>
            )}

            {/* Instructeur-dropdown: alleen zichtbaar in het eigenaarsdashboard */}
            {showInstructorSelect && (
              <div className="form-group">
                <label>Instructeur Toewijzen (Optioneel)</label>
                <select className="form-control" value={bookingInstructorId} onChange={(e) => setBookingInstructorId(e.target.value)}>
                  <option value="">-- Kies Instructeur --</option>
                  {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>
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
                {['name', 'email', 'address', 'city', 'phone'].map(f => (
                  <div key={f} className="form-group">
                    <label>{f === 'name' ? 'Naam' : f === 'email' ? 'E-mailadres' : f === 'address' ? 'Adres' : f === 'city' ? 'Woonplaats' : 'Telefoonnummer'}</label>
                    <input type={f === 'email' ? 'email' : 'text'} className="form-control" value={duo[f]} onChange={(e) => setDuo({ ...duo, [f]: e.target.value })} />
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full">Reservering Bevestigen</button>
          </form>
        </div>
      )}

      {/* Overzicht van alle reserveringen van de klant */}
      {loading ? <p>Reserveringen laden...</p> : reservations.length === 0 ? (
        <p className="text-muted">Deze klant heeft momenteel geen reserveringen.</p>
      ) : (
        <div className="lessons-manager-grid">
          {reservations.map((res) => (
            <div key={res.id} className="res-card">
              <div className="res-header">
                <div>
                  <h3>{res.package.name}</h3>
                  <p className="res-subtitle">
                    Locatie: {res.location.name} | Status: <strong>{res.status}</strong> | Betaling: <strong>{res.payment_status}</strong> | Instructeur: <strong>{res.instructor?.name || 'Nog toe te wijzen'}</strong>
                  </p>
                </div>
                <div className="res-meta">
                  <span className="price">&euro;{res.total_price},-</span>
                  <button onClick={() => handleDeleteReservation(res.id)} className="btn btn-danger">Verwijder Reservering</button>
                </div>
              </div>

              {/* Lesrijen met opties om te verplaatsen of annuleren per les */}
              <div className="res-body">
                <h4 className="section-subtitle">Lesdata beheren:</h4>
                {res.lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="lesson-row">
                    <div>
                      <strong>Les {idx + 1}:</strong> {new Date(lesson.lesson_date).toLocaleDateString('nl-NL')} — {formatStartTime(lesson.start_time)} ({lesson.daypart})
                      <span className={`badge badge-${lesson.status}`}>{lesson.status}</span>
                    </div>
                    <div className="actions-group">
                      {lesson.status === 'gepland' && (
                        <>
                          <div>
                            <input type="date" className="form-control" value={rescheduleDates[lesson.id] || ''} onChange={(e) => setRescheduleDates({ ...rescheduleDates, [lesson.id]: e.target.value })} />
                            <label>
                              Starttijd les {idx + 1}
                              <select className="form-control" aria-label={`Nieuwe starttijd les ${idx + 1}`} value={rescheduleTimes[lesson.id] || formatStartTime(lesson.start_time)} onChange={(e) => setRescheduleTimes({ ...rescheduleTimes, [lesson.id]: e.target.value })}>
                              {getStartTimes(lesson.daypart).map((time) => <option key={time} value={time}>{time}</option>)}
                              </select>
                            </label>
                          </div>
                          <button onClick={() => handleReschedule(lesson.id)} className="btn btn-secondary">Verplaatsen</button>
                          <button onClick={() => { setCancellingLesson(lesson); setCancelModalOpen(true); }} className="btn btn-danger">Annuleren</button>
                        </>
                      )}
                      {lesson.status === 'geannuleerd' && <span className="text-danger-inline">Geannuleerd: {lesson.cancellation_reason || '-'}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CancelLessonModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} lesson={cancellingLesson} role="instructor" onSuccess={refresh} />
    </div>
  );
};

export default CustomerLessonsManager;
