// EDIT RENDERER - renders the video with effects
// NO NODE.JS IMPORTS - this runs in browser/Remotion context!
// USES OFFTHREADVIDEO - bypasses Chrome's file:// URL restrictions!
// OffthreadVideo uses FFmpeg directly instead of Chrome's video player

import React, { useMemo } from 'react'
import { AbsoluteFill, Sequence, useVideoConfig, OffthreadVideo, Audio, Img, useCurrentFrame, interpolate, spring } from 'remotion'
import { EditInstance, Scene, EditManifest } from '../types/manifest'

// re-export types for backwards compatibility
export type { EditInstance, Scene, EditManifest }

// FOR OFFTHREADVIDEO - return RAW PATHS, not file:// URLs!
// OffthreadVideo uses FFmpeg which reads filesystem directly
// The proxy server REJECTS file:// URLs - only accepts http/https or raw paths
const toBrowserSrc = (p: string | undefined | null): string => {
  if (!p) return ''
  
  // already a web URL - leave it alone
  if (/^(https?|blob|data):\/\//i.test(p)) return p
  
  // strip file:// protocol if present - FFmpeg wants raw path
  if (/^file:\/\//i.test(p)) {
    return decodeURI(p.replace(/^file:\/\//i, ''))
  }
  
  // Windows path - normalize slashes but keep raw
  if (/^[a-zA-Z]:\\/.test(p)) {
    return p.replace(/\\/g, '/')
  }
  
  // Linux/Mac absolute path - return as-is, FFmpeg can read it
  return p
}

// ============================================
// BUILT-IN EDIT COMPONENTS
// These are all the effects we can apply
// ============================================

// ZOOM PULSE - quick zoom in/out
const ZoomPulse: React.FC<{ intensity?: number; durationInFrames: number }> = ({ intensity = 1.15, durationInFrames }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ fps, frame, config: { damping: 12 }, durationInFrames })
  const zoom = interpolate(scale, [0, 0.5, 1], [1, intensity, 1])
  return <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }} />
}

// TEXT REVEAL - pop in text
const TextReveal: React.FC<{ text?: string; fontSize?: number; color?: string; durationInFrames: number }> = ({ 
  text = '', fontSize = 64, color = 'white', durationInFrames 
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ fps, frame, config: { damping: 10 }, durationInFrames: Math.min(15, durationInFrames) })
  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        fontSize, fontWeight: 'bold', color,
        textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
        transform: `scale(${scale})`, opacity: scale
      }}>
        {text}
      </div>
    </AbsoluteFill>
  )
}

// SHAKE - camera shake effect
const Shake: React.FC<{ intensity?: number; durationInFrames: number }> = ({ intensity = 10, durationInFrames }) => {
  const frame = useCurrentFrame()
  const decay = interpolate(frame, [0, durationInFrames], [1, 0], { extrapolateRight: 'clamp' })
  // deterministic pseudo-random based on frame for consistent renders
  const x = Math.sin(frame * 12.9898) * intensity * decay
  const y = Math.cos(frame * 78.233) * intensity * decay
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)` }} />
}

// FLASH - white flash
const Flash: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, durationInFrames / 2, durationInFrames], [0, 1, 0], { extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ backgroundColor: 'white', opacity }} />
}

// VIGNETTE - dark edges
const Vignette: React.FC<{ opacity?: number; durationInFrames: number }> = ({ opacity = 0.6, durationInFrames }) => {
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${opacity}) 100%)`
    }} />
  )
}

// COLOR GRADE - apply color filter
const ColorGrade: React.FC<{ preset?: string; durationInFrames: number }> = ({ preset = 'cinematic', durationInFrames }) => {
  const filters: Record<string, string> = {
    cinematic: 'contrast(110%) saturate(90%)',
    warm: 'sepia(20%) saturate(110%)',
    cold: 'saturate(90%) hue-rotate(10deg)',
    dramatic: 'contrast(120%) saturate(80%)',
    vintage: 'sepia(30%) contrast(105%)',
  }
  return <AbsoluteFill style={{ filter: filters[preset] || filters.cinematic, pointerEvents: 'none' }} />
}

// KEN BURNS - slow pan/zoom
const KenBurns: React.FC<{ direction?: string; durationInFrames: number }> = ({ direction = 'in', durationInFrames }) => {
  const frame = useCurrentFrame()
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' })
  const scale = direction === 'in' 
    ? interpolate(progress, [0, 1], [1, 1.15])
    : interpolate(progress, [0, 1], [1.15, 1])
  return <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: 'center' }} />
}

// LETTERBOX - cinematic bars
const Letterbox: React.FC<{ size?: number; durationInFrames: number }> = ({ size = 80, durationInFrames }) => {
  const frame = useCurrentFrame()
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: size, background: '#000', opacity: fadeIn }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: size, background: '#000', opacity: fadeIn }} />
    </>
  )
}

// GLITCH - digital glitch effect
const Glitch: React.FC<{ intensity?: number; durationInFrames: number }> = ({ intensity = 5, durationInFrames }) => {
  const frame = useCurrentFrame()
  const offsetX = Math.sin(frame * 123.456) * intensity
  const offsetY = Math.cos(frame * 789.012) * intensity * 0.5
  const hue = (frame * 10) % 360
  return (
    <AbsoluteFill style={{
      transform: `translate(${offsetX}px, ${offsetY}px)`,
      filter: `hue-rotate(${hue}deg)`,
      mixBlendMode: 'difference',
      opacity: 0.3
    }} />
  )
}

