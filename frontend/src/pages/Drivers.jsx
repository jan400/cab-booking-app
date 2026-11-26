import { useState } from 'react';
import { api } from '../api.js';
import { RATES, VEHICLE_LABELS, plural } from '../fare.js';
import { useStore } from '../store.jsx';
import { useToast } from '../toast.jsx';
import Field from '../components/Field.jsx';
import Modal from '../components/Modal.jsx';
import StatusMark from '../components/StatusMark.jsx';
import ConfirmButton from '../components/ConfirmButton.jsx';

const EMPTY = { name: '', phone: '', licenseNumber: '', vehicleNumber: '', vehicleType: 'SEDAN' };

function DriverForm({ driver, onClose }) {
  const { refresh } = useStore();
  const notify = useToast();
  const [form, setForm] = useState(driver ? { ...EMPTY, ...driver } : EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setFormError('');
    setBusy(true);
    const body = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      licenseNumber: form.licenseNumber.trim(),
      vehicleNumber: form.vehicleNumber.trim(),
      vehicleType: form.vehicleType,
    };
    try {
      if (driver) await api.drivers.update(driver.id, body);
      else await api.drivers.create(body);
      notify(driver ? 'Driver details saved.' : 'Driver added. They are free for trips.');
      await refresh();
      onClose();
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={driver ? 'Edit driver' : 'Add driver'} onClose={onClose}>
      <form className="form-grid" onSubmit={submit} noValidate>
        {formError && <p className="form-error">{formError}</p>}
        <Field label="Full name" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} autoFocus aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Phone" error={errors.phone} hint="10 digits">
          <input className="input" inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} />
        </Field>
        <Field label="Licence number" error={errors.licenseNumber}>
          <input className="input" value={form.licenseNumber} onChange={set('licenseNumber')} aria-invalid={Boolean(errors.licenseNumber)} />
        </Field>
        <Field label="Vehicle number" error={errors.vehicleNumber}>
          <input className="input" value={form.vehicleNumber} onChange={set('vehicleNumber')} placeholder="TN01AB1234" aria-invalid={Boolean(errors.vehicleNumber)} />
        </Field>
        <Field label="Vehicle type" error={errors.vehicleType}>
          <select className="input" value={form.vehicleType} onChange={set('vehicleType')}>
            {Object.keys(RATES).map((t) => (
              <option key={t} value={t}>
                {VEHICLE_LABELS[t]} (₹{RATES[t]}/km)
              </option>
            ))}
          </select>
        </Field>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving...' : driver ? 'Save changes' : 'Add driver'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Drivers() {
  const { drivers, loading, refresh } = useStore();
  const notify = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | driver object

  const free = drivers.filter((d) => d.status === 'AVAILABLE').length;
  const onTrip = drivers.filter((d) => d.status === 'BUSY').length;
  const offline = drivers.filter((d) => d.status === 'OFFLINE').length;

  async function toggle(d) {
    try {
      await api.drivers.setStatus(d.id, d.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE');
      notify(d.status === 'OFFLINE' ? `${d.name} is free for trips.` : `${d.name} is offline.`);
      await refresh();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function remove(d) {
    try {
      await api.drivers.remove(d.id);
      notify(`${d.name} was removed.`);
      await refresh();
    } catch (err) {
      notify(
        err.status === 409
          ? `${d.name} has trip history and can't be removed. Set them offline instead.`
          : err.message,
        'error'
      );
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Drivers</h1>
          <p>
            {plural(drivers.length, 'driver', 'drivers')}: {free} free, {onTrip} on a trip, {offline} offline.
          </p>
        </div>
        <button type="button" className="btn" onClick={() => setEditing('new')}>
          Add driver
        </button>
      </header>

      <section className="sheet" aria-label="Driver list">
        {loading ? (
          <p className="empty">Loading drivers...</p>
        ) : drivers.length === 0 ? (
          <div className="empty">
            <strong>No drivers yet</strong>
            Add a driver so trips can be assigned.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Licence</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.name}</strong>
                      <span className="cell-sub">{d.phone}</span>
                    </td>
                    <td>
                      <strong>{d.vehicleNumber}</strong>
                      <span className="cell-sub">{VEHICLE_LABELS[d.vehicleType]}</span>
                    </td>
                    <td>{d.licenseNumber}</td>
                    <td>
                      <StatusMark status={d.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {d.status !== 'BUSY' && (
                          <button type="button" className="btn ghost small" onClick={() => toggle(d)}>
                            {d.status === 'OFFLINE' ? 'Bring online' : 'Take offline'}
                          </button>
                        )}
                        <button type="button" className="btn ghost small" onClick={() => setEditing(d)}>
                          Edit
                        </button>
                        <ConfirmButton
                          className="btn ghost small"
                          confirmLabel="Remove it"
                          disabled={d.status === 'BUSY'}
                          onConfirm={() => remove(d)}
                        >
                          Remove
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && <DriverForm driver={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
