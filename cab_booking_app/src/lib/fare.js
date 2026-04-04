export const RATE_PER_KM = 15;
export const BASE_FARE = 50;
export const MIN_FARE = 100;

export function computeFare(distanceKm) {
  const km = Number(distanceKm) || 0;
  const fare = BASE_FARE + km * RATE_PER_KM;
  return Math.max(fare, MIN_FARE);
}