// MAP OF EDIT TYPES TO COMPONENTS
const EDIT_COMPONENTS: Record<string, React.FC<any>> = {
  zoom_pulse: ZoomPulse,
  zoom_rapid: ZoomPulse,
  zoom_slow: KenBurns,
  text_reveal: TextReveal,
  text_pop: TextReveal,
  subtitle: TextReveal,
  shake: Shake,
  shake_intense: Shake,
  flash: Flash,
  flash_transition: Flash,
  vignette: Vignette,
  color_grade: ColorGrade,
  ken_burns: KenBurns,
  letterbox: Letterbox,
  glitch: Glitch,
  glitch_heavy: Glitch,
  // style-specific edits map to base components
  lemmino_cinematic: KenBurns,
  mrbeast_energy: ZoomPulse,
  tiktok_rapid: ZoomPulse,
  documentary_broll: KenBurns,
  tutorial_highlight: ZoomPulse,
  vox_animated: TextReveal,
  truecrime_dramatic: Vignette,
  gaming_montage: Shake,
  podcast_minimal: Vignette,
  aesthetic_chill: ColorGrade,
}

// SUBTITLE OVERLAY
const SubtitleOverlay: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 60 }}>
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        padding: '12px 24px',
        borderRadius: 8,
        maxWidth: '80%'
      }}>
        <p style={{ color: 'white', fontSize: 28, margin: 0, textAlign: 'center' }}>{text}</p>
      </div>
    </AbsoluteFill>
  )
}

// RENDER A SINGLE EDIT
const EditRenderer: React.FC<{ edit: EditInstance; fps: number; sceneStart: number }> = ({ edit, fps, sceneStart }) => {
  const editStart = Math.round(edit.at * fps) - sceneStart
  const editDuration = Math.round(edit.duration * fps)
  
  if (editStart < 0 || editDuration <= 0) return null
  
  // Get the component for this edit type
  const Component = EDIT_COMPONENTS[edit.editId]
  if (!Component) {
    console.warn(`[renderer] Unknown edit type: ${edit.editId}`)
    return null
  }
  
  return (
    <Sequence from={Math.max(0, editStart)} durationInFrames={Math.max(1, editDuration)}>
      <Component {...(edit.props || {})} durationInFrames={editDuration} />
    </Sequence>
  )
}

// RENDER A SCENE
const SceneRenderer: React.FC<{ scene: Scene; fps: number; sceneStart: number }> = ({ scene, fps, sceneStart }) => {
  const edits = scene.edits || []
  
  // Group by layer
  const layers = useMemo(() => {
    const grouped: Record<number, EditInstance[]> = {}
    for (const edit of edits) {
      const layer = edit.layer ?? 0
      if (!grouped[layer]) grouped[layer] = []
      grouped[layer].push(edit)
    }
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b))
  }, [edits])
  
  return (
    <>
      {layers.map(([layerNum, layerEdits]) => (
        <AbsoluteFill key={layerNum} style={{ zIndex: Number(layerNum) }}>
          {layerEdits.map((edit, i) => (
            <EditRenderer key={`${edit.editId}-${i}`} edit={edit} fps={fps} sceneStart={sceneStart} />
          ))}
        </AbsoluteFill>
      ))}
      {scene.text && <SubtitleOverlay text={scene.text} />}
    </>
  )
}

// MAIN VIDEO COMPONENT
interface MainVideoProps {
  manifest: EditManifest
}

export const MainVideo: React.FC<MainVideoProps> = ({ manifest }) => {
  const { fps } = useVideoConfig()
  const scenes = manifest.scenes || []
  const videoSrc = toBrowserSrc(manifest.sourceVideo)
  
  console.log('[MainVideo] rendering:', { mode: manifest.mode, duration: manifest.duration, scenes: scenes.length })
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Source video - using OffthreadVideo which uses FFmpeg directly */}
      {/* Chrome can't handle file:// URLs properly, but FFmpeg can read any file */}
      {videoSrc ? (
        <AbsoluteFill>
          <OffthreadVideo
            src={videoSrc}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            delayRenderTimeoutInMilliseconds={300000}
            delayRenderRetries={2}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <p style={{ color: '#666', fontSize: 24 }}>Audio-only mode</p>
        </AbsoluteFill>
      )}
      
      {/* Render scenes */}
      {scenes.length > 0 ? (
        scenes.map((scene, i) => {
          const sceneStart = Math.round(scene.start * fps)
          const sceneDuration = Math.round((scene.end - scene.start) * fps)
          if (sceneDuration <= 0) return null
          
          return (
            <Sequence key={i} from={sceneStart} durationInFrames={Math.max(1, sceneDuration)}>
              <SceneRenderer scene={scene} fps={fps} sceneStart={sceneStart} />
            </Sequence>
          )
        })
      ) : (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'white', fontSize: 32 }}>{manifest.mode?.toUpperCase() || 'VIDEO'} MODE</p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
