/**
 * Tiny formatting helpers used across components.
 * Keeping them pure makes them trivial to test.
 */

export const formatEuro = (value: number): string =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value);

export const formatMinutes = (value: number): string => `${Math.round(value)} min`;

export const formatRating = (value: number): string => value.toFixed(1);

/**
 * Compute the cheapest "all-in" price for a dish across its platform listings.
 * Returns undefined if there are no available listings.
 */
export const cheapestTotal = (
  listings: Array<{ price: number; deliveryFee: number; available: boolean }>,
): number | undefined => {
  const available = listings.filter((l) => l.available);
  if (available.length === 0) return undefined;
  return Math.min(...available.map((l) => l.price + l.deliveryFee));
};
