import type { Market } from './types'

const iso = (date: Date) => date.toISOString().slice(0, 10)

function nextWeekday(from: Date, weekday: number, extraWeeks = 0) {
  const date = new Date(from)
  const delta = (weekday - date.getDay() + 7) % 7 || 7
  date.setDate(date.getDate() + delta + extraWeeks * 7)
  return date
}

const verifiedMarkets: Market[] = [
  {
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
    categories: ['Vintage', 'Kinder', 'Altstadtfest'],
    note: 'Offizieller Flohmarkt und Kinderflohmarkt im Rahmen des Radolfzeller Altstadtfests.',
    demo: false,
    source: {
      label: 'Radolfzell Tourismus & Stadtmarketing',
      url: 'https://www.radolfzell-tourismus.de/de/entdecken-erleben/veranstaltungen/altstadtfest/flohmaerkte',
      verifiedAt: '2026-09-11',
    },
  },
  {
    id: 'konstanz-georg-elser-platz-2026',
    name: 'Flohmarkt am Georg-Elser-Platz',
    city: 'Konstanz',
    postalCode: '78467',
    venue: 'Georg-Elser-Platz',
    latitude: 47.670258,
    longitude: 9.177904,
    date: '2026-09-19',
    startTime: '14:00',
    endTime: '18:00',
    categories: ['Nachbarschaft', 'Secondhand', 'Musik'],
    note: 'Jährlicher Nachbarschaftsflohmarkt mit musikalischer Begleitung und Bewirtung.',
    demo: false,
    source: {
      label: 'Stadt Konstanz',
      url: 'https://www.konstanz.de/site/Konstanz-Karriere/node/789556/flohmarkt_auf_dem_georg-elser-platz_2026.html',
      verifiedAt: '2026-09-11',
    },
  },
]

export function buildVerifiedMarkets(today = new Date()): Market[] {
  const todayIso = iso(today)
  return verifiedMarkets.filter((market) => market.date >= todayIso)
}

export function buildDemoMarkets(today = new Date()): Market[] {
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const saturday = nextWeekday(today, 6)
  const sunday = nextWeekday(today, 0)
  const nextSaturday = nextWeekday(today, 6, 1)
  const nextSunday = nextWeekday(today, 0, 1)

  return [
    {
      id: 'stuttgart-karlsplatz',
      name: 'Altstadt-Flohmarkt',
      city: 'Stuttgart',
      postalCode: '70173',
      venue: 'Karlsplatz',
      latitude: 48.7769,
      longitude: 9.1793,
      date: iso(saturday),
      startTime: '08:00',
      endTime: '16:00',
      categories: ['Vintage', 'Haushalt', 'Sammler'],
      note: 'Großer Innenstadt-Markt mit gemischtem Sortiment.',
      demo: true,
    },
    {
      id: 'esslingen-neckar',
      name: 'Neckar-Schatzmarkt',
      city: 'Esslingen am Neckar',
      postalCode: '73728',
      venue: 'Maille-Park',
      latitude: 48.7407,
      longitude: 9.3073,
      date: iso(sunday),
      startTime: '09:00',
      endTime: '15:00',
      categories: ['Familie', 'Bücher', 'Secondhand'],
      note: 'Entspannter Sonntagsmarkt nahe der Altstadt.',
      demo: true,
    },
    {
      id: 'ludwigsburg-arsenal',
      name: 'Kisten & Kostbarkeiten',
      city: 'Ludwigsburg',
      postalCode: '71638',
      venue: 'Arsenalplatz',
      latitude: 48.8957,
      longitude: 9.1912,
      date: iso(tomorrow),
      startTime: '10:00',
      endTime: '17:00',
      categories: ['Design', 'Kleidung', 'Vinyl'],
      note: 'Kompakter Markt mit Fokus auf schöne Einzelstücke.',
      demo: true,
    },
    {
      id: 'tuebingen-franzviertel',
      name: 'Franzviertel-Flohmarkt',
      city: 'Tübingen',
      postalCode: '72072',
      venue: 'Französisches Viertel',
      latitude: 48.5096,
      longitude: 9.0678,
      date: iso(nextSaturday),
      startTime: '09:00',
      endTime: '14:00',
      categories: ['Nachbarschaft', 'Kinder', 'Haushalt'],
      note: 'Nachbarschaftsmarkt mit kurzen Wegen und vielen Privatständen.',
      demo: true,
    },
    {
      id: 'reutlingen-markt',
      name: 'Reutlinger Fundgrube',
      city: 'Reutlingen',
      postalCode: '72764',
      venue: 'Bürgerpark',
      latitude: 48.4914,
      longitude: 9.2107,
      date: iso(nextSunday),
      startTime: '08:30',
      endTime: '14:30',
      categories: ['Antik', 'Werkzeug', 'Kleidung'],
      note: 'Breites Sortiment von praktisch bis nostalgisch.',
      demo: true,
    },
  ]
}

export function buildMarkets(today = new Date()): Market[] {
  return [...buildVerifiedMarkets(today), ...buildDemoMarkets(today)]
}
