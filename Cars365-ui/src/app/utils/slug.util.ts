export function generateCarSlug(car: any): string {
  return `${car.id}-${car.brand}-${car.model}-${car.year}-${car.fuelType}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
