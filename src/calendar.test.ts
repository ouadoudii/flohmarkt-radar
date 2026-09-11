import { describe, expect, it } from 'vitest'
import { marketCalendarDataUri, marketCalendarFilename } from './calendar'
import type { Market } from './types'

const market: Market = {
  id: 'radolfzell-altstadtfest-2026',
  name: 'Flohmarkt beim 48. Radolfzeller Altstadtfest',
  city: 'Radolfzell am Bodensee',
  postalCode: '78315',
  venue: 'Obertorstraße / Fürstenbergstraße',
  latitude: 47.738441,
  longitude: 8.972074,
  date: '2026-09-12',
  startTime: '09:00',
  endTime: '17:00',
  categories: ['Vintage'],
  note: 'Offizieller Flohmarkt.',
  demo: false,
  source: {
    label: 'Radolfzell Tourismus & Stadtmarketing',
    url: 'https://www.radolfzell-tourismus.de/flohmarkt',
    verifiedAt: '2026-09-11',
  },
}

describe('calendar export', () => {
  it('builds a portable ICS event with market time, place and source', () => {
    const uri = marketCalendarDataUri(market)
    const ics = decodeURIComponent(uri.split(',', 2)[1] ?? '')

    expect(uri).toStartWith('data:text/calendar;charset=utf-8,')
    expect(ics).toContain('DTSTART:20260912T090000')
    expect(ics).toContain('DTEND:20260912T170000')
    expect(ics).toContain('SUMMARY:Flohmarkt beim 48. Radolfzeller Altstadtfest')
    expect(ics).toContain('LOCATION:Obertorstraße / Fürstenbergstraße\\, 78315 Radolfzell am Bodensee')
    expect(ics).toContain('Quelle: https://www.radolfzell-tourismus.de/flohmarkt')
  })

  it('uses a safe readable download filename', () => {
    expect(marketCalendarFilename(market)).toBe('flohmarkt-beim-48-radolfzeller-altstadtfest.ics')
  })
})
