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

function isoLocal(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function weekendRange(today: Date) {
  const day = today.getDay()
  const saturday = new Date(today)
  saturday.setHours(12, 0, 0, 0)

  if (day === 0) saturday.setDate(today.getDate() - 1)
  else if (day !== 6) saturday.setDate(today.getDate() + ((6 - day + 7) % 7))

  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)

  return { start: isoLocal(saturday), end: isoLocal(sunday) }
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
  const todayIso = isoLocal(today)
  const weekend = weekendRange(today)
  const byDate = (a: Market, b: Market) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)

  return markets
    .filter((market) => {
      const searchable = normalize([market.name, market.city, market.postalCode, market.venue, ...market.categories].join(' '))
      if (q && !searchable.includes(q)) return false
      if (dateFilter === 'today' && market.date !== todayIso) return false
      if (dateFilter === 'weekend' && (market.date < weekend.start || market.date > weekend.end)) return false
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
