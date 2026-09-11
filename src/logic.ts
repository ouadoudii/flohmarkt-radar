import type { Coordinates, DateFilter, Market } from './types'

export function normalize(value: string) {
  return value.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

export function distanceKm(a: Coordinates, b: Coordinates) {
  const radius = 6371
  const radians = (degree: number) => (degree * Math.PI) / 180
  const dLat = radians(b.latitude - a.latitude)
  const dLon = radians(b.longitude - a.longitude)
  const lat1 = radians(a.latitude)
  const lat2 = radians(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * radius * Math.asin(Math.sqrt(h))
}

function isWeekend(date: string) {
  const day = new Date(`${date}T12:00:00`).getDay()
  return day === 0 || day === 6
}

export function filterMarkets({
  markets,
  query,
  dateFilter,
  favoritesOnly,
  favorites,
  location,
  radius,
  today = new Date(),
}: {
  markets: Market[]
  query: string
  dateFilter: DateFilter
  favoritesOnly: boolean
  favorites: Set<string>
  location: Coordinates | null
  radius: number | null
  today?: Date
}) {
  const q = normalize(query)
  const todayIso = today.toISOString().slice(0, 10)
  const byDate = (a: Market, b: Market) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)

  return markets
    .filter((market) => {
      const searchable = normalize([market.name, market.city, market.postalCode, market.venue, ...market.categories].join(' '))
      if (q && !searchable.includes(q)) return false
      if (dateFilter === 'today' && market.date !== todayIso) return false
      if (dateFilter === 'weekend' && !isWeekend(market.date)) return false
      if (favoritesOnly && !favorites.has(market.id)) return false
      if (location && radius !== null) {
        const distance = distanceKm(location, { latitude: market.latitude, longitude: market.longitude })
        if (distance > radius) return false
      }
      return true
    })
    .sort((a, b) => {
      if (!location) return byDate(a, b)
      const distanceA = distanceKm(location, { latitude: a.latitude, longitude: a.longitude })
      const distanceB = distanceKm(location, { latitude: b.latitude, longitude: b.longitude })
      return distanceA - distanceB || byDate(a, b)
    })
}

export function formatMarketDate(date: string) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: 'short' }).format(
    new Date(`${date}T12:00:00`),
  )
}
