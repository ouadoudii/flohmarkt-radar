import { describe, expect, it } from 'vitest'
import { filterMarkets, normalize } from './logic'
import { buildMarkets } from './markets'

const today = new Date('2026-09-12T12:00:00')

describe('German search normalization', () => {
  it('treats ß and ss as equivalent', () => {
    expect(normalize('Großherzog-Friedrich-Straße')).toBe('grossherzog-friedrich-strasse')
  })

  it('finds a market by street when the user types ss instead of ß', () => {
    const result = filterMarkets({
      markets: buildMarkets(today),
      query: 'Grossherzog Friedrich Strasse',
      dateFilter: 'all',
      favoritesOnly: false,
      favorites: new Set(),
      location: null,
      radius: null,
      today,
    })

    expect(result.map((market) => market.id)).toEqual(['konstanz-litzelstetten-kinder-basar-2026'])
  })
})
