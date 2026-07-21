import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase-client'
import { getAnonymousTabId } from '../lib/reading-session'
import {
  LIVE_VISITORS_CHANNEL,
  isTrackableLivePath,
  normalizeLiveLocation,
  normalizePresenceState,
} from '../lib/live-visitors'

const GEO_CACHE_KEY = 'btd_live_geo_v1'

async function loadCoarseLocation(signal) {
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY)
    if (cached) return normalizeLiveLocation(JSON.parse(cached))
    const response = await fetch('/api/live-location', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(`geo_${response.status}`)
    const raw = await response.json()
    const location = normalizeLiveLocation(raw)
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(location))
    return location
  } catch {
    return { country: 'unknown', latitude: null, longitude: null }
  }
}

export function useLiveVisitors(page, lang) {
  const [visitors, setVisitors] = useState([])
  const [status, setStatus] = useState('connecting')
  const channelRef = useRef(null)
  const connectedRef = useRef(false)
  const joinedAtRef = useRef(new Date().toISOString())
  const locationRef = useRef({ country: 'unknown', latitude: null, longitude: null })
  const currentRef = useRef({ page, lang })

  const publishRef = useRef(() => {})
  publishRef.current = async () => {
    const channel = channelRef.current
    if (!channel || !connectedRef.current) return
    const path = window.location.pathname
    if (document.hidden || !isTrackableLivePath(path)) {
      await channel.untrack()
      return
    }
    await channel.track({
      path,
      lang: currentRef.current.lang === 'en' ? 'en' : 'vi',
      country: locationRef.current.country,
      latitude: locationRef.current.latitude,
      longitude: locationRef.current.longitude,
      joined_at: joinedAtRef.current,
      updated_at: new Date().toISOString(),
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    let disposed = false

    async function connect() {
      const timeout = window.setTimeout(() => controller.abort(), 1500)
      locationRef.current = await loadCoarseLocation(controller.signal)
      window.clearTimeout(timeout)
      if (disposed) return
      const channel = supabase.channel(LIVE_VISITORS_CHANNEL, {
        config: { presence: { key: getAnonymousTabId() } },
      })
      channelRef.current = channel
      channel
        .on('presence', { event: 'sync' }, () => {
          if (!disposed) setVisitors(normalizePresenceState(channel.presenceState()))
        })
        .subscribe(async nextStatus => {
          if (disposed) return
          if (nextStatus === 'SUBSCRIBED') {
            connectedRef.current = true
            setStatus('connected')
            await publishRef.current()
          } else if (nextStatus === 'CHANNEL_ERROR' || nextStatus === 'TIMED_OUT') {
            connectedRef.current = false
            setVisitors([])
            setStatus('reconnecting')
          } else if (nextStatus === 'CLOSED') {
            connectedRef.current = false
            setVisitors([])
            setStatus('offline')
          }
        })
    }

    const onVisibility = () => publishRef.current()
    document.addEventListener('visibilitychange', onVisibility)
    connect()
    return () => {
      disposed = true
      controller.abort()
      document.removeEventListener('visibilitychange', onVisibility)
      const channel = channelRef.current
      channelRef.current = null
      connectedRef.current = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    currentRef.current = { page, lang }
    publishRef.current()
  }, [page, lang])

  return { visitors, status }
}
