import { useMemo, useState } from 'react';
import { api } from '../api.js';
import { BASE_FARE, RATES, VEHICLE_LABELS, estimateFare, formatINR, formatWhen, plural } from '../fare.js';
import { useStore } from '../store.jsx';
import { useToast } from '../toast.jsx';
import Field from '../components/Field.jsx';
import StatusMark from '../components/StatusMark.jsx';
import ConfirmButton from '../components/ConfirmButton.jsx';

const EMPTY_FORM = { customerId: '', pickupLocation: '', dropLocation: '', distanceKm: '', vehicleType: 'SEDAN' };

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'CONFIRMED', label: 'In progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function Trips() {
  const { customers, drivers, bookings, loading, refresh } = useStore();
  const notify = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const freeByType = useMemo(() => {
    const counts = { HATCHBACK: 0, SEDAN: 0, SUV: 0 };
    drivers.forEach((d) => {
      if (d.status === 'AVAILABLE') counts[d.vehicleType] += 1;
    });
    return counts;
  }, [drivers]);

  const sorted = useMemo(() => [...bookings].sort((a, b) => b.id - a.id), [bookings]);
  const counts = useMemo(() => {
    const c = { ALL: bookings.length, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    bookings.forEach((b) => {
      c[b.status] += 1;
    });
    return c;
  }, [bookings]);
  const earned = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED').reduce((sum, b) => sum + b.fare, 0),
    [bookings]
  );
  const visible = filter === 'ALL' ? sorted : sorted.filter((b) => b.status === filter);

  const estimate = estimateFare(form.vehicleType, form.distanceKm);

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      const booking = await api.bookings.create({
        customerId: Number(form.customerId),
        pickupLocation: form.pickupLocation.trim(),
        dropLocation: form.dropLocation.trim(),
        distanceKm: Number(form.distanceKm),
        vehicleType: form.vehicleType,
      });
      notify(`Trip booked. ${booking.driver.name} (${booking.driver.vehicleNumber}) is assigned.`);
      setForm((f) => ({ ...f, pickupLocation: '', dropLocation: '', distanceKm: '' }));
      await refresh();
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function act(kind, id) {
    try {
      await api.bookings[kind](id);
      notify(kind === 'complete' ? 'Trip completed. The driver is free again.' : 'Trip cancelled. The driver is free again.');
      await refresh();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Trips</h1>
          <p>
            {plural(counts.CONFIRMED, 'trip', 'trips')} in progress. {formatINR(earned)} earned from{' '}
            {plural(counts.COMPLETED, 'completed trip', 'completed trips')}.
          </p>
        </div>
      </header>

      <div className="trips">
        <section className="sheet" aria-label="Trip list">
          <div className="filters" role="group" aria-label="Filter trips">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
                <span>{counts[f.key]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty">Loading trips...</p>
          ) : visible.length === 0 ? (
            <div className="empty">
              <strong>{bookings.length === 0 ? 'No trips yet' : 'No trips match this filter'}</strong>
              {bookings.length === 0
                ? 'Book the first trip from the panel.'
                : 'Pick another filter to see the rest.'}
            </div>
          ) : (
            <ol className="ledger">
              {visible.map((b) => (
                <li key={b.id} className={`trip trip-${b.status.toLowerCase()}`}>
                  <div className="trip-when">
                    <strong>#{b.id}</strong>
                    <span>{formatWhen(b.bookedAt)}</span>
                  </div>
                  <div className="route">
                    <span>{b.pickupLocation}</span>
                    <span>{b.dropLocation}</span>
                  </div>
                  <div className="trip-fare">
                    <span className="fare">{formatINR(b.fare)}</span>
                    <span className="muted">{b.distanceKm} km</span>
                  </div>
                  <div className="trip-people">
                    <span>{b.customer.name}</span>
                    <span className="muted">
                      Driver {b.driver.name}, {b.driver.vehicleNumber}
                    </span>
                  </div>
                  <div className="trip-state">
                    <StatusMark status={b.status} />
                    {b.status === 'CONFIRMED' && (
                      <div className="row-actions">
                        <button type="button" className="btn small" onClick={() => act('complete', b.id)}>
                          Complete
                        </button>
                        <ConfirmButton
                          className="btn ghost small"
                          confirmLabel="Cancel it"
                          onConfirm={() => act('cancel', b.id)}
                        >
                          Cancel trip
                        </ConfirmButton>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="sheet panel" aria-label="Book a trip">
          <h2>Book a trip</h2>

          <div className="meter">
            <div className="meter-screen">
              <span className="meter-cur">₹</span>
              <span className="meter-digits">{estimate.toFixed(2)}</span>
            </div>
            <p className="meter-note" aria-live="polite">
              {estimate
                ? `${BASE_FARE} base + ${RATES[form.vehicleType]} per km for ${form.distanceKm} km`
                : 'Enter the distance to see the fare.'}
            </p>
          </div>

          <form onSubmit={submit} noValidate>
            <Field label="Customer" error={errors.customerId}>
              <select
                className="input"
                value={form.customerId}
                onChange={set('customerId')}
                required
                aria-invalid={Boolean(errors.customerId)}
              >
                <option value="">{customers.length ? 'Choose a customer' : 'No customers yet'}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Pickup" error={errors.pickupLocation}>
              <input
                className="input"
                value={form.pickupLocation}
                onChange={set('pickupLocation')}
                placeholder="T Nagar bus terminus"
                aria-invalid={Boolean(errors.pickupLocation)}
              />
            </Field>

            <Field label="Drop" error={errors.dropLocation}>
              <input
                className="input"
                value={form.dropLocation}
                onChange={set('dropLocation')}
                placeholder="Chennai airport"
                aria-invalid={Boolean(errors.dropLocation)}
              />
            </Field>

            <Field label="Distance in km" error={errors.distanceKm}>
              <input
                className="input"
                type="number"
                min="0.1"
                step="0.1"
                inputMode="decimal"
                value={form.distanceKm}
                onChange={set('distanceKm')}
                placeholder="14.5"
                aria-invalid={Boolean(errors.distanceKm)}
              />
            </Field>

            <fieldset className="vehicles">
              <legend>Vehicle</legend>
              <div className="vehicle-row">
                {Object.keys(RATES).map((type) => (
                  <label
                    key={type}
                    className={`vehicle ${form.vehicleType === type ? 'on' : ''} ${freeByType[type] ? '' : 'none'}`}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value={type}
                      checked={form.vehicleType === type}
                      onChange={set('vehicleType')}
                    />
                    <span className="vehicle-name">{VEHICLE_LABELS[type]}</span>
                    <span className="vehicle-meta">
                      ₹{RATES[type]}/km, {freeByType[type]} free
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="btn" disabled={busy || !customers.length}>
              {busy ? 'Booking...' : 'Book trip'}
            </button>
            {!customers.length && !loading && (
              <p className="field-hint">
                Add a customer on the <a href="#/customers">Customers page</a> first.
              </p>
            )}
          </form>
        </aside>
      </div>
    </>
  );
}
