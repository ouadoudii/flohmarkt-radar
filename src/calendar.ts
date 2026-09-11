import type { Market } from './types'

function escapeIcs(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function compactLocalDateTime(date: string, time: string) {
  return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`
}

export function marketCalendarFilename(market: Market) {
  const slug = market.name
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'flohmarkt'}.ics`
}

export function marketCalendarDataUri(market: Market) {
  const location = `${market.venue}, ${market.postalCode} ${market.city}`
  const description = [market.note, market.source ? `Quelle: ${market.source.url}` : 'Demo-Termin in Fundstück.'].join('\n')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fundstueck//Flohmarkt Radar//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeIcs(market.id)}@fundstueck`,
    `DTSTART:${compactLocalDateTime(market.date, market.startTime)}`,
    `DTEND:${compactLocalDateTime(market.date, market.endTime)}`,
    `SUMMARY:${escapeIcs(market.name)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
