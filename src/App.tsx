import { useMemo, useState } from 'react'
import { marketCalendarDataUri, marketCalendarFilename } from './calendar'
import { buildMarkets } from './markets'
import { distanceKm, filterMarkets, formatMarketDate } from './logic'
import { loadFavorites, saveFavorites } from './storage'
import type { Coordinates, DateFilter, Market } from './types'
import './verification.css'

const markets = buildMarkets()

function routeUrl(market: Market) {
  const destination = encodeURIComponent(`${market.venue}, ${market.postalCode} ${market.city}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
}

function formatVerifiedAt(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function shareText(market: Market) {
  return `${market.name} – ${formatMarketDate(market.date)}, ${market.startTime}–${market.endTime} Uhr · ${market.venue}, ${market.postalCode} ${market.city}`
}

export default function App() {
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [favorites, setFavorites] = useState(() => loadFavorites())
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [radius, setRadius] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState('')
  const [selected, setSelected] = useState<Market | null>(null)
  const [shareStatus, setShareStatus] = useState('')

  const results = useMemo(
    () => filterMarkets({ markets, query, dateFilter, favoritesOnly, favorites, location, radius }),
    [query, dateFilter, favoritesOnly, favorites, location, radius],
  )

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites(next)
      return next
    })
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Standortsuche wird von diesem Browser nicht unterstützt.')
      return
    }
    setLocationStatus('Standort wird ermittelt …')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude })
        setRadius((current) => current ?? 30)
        setLocationStatus('Standort aktiv. Die Entfernung wird jetzt berücksichtigt.')
      },
      () => setLocationStatus('Standort konnte nicht verwendet werden. Suche stattdessen nach Ort oder PLZ.'),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  const shareMarket = async (market: Market) => {
    const text = shareText(market)
    const url = market.source?.url ?? window.location.href
    setShareStatus('')

    if (navigator.share) {
      try {
        await navigator.share({ title: market.name, text, url })
        setShareStatus('Markt geteilt.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setShareStatus('Termin und Link kopiert.')
        return
      } catch {
        // Continue to the user-facing fallback below.
      }
    }

    setShareStatus('Teilen wird von diesem Browser leider nicht unterstützt.')
  }

  const openDetails = (market: Market) => {
    setShareStatus('')
    setSelected(market)
  }

  const closeDetails = () => {
    setShareStatus('')
    setSelected(null)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Fundstück Startseite">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Fundstück</span>
        </a>
        <button
          className={`favorites-filter ${favoritesOnly ? 'active' : ''}`}
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((value) => !value)}
        >
          <span aria-hidden="true">♥</span> Favoriten <span className="count-bubble">{favorites.size}</span>
        </button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">Flohmärkte in deiner Region</span>
            <h1 id="hero-title">Finde deinen nächsten <em>Lieblingsfund.</em></h1>
            <p>Termine in der Nähe entdecken, fürs Wochenende filtern und gute Märkte merken.</p>
          </div>

          <div className="search-panel" role="search">
            <label htmlFor="search-input">Wo möchtest du stöbern?</label>
            <div className="search-row">
              <input
                id="search-input"
                type="search"
                placeholder="Ort, PLZ oder Marktname"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="postal-code"
              />
              <button
                className="primary-button"
                type="button"
                onClick={() => document.querySelector('#results-heading')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Märkte finden
              </button>
            </div>
            <button className="location-button" type="button" onClick={locate}>
              <span aria-hidden="true">⌖</span> In meiner Nähe suchen
            </button>
            <p className="location-status" aria-live="polite">{locationStatus}</p>
          </div>
        </section>

        <div className="demo-note" role="note">
          <strong>Jetzt mit echten Terminen:</strong> Verifizierte Termine sind mit ✓ markiert und führen direkt zur offiziellen Quelle. Beispieldaten bleiben klar als Demo gekennzeichnet.
        </div>

        <section className="discover" aria-labelledby="results-heading">
          <div className="section-head">
            <div>
              <span className="eyebrow">Entdecken</span>
              <h2 id="results-heading">Was ist demnächst los?</h2>
              <p className="result-count" aria-live="polite">{results.length} {results.length === 1 ? 'Markt' : 'Märkte'} gefunden</p>
            </div>
            <div className="filters" aria-label="Marktfilter">
              <div className="chip-group" role="group" aria-label="Zeitraum">
                {(['all', 'today', 'weekend'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`chip ${dateFilter === filter ? 'active' : ''}`}
                    aria-pressed={dateFilter === filter}
                    onClick={() => setDateFilter(filter)}
                  >
                    {filter === 'all' ? 'Alle' : filter === 'today' ? 'Heute' : 'Wochenende'}
                  </button>
                ))}
              </div>
              <label className="radius-filter">Umkreis
                <select
                  aria-label="Umkreis"
                  value={radius ?? ''}
                  onChange={(event) => setRadius(event.target.value ? Number(event.target.value) : null)}
                  disabled={!location}
                >
                  <option value="">egal</option>
                  <option value="10">10 km</option>
                  <option value="30">30 km</option>
                  <option value="50">50 km</option>
                </select>
              </label>
            </div>
          </div>

          {results.length ? (
            <div className="results-grid">
              {results.map((market) => {
                const distance = location ? Math.round(distanceKm(location, { latitude: market.latitude, longitude: market.longitude })) : null
                const favorite = favorites.has(market.id)
                const marketDate = new Date(`${market.date}T12:00:00`)
                return (
                  <article className={`market-card ${market.source ? 'verified-market' : ''}`} key={market.id}>
                    <div className="market-card-top">
                      <div className="date-tile" aria-label={formatMarketDate(market.date)}>
                        <span>{formatMarketDate(market.date).split(' ')[0]}</span>
                        <strong>{marketDate.getDate()}</strong>
                        <small>{new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(marketDate)}</small>
                      </div>
                      <button
                        className={`heart-button ${favorite ? 'active' : ''}`}
                        type="button"
                        aria-label={favorite ? `${market.name} aus Favoriten entfernen` : `${market.name} als Favorit speichern`}
                        aria-pressed={favorite}
                        onClick={() => toggleFavorite(market.id)}
                      >♥</button>
                    </div>
                    <div className="market-card-body">
                      {market.source ? <span className="verified-badge">✓ Verifiziert</span> : <span className="demo-badge">Demo</span>}
                      <h3>{market.name}</h3>
                      <p className="place">{market.venue} · {market.postalCode} {market.city}</p>
                      <p className="time">{market.startTime}–{market.endTime} Uhr{distance !== null ? ` · ca. ${distance} km` : ''}</p>
                      <div className="tags">{market.categories.map((category) => <span key={category}>{category}</span>)}</div>
                    </div>
                    <button className="card-action" type="button" onClick={() => openDetails(market)}>Details ansehen <span aria-hidden="true">→</span></button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">⌕</span>
              <h3>Hier ist gerade nichts dabei.</h3>
              <p>Versuche einen anderen Ort oder setze die Filter zurück.</p>
              <button type="button" onClick={() => { setQuery(''); setDateFilter('all'); setFavoritesOnly(false); setRadius(null) }}>Filter zurücksetzen</button>
            </div>
          )}
        </section>

        <section className="how-it-works" aria-labelledby="how-title">
          <div>
            <span className="eyebrow">Einfach losstöbern</span>
            <h2 id="how-title">Weniger suchen. Mehr finden.</h2>
          </div>
          <ol>
            <li><strong>1</strong><span><b>Region wählen</b>Ort, PLZ oder Standort nutzen.</span></li>
            <li><strong>2</strong><span><b>Termin finden</b>Heute, Wochenende oder später.</span></li>
            <li><strong>3</strong><span><b>Losfahren</b>Favorit speichern und Route öffnen.</span></li>
          </ol>
        </section>
      </main>

      <footer>
        <span>Fundstück · Flohmärkte ohne Suchchaos</span>
        <span>Datenschutzfreundlich: Favoriten bleiben auf deinem Gerät.</span>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeDetails}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Details schließen" onClick={closeDetails}>×</button>
            {selected.source ? <span className="verified-badge">✓ Verifiziert</span> : <span className="demo-badge">Demo-Termin</span>}
            <h2 id="modal-title">{selected.name}</h2>
            <p className="modal-lead">{selected.note}</p>
            <dl>
              <div><dt>Wann</dt><dd>{formatMarketDate(selected.date)}, {selected.startTime}–{selected.endTime} Uhr</dd></div>
              <div><dt>Wo</dt><dd>{selected.venue}, {selected.postalCode} {selected.city}</dd></div>
              <div><dt>Sortiment</dt><dd>{selected.categories.join(', ')}</dd></div>
              {selected.source && (
                <div>
                  <dt>Quelle</dt>
                  <dd><a className="source-link" href={selected.source.url} target="_blank" rel="noreferrer">{selected.source.label}</a></dd>
                </div>
              )}
            </dl>
            <div className="modal-actions">
              <a className="primary-button route-button" href={routeUrl(selected)} target="_blank" rel="noreferrer">Route öffnen</a>
              <a
                className="calendar-button"
                href={marketCalendarDataUri(selected)}
                download={marketCalendarFilename(selected)}
              >
                Zum Kalender
              </a>
              <button className="share-button" type="button" onClick={() => void shareMarket(selected)}>Termin teilen</button>
            </div>
            <p className="share-status" aria-live="polite">{shareStatus}</p>
            {selected.source ? (
              <p className="verification-note">Quelle zuletzt am {formatVerifiedAt(selected.source.verifiedAt)} geprüft. Änderungen durch den Veranstalter sind weiterhin möglich.</p>
            ) : (
              <p className="verification-note">Vor der Anfahrt bitte den Termin beim Veranstalter verifizieren. Diese Daten dienen nur zur Produktdemonstration.</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
