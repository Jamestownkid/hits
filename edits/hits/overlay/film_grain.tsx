// FILM GRAIN - noisy film effect
import { AbsoluteFill, useCurrentFrame } from 'remotion'

export const FilmGrain = ({ intensity = 0.15 }: { intensity?: number }) => {
  const frame = useCurrentFrame()
  const seed = frame * 12345
  
  return (
    <AbsoluteFill style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${seed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      opacity: intensity,
      pointerEvents: 'none',
      mixBlendMode: 'overlay'
    }} />
  )
}

