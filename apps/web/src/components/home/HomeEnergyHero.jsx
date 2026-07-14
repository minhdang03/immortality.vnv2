import { useEffect, useState } from 'react'

const ASSET_ROOT = '/landing/energy-hero'

const ASSETS = {
  desktop: {
    mp4: `${ASSET_ROOT}/energy-awakening-desktop.mp4`,
    webm: `${ASSET_ROOT}/energy-awakening-desktop.webm`,
    poster: `${ASSET_ROOT}/energy-awakening-desktop-poster.webp`,
    end: `${ASSET_ROOT}/energy-awakening-desktop-end.webp`,
    width: 1280,
    height: 720,
  },
  tablet: {
    mp4: `${ASSET_ROOT}/energy-awakening-tablet.mp4`,
    webm: `${ASSET_ROOT}/energy-awakening-tablet.webm`,
    poster: `${ASSET_ROOT}/energy-awakening-tablet-poster.webp`,
    end: `${ASSET_ROOT}/energy-awakening-tablet-end.webp`,
    width: 544,
    height: 544,
  },
  mobile: {
    mp4: `${ASSET_ROOT}/energy-awakening-mobile.mp4`,
    webm: `${ASSET_ROOT}/energy-awakening-mobile.webm`,
    poster: `${ASSET_ROOT}/energy-awakening-mobile-poster.webp`,
    end: `${ASSET_ROOT}/energy-awakening-mobile-end.webp`,
    width: 720,
    height: 1280,
  },
}

function currentVariant() {
  if (typeof window === 'undefined') return 'desktop'
  if (window.innerWidth <= 600) return 'mobile'
  if (window.innerWidth <= 1100 && window.innerWidth / window.innerHeight < 1.25) return 'tablet'
  return 'desktop'
}

function useHeroMedia() {
  const [variant, setVariant] = useState(currentVariant)
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 600px)')
    const tablet = window.matchMedia('(max-width: 1100px)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncVariant = () => setVariant(currentVariant())
    const syncMotion = () => setReduced(motion.matches)

    mobile.addEventListener('change', syncVariant)
    tablet.addEventListener('change', syncVariant)
    motion.addEventListener('change', syncMotion)
    window.addEventListener('resize', syncVariant, { passive: true })
    return () => {
      mobile.removeEventListener('change', syncVariant)
      tablet.removeEventListener('change', syncVariant)
      motion.removeEventListener('change', syncMotion)
      window.removeEventListener('resize', syncVariant)
    }
  }, [])

  return { asset: ASSETS[variant], reduced, variant }
}

export default function HomeEnergyHero({
  eyebrow,
  title,
  subtitle,
  showTitle,
  showSubtitle,
  primaryLabel,
  secondaryLabel,
  showPrimary,
  showSecondary,
  onPrimary,
  onSecondary,
}) {
  const { asset, reduced, variant } = useHeroMedia()
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => setVideoFailed(false), [variant, reduced])

  return (
    <section
      className={`hero-cinematic home-energy home-energy-${variant}${reduced ? ' is-reduced' : ' is-motion'}`}
      aria-label={showTitle ? undefined : eyebrow}
      aria-labelledby={showTitle ? 'home-energy-title' : undefined}
    >
      <div className="home-energy-media" aria-hidden="true">
        <img
          className="home-energy-poster"
          src={reduced ? asset.end : asset.poster}
          alt=""
          width={asset.width}
          height={asset.height}
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        {!reduced && !videoFailed && (
          <video
            key={variant}
            className="home-energy-video"
            autoPlay
            muted
            playsInline
            preload="auto"
            poster={asset.poster}
            onError={() => setVideoFailed(true)}
          >
            <source src={asset.webm} type="video/webm" />
            <source src={asset.mp4} type="video/mp4" />
          </video>
        )}
        <div className="home-energy-scrim" />
      </div>

      <div className="hero-cinematic-inner">
        <div className="hero-eyebrow">{eyebrow}</div>
        {showTitle && <h1 id="home-energy-title">{title}</h1>}
        {showSubtitle && <p className="hero-deck">{subtitle}</p>}
        {(showPrimary || showSecondary) && (
          <div className="hero-cta">
            {showPrimary && (
              <button className="btn btn-primary" onClick={onPrimary}>{primaryLabel} →</button>
            )}
            {showSecondary && (
              <button className="btn btn-ghost-light" onClick={onSecondary}>{secondaryLabel}</button>
            )}
          </div>
        )}
      </div>
      <div className="hero-scroll-hint" aria-hidden="true"><span /></div>
    </section>
  )
}
