import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [c, d, b] = await Promise.all([api.customers.list(), api.drivers.list(), api.bookings.list()]);
      setCustomers(c);
      setDrivers(d);
      setBookings(b);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ customers, drivers, bookings, loading, error, refresh }),
    [customers, drivers, bookings, loading, error, refresh]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
