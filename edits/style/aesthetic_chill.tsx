// AESTHETIC CHILL - lo-fi chill vibes
// film grain, color grading, soft effects
// for those 3am study session vibes

import React, { useMemo } from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

interface AestheticChillProps {
  startFrame?: number
  endFrame?: number
  effectType?: 'grain' | 'glow' | 'vintage' | 'blur' | 'dreamy'
  intensity?: number
  color?: string
  grainSize?: number
  glowRadius?: number
  variant?: string
}

export const AestheticChill: React.FC<AestheticChillProps> = ({
  startFrame = 0,
  endFrame = 120,
  effectType = 'grain',
  intensity = 1,
  color = '#ff9f43',
  grainSize = 0.5,
  glowRadius = 30,
  variant,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = frame - startFrame
  const duration = endFrame - startFrame

  if (localFrame < 0 || localFrame > duration) return null

  const effect = variant || effectType

  // smooth fade in/out
  const fadeOpacity = interpolate(
    localFrame,
    [0, 40, duration - 40, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  )

  // grain noise seed changes slower for that lo-fi look
  const grainSeed = Math.floor(localFrame / 3)

  // soft glow pulsing - very subtle
  const glowPulse = 0.5 + Math.sin(localFrame * 0.03) * 0.15
  const glowOpacity = effect === 'glow' || effect === 'dreamy'
    ? glowPulse * intensity * fadeOpacity
    : 0

  // vintage color overlay
  const vintageOpacity = effect === 'vintage'
    ? 0.2 * intensity * fadeOpacity
    : 0

  // dreamy soft focus
  const dreamyBlur = effect === 'dreamy'
    ? 2 * intensity
    : 0

  // generate grain pattern - memoized to prevent recalc
  const grainUrl = useMemo(() => {
    return `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${grainSize}' numOctaves='4' stitchTiles='stitch' seed='${grainSeed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
  }, [grainSeed, grainSize])

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* dreamy blur wrapper */}
      {dreamyBlur > 0 && (
        <AbsoluteFill
          style={{
            backdropFilter: `blur(${dreamyBlur}px)`,
            opacity: 0.3 * fadeOpacity,
          }}
        />
      )}

      {/* film grain overlay */}
      {(effect === 'grain' || effect === 'vintage') && (
        <AbsoluteFill
          style={{
            backgroundImage: grainUrl,
            opacity: 0.08 * intensity * fadeOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* soft glow / light leak */}
      {(effect === 'glow' || effect === 'dreamy') && glowOpacity > 0 && (
        <>
          {/* top-left warm glow */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse at 20% 20%, ${color}60 0%, transparent ${glowRadius}%)`,
              opacity: glowOpacity,
            }}
          />
          {/* bottom-right subtle glow */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse at 80% 80%, ${color}40 0%, transparent ${glowRadius * 0.7}%)`,
              opacity: glowOpacity * 0.6,
            }}
          />
        </>
      )}

      {/* vintage color grading */}
      {effect === 'vintage' && vintageOpacity > 0 && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${color}30 0%, transparent 30%, transparent 70%, #00000020 100%)`,
            opacity: vintageOpacity,
          }}
        />
      )}

      {/* blur edges for dreamy/blur effect */}
      {(effect === 'blur' || effect === 'dreamy') && fadeOpacity > 0 && (
        <AbsoluteFill
          style={{
            boxShadow: `inset 0 0 ${80 * intensity}px ${40 * intensity}px rgba(0,0,0,0.2)`,
            opacity: fadeOpacity,
          }}
        />
      )}

      {/* subtle vignette for all effects */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)',
          opacity: 0.4 * fadeOpacity,
        }}
      />
    </AbsoluteFill>
  )
}
