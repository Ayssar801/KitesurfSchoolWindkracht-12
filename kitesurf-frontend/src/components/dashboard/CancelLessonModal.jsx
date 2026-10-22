// Importeer React, hooks en de API-hulpfunctie
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { formatStartTime, getStartTimes } from '../../utils/booking';

// Annuleringsmodal: pop-upvenster voor het annuleren van een les door klant, instructeur of eigenaar
const CancelLessonModal = ({ isOpen, onClose, lesson, reservation, role, onSuccess }) => {
  const [cancelType, setCancelType] = useState('illness');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Reset alle velden telkens als de modal opengaat
  useEffect(() => {
    if (isOpen) {
      setCancelType('illness');
      setCancelReason('');
      setCancelError(null);
      setNewDate('');
      setNewTime(formatStartTime(lesson?.start_time));
    }
  }, [isOpen, lesson]);

  if (!isOpen) return null;

  // Bereken morgen als minimale datum zodat klanten geen datum in het verleden kunnen kiezen
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Valideert het formulier en verstuurt het annuleringsverzoek naar de juiste API-route per rol
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCancelError(null);

    if (cancelReason.trim().length < 10) {
      setCancelError('De reden moet minimaal 10 tekens bevatten.');
      return;
    }
    if (role === 'customer' && !newDate) {
      setCancelError('Kies een nieuwe lesdatum.');
      return;
    }
    if (role === 'customer' && !newTime) {
      setCancelError('Kies een starttijd voor de inhaalles.');
      return;
    }

    try {
      if (role === 'customer') {
        // Klanten annuleren via de reservering en geven een nieuwe inhaalsdatum op
        await apiFetch(`/reservations/${reservation.id}/cancel`, {
          method: 'PATCH',
          body: JSON.stringify({ lesson_id: lesson.id, reason: cancelReason, new_date: newDate, new_time: newTime })
        });
      } else {
        // Instructeurs en eigenaren annuleren de les direct via het lesson-endpoint
        await apiFetch(`/lessons/${lesson.id}/instructor-cancel`, {
          method: 'PATCH',
          body: JSON.stringify({
            type: role === 'owner' ? cancelType : 'illness',
            reason: cancelReason
          })
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setCancelError(err.message);
    }
  };

  const formattedDate = lesson ? new Date(lesson.lesson_date).toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : '';

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 style={{ marginBottom: '12px' }}>
          {role === 'owner' ? 'Les Annuleren door Eigenaar' : 'Les Annuleren'}
        </h3>
        <p>Weet je zeker dat je de les op <strong>{formattedDate} om {formatStartTime(lesson?.start_time)}</strong> wilt annuleren? Reden is verplicht.</p>

        <form onSubmit={handleSubmit}>
          {cancelError && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{cancelError}</div>}

          {/* Eigenaar kiest het type annulering: ziekte of slecht weer */}
          {role === 'owner' && (
            <div className="form-group">
              <label>Type Annulering</label>
              <select className="form-control" value={cancelType} onChange={(e) => setCancelType(e.target.value)}>
                <option value="illness">Ziekte instructeur (Standaard mail)</option>
                <option value="weather">Slechte weersomstandigheden (Windkracht &gt; 10)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Reden voor annulering (minimaal 10 tekens)</label>
            <textarea className="form-control" rows="3" placeholder="Toelichting..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} required />
          </div>

          {/* Klanten moeten een nieuwe inhaalsdatum opgeven */}
          {role === 'customer' && (
            <div className="form-group">
              <label>Nieuwe gewenste lesdatum</label>
              <input type="date" className="form-control" value={newDate} min={minDate} onChange={(e) => setNewDate(e.target.value)} required />
              <small style={{ color: '#aaa', marginTop: '4px', display: 'block' }}>Het dagdeel blijft {lesson?.daypart}; kies de gewenste starttijd.</small>
              <label htmlFor="makeup-start-time" style={{ display: 'block', marginTop: '12px' }}>Starttijd inhaalles</label>
              <select id="makeup-start-time" className="form-control" value={newTime} onChange={(e) => setNewTime(e.target.value)} required>
                {getStartTimes(lesson?.daypart).map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Sluiten</button>
            <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Bevestig Annulering</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelLessonModal;
