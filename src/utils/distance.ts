/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 * @param distance - Distance in miles
 * @returns Formatted string (e.g., "12.5 mi", "< 1 mi")
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return '< 1 mi'
  }
  if (distance < 10) {
    return `${distance.toFixed(1)} mi`
  }
  return `${Math.round(distance)} mi`
}

/**
 * Get the distance category for grouping
 * @param distance - Distance in miles
 * @returns Category string
 */
export function getDistanceCategory(distance: number): string {
  if (distance < 5) return 'Very Close (< 5 mi)'
  if (distance < 15) return 'Nearby (5-15 mi)'
  if (distance < 30) return 'Close (15-30 mi)'
  if (distance < 50) return 'Reachable (30-50 mi)'
  return 'Regional (50+ mi)'
}

