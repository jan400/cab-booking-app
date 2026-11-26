// Empty base = same origin (Vite proxy in dev, Spring Boot static hosting in production).
// Set VITE_API_URL only if the frontend is hosted somewhere else (backend then needs CORS).
const BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError("Can't reach the server. Start the backend on port 8080, then reload.");
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.errors || {});
  }
  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  customers: {
    list: () => request('/api/customers'),
    create: (body) => request('/api/customers', json('POST', body)),
    update: (id, body) => request(`/api/customers/${id}`, json('PUT', body)),
    remove: (id) => request(`/api/customers/${id}`, { method: 'DELETE' }),
  },
  drivers: {
    list: () => request('/api/drivers'),
    create: (body) => request('/api/drivers', json('POST', body)),
    update: (id, body) => request(`/api/drivers/${id}`, json('PUT', body)),
    setStatus: (id, status) => request(`/api/drivers/${id}/status?status=${status}`, { method: 'PATCH' }),
    remove: (id) => request(`/api/drivers/${id}`, { method: 'DELETE' }),
  },
  bookings: {
    list: () => request('/api/bookings'),
    create: (body) => request('/api/bookings', json('POST', body)),
    complete: (id) => request(`/api/bookings/${id}/complete`, { method: 'PUT' }),
    cancel: (id) => request(`/api/bookings/${id}/cancel`, { method: 'PUT' }),
  },
};
