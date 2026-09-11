import { describe, expect, it } from 'vitest'
import { filterMarkets, distanceKm, normalize } from './logic'
import { buildDemoMarkets, buildMarkets, buildVerifiedMarkets } from './markets'

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

  it('sorts nearby results by distance when location is active', () => {
    const result = filterMarkets({
      markets,
      query: '',
      dateFilter: 'all',
      favoritesOnly: false,
      favorites: new Set(),
      location: { latitude: 48.4914, longitude: 9.2107 },
      radius: 30,
      today,
    })

    expect(result[0]?.id).toBe('reutlingen-markt')
    expect(result[1]?.id).toBe('tuebingen-franzviertel')
  })

  it('calculates plausible distances', () => {
    const km = distanceKm({ latitude: 48.7758, longitude: 9.1829 }, { latitude: 48.7407, longitude: 9.3073 })
    expect(km).toBeGreaterThan(8)
    expect(km).toBeLessThan(12)
  })
})

describe('verified market data', () => {
  it('includes source-backed verified markets while they are upcoming', () => {
    const verified = buildMarkets(today).filter((market) => !market.demo)

    expect(verified.map((market) => market.id)).toEqual([
      'radolfzell-altstadtfest-2026',
      'konstanz-georg-elser-platz-2026',
    ])
    expect(verified.every((market) => market.source?.url.startsWith('https://'))).toBe(true)
    expect(verified.every((market) => market.source?.verifiedAt === '2026-09-11')).toBe(true)
  })

  it('removes verified events after their event date', () => {
    expect(buildVerifiedMarkets(new Date('2026-09-20T12:00:00'))).toHaveLength(0)
  })
})
