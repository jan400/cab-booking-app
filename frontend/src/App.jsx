import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store.jsx';
import { ToastProvider } from './toast.jsx';
import Trips from './pages/Trips.jsx';
import Drivers from './pages/Drivers.jsx';
import Customers from './pages/Customers.jsx';

const ROUTES = {
  trips: { label: 'Trips', title: 'Trips', Page: Trips },
  drivers: { label: 'Drivers', title: 'Drivers', Page: Drivers },
  customers: { label: 'Customers', title: 'Customers', Page: Customers },
};

function currentRoute() {
  const key = window.location.hash.replace(/^#\/?/, '');
  return ROUTES[key] ? key : 'trips';
}

function useRoute() {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

function Fleet() {
  const { drivers } = useStore();
  const count = (s) => drivers.filter((d) => d.status === s).length;
  return (
    <section className="fleet" aria-label="Fleet right now">
      <h2>Fleet right now</h2>
      <ul>
        <li><span className="dot free" />{count('AVAILABLE')} free</li>
        <li><span className="dot trip" />{count('BUSY')} on a trip</li>
        <li><span className="dot off" />{count('OFFLINE')} offline</li>
      </ul>
    </section>
  );
}

function Shell() {
  const route = useRoute();
  const { error, refresh } = useStore();
  const { Page, title } = ROUTES[route];

  useEffect(() => {
    document.title = `${title} | Cab Desk`;
  }, [title]);

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">Cab<br />Desk</div>
        <nav className="nav" aria-label="Main">
          {Object.entries(ROUTES).map(([key, r]) => (
            <a key={key} href={`#/${key}`} aria-current={route === key ? 'page' : undefined}>
              {r.label}
            </a>
          ))}
        </nav>
        <Fleet />
      </aside>

      <main className="main">
        {error && (
          <div className="banner" role="alert">
            <span>{error}</span>
            <button type="button" className="btn small" onClick={refresh}>
              Try again
            </button>
          </div>
        )}
        <Page />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </StoreProvider>
  );
}
