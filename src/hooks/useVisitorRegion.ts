import { useEffect, useState } from 'react'

const STORAGE_KEY = 'visitor-region-v1'

export interface VisitorRegion {
  /** ISO 3166-1 alpha-2 country code, e.g. "US", "IN". */
  countryCode: string | null
  countryName: string | null
  /** How we got it — nothing to show the visitor, just useful for debugging. */
  source: 'cache' | 'ip' | 'gps' | null
}

function readCache(): VisitorRegion | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as VisitorRegion) : null
  } catch {
    return null
  }
}

function writeCache(region: VisitorRegion) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(region))
  } catch {
    // Storage can fail (private mode, quota) — not worth surfacing.
  }
}

/**
 * Detects roughly where a visitor is browsing from. Pricing itself always
 * stays in USD regardless of the result — this is purely to let the page
 * personalize copy (e.g. "Serving clients worldwide, based in the US") or
 * feed a recommendation flow, not to change what anyone is charged.
 *
 * Resolution order:
 *  1. Cached result from earlier this session.
 *  2. IP geolocation (approximate, no permission prompt).
 *  3. Browser Geolocation API (exact) — only if the visitor already granted
 *     location permission elsewhere; we never trigger the permission prompt
 *     just for pricing copy.
 */
export function useVisitorRegion(): VisitorRegion {
  const [region, setRegion] = useState<VisitorRegion>(
    () => readCache() ?? { countryCode: null, countryName: null, source: null }
  )

  useEffect(() => {
    if (readCache()) return
    let cancelled = false

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.country_code) return
        const next: VisitorRegion = {
          countryCode: data.country_code,
          countryName: data.country_name ?? null,
          source: 'ip',
        }
        setRegion(next)
        writeCache(next)
      })
      .catch(() => {
        // Best-effort only — quietly keep the default (US) if this fails.
      })
      .finally(() => clearTimeout(timeout))

    // Upgrade to exact coordinates only if permission is already granted —
    // never prompt the visitor just to show pricing copy.
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          if (cancelled || status.state !== 'granted' || !('geolocation' in navigator)) return
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords
              fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              )
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                  if (cancelled || !data?.countryCode) return
                  const next: VisitorRegion = {
                    countryCode: data.countryCode,
                    countryName: data.countryName ?? null,
                    source: 'gps',
                  }
                  setRegion(next)
                  writeCache(next)
                })
                .catch(() => {})
            },
            () => {
              // Denied, unavailable, or timed out — the IP-based guess above stands.
            },
            { maximumAge: 5 * 60 * 1000, timeout: 3000 }
          )
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timeout)
    }
  }, [])

  return region
}
