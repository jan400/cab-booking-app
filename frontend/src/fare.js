// Mirrors the backend fare rule: base fare + rate per km.
export const BASE_FARE = 50;
export const RATES = { HATCHBACK: 12, SEDAN: 15, SUV: 20 };
export const VEHICLE_LABELS = { HATCHBACK: 'Hatchback', SEDAN: 'Sedan', SUV: 'SUV' };

export function estimateFare(type, km) {
  const distance = Number(km);
  if (!distance || distance <= 0) return 0;
  return Math.round((BASE_FARE + RATES[type] * distance) * 100) / 100;
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
export const formatINR = (n) => inr.format(n || 0);

const when = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
export function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : when.format(d);
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
