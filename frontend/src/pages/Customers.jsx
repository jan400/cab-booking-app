import { useState } from 'react';
import { api } from '../api.js';
import { plural } from '../fare.js';
import { useStore } from '../store.jsx';
import { useToast } from '../toast.jsx';
import Field from '../components/Field.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmButton from '../components/ConfirmButton.jsx';

const EMPTY = { name: '', email: '', phone: '' };

function CustomerForm({ customer, onClose }) {
  const { refresh } = useStore();
  const notify = useToast();
  const [form, setForm] = useState(customer ? { ...EMPTY, ...customer } : EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setFormError('');
    setBusy(true);
    const body = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() };
    try {
      if (customer) await api.customers.update(customer.id, body);
      else await api.customers.create(body);
      notify(customer ? 'Customer details saved.' : 'Customer added.');
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
    <Modal title={customer ? 'Edit customer' : 'Add customer'} onClose={onClose}>
      <form className="form-grid" onSubmit={submit} noValidate>
        {formError && <p className="form-error">{formError}</p>}
        <Field label="Full name" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} autoFocus aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" value={form.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field label="Phone" error={errors.phone} hint="10 digits">
          <input className="input" inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving...' : customer ? 'Save changes' : 'Add customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Customers() {
  const { customers, bookings, loading, refresh } = useStore();
  const notify = useToast();
  const [editing, setEditing] = useState(null);

  const tripCount = (id) => bookings.filter((b) => b.customer.id === id).length;

  async function remove(c) {
    try {
      await api.customers.remove(c.id);
      notify(`${c.name} was removed.`);
      await refresh();
    } catch (err) {
      notify(
        err.status === 409 ? `${c.name} has trip history and can't be removed.` : err.message,
        'error'
      );
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Customers</h1>
          <p>{plural(customers.length, 'customer', 'customers')} registered.</p>
        </div>
        <button type="button" className="btn" onClick={() => setEditing('new')}>
          Add customer
        </button>
      </header>

      <section className="sheet" aria-label="Customer list">
        {loading ? (
          <p className="empty">Loading customers...</p>
        ) : customers.length === 0 ? (
          <div className="empty">
            <strong>No customers yet</strong>
            Add a customer to start booking trips.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Trips</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <span className="cell-sub">{c.email}</span>
                    </td>
                    <td>{c.phone}</td>
                    <td>{tripCount(c.id)}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn ghost small" onClick={() => setEditing(c)}>
                          Edit
                        </button>
                        <ConfirmButton
                          className="btn ghost small"
                          confirmLabel="Remove it"
                          onConfirm={() => remove(c)}
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

      {editing && <CustomerForm customer={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
