export type Market = {
  id: string
  name: string
  city: string
  postalCode: string
  venue: string
  latitude: number
  longitude: number
  date: string
  startTime: string
  endTime: string
  categories: string[]
  note: string
  demo: true
}

export type DateFilter = 'all' | 'today' | 'weekend'

export type Coordinates = {
  latitude: number
  longitude: number
}
