import { describe, expect, it } from 'vitest'
import { filterMarkets, distanceKm, normalize } from './logic'
import { buildDemoMarkets } from './markets'

const today = new Date('2026-09-11T12:00:00')
const markets = buildDemoMarkets(today)

describe('market filtering', () => {
  it('finds by city and postal code', () => {
    expect(filterMarkets({ markets, query: 'Stuttgart', dateFilter: 'all', favoritesOnly: false, favorites: new Set(), location: null, radius: null, today })).toHaveLength(1)
    expect(filterMarkets({ markets, query: '73728', dateFilter: 'all', favoritesOnly: false, favorites: new Set(), location: null, radius: null, today })[0]?.city).toBe('Esslingen am Neckar')
  })

  it('matches accents and categories robustly', () => {
    expect(normalize('Tübingen')).toBe('tubingen')
    expect(filterMarkets({ markets, query: 'Bücher', dateFilter: 'all', favoritesOnly: false, favorites: new Set(), location: null, radius: null, today })[0]?.city).toBe('Esslingen am Neckar')
  })

  it('limits to favorites', () => {
    const result = filterMarkets({ markets, query: '', dateFilter: 'all', favoritesOnly: true, favorites: new Set(['stuttgart-karlsplatz']), location: null, radius: null, today })
    expect(result.map((market) => market.id)).toEqual(['stuttgart-karlsplatz'])
  })

  it('calculates plausible distances', () => {
    const km = distanceKm({ latitude: 48.7758, longitude: 9.1829 }, { latitude: 48.7407, longitude: 9.3073 })
    expect(km).toBeGreaterThan(8)
    expect(km).toBeLessThan(12)
  })
})
