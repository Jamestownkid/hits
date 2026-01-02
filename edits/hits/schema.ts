// EFFECTS SCHEMA - Type-safe configuration for all 100 effects
// Based on professional Remotion patterns with Zod validation

import { z } from 'zod'

// ==================== EFFECT CATEGORIES ====================
export const effectCategories = ['zoom', 'text', 'transition', 'overlay', 'motion', 'color', 'broll', 'audio'] as const
export const EffectCategory = z.enum(effectCategories)
export type EffectCategoryType = z.infer<typeof EffectCategory>

// ==================== VIDEO MODES ====================
export const videoModes = [
  'lemmino', 'mrbeast', 'tiktok', 'documentary', 'tutorial',
  'vox', 'truecrime', 'naturedoc', 'shorts', 'gaming',
  'course', 'cinematic', 'trailer', 'podcast', 'aesthetic', 'vlog'
] as const
export const VideoMode = z.enum(videoModes)
export type VideoModeType = z.infer<typeof VideoMode>

// ==================== CORNER POSITIONS ====================
export const cornerPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const
export const CornerPosition = z.enum(cornerPositions)
export type CornerType = z.infer<typeof CornerPosition>

// ==================== EASING FUNCTIONS ====================
export const easingFunctions = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'spring', 'bounce'] as const
export const EasingFunction = z.enum(easingFunctions)

// ==================== LAYER PRIORITIES ====================
export const layerTypes = ['background', 'video', 'overlay', 'text', 'foreground'] as const
export const LayerType = z.enum(layerTypes)

// ==================== EFFECT TRIGGER CONFIG ====================
export const effectTriggerSchema = z.object({
  keywords: z.array(z.string()).default([]),           // words that trigger this effect
  punctuation: z.array(z.string()).default([]),        // punctuation that triggers (!, ?, ...)
  sentiment: z.enum(['positive', 'negative', 'neutral', 'any']).default('any'),
  weight: z.number().min(0).max(1).default(0.5),       // how likely to be chosen
  maxPerMinute: z.number().default(10),                // rate limiting
  minGapFrames: z.number().default(30),                // minimum frames between uses
})
export type EffectTrigger = z.infer<typeof effectTriggerSchema>

// ==================== EFFECT TIMING CONFIG ====================
export const effectTimingSchema = z.object({
  minDuration: z.number().default(15),                 // minimum frames
  maxDuration: z.number().default(90),                 // maximum frames
  defaultDuration: z.number().default(30),             // default if not specified
  cooldown: z.number().default(60),                    // frames before can be used again
  attackFrames: z.number().default(5),                 // fade in frames
  releaseFrames: z.number().default(5),                // fade out frames
})
export type EffectTiming = z.infer<typeof effectTimingSchema>

// ==================== EFFECT PROP SCHEMAS ====================
// Zoom effects
export const zoomPropsSchema = z.object({
  intensity: z.number().min(1).max(3).default(1.2),
  direction: z.enum(['in', 'out']).default('in'),
  origin: z.enum(['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).default('center'),
  easing: EasingFunction.default('ease-out'),
})

// Text effects
export const textPropsSchema = z.object({
  text: z.string().default(''),
  fontSize: z.number().min(12).max(300).default(80),
  fontFamily: z.string().default('Impact'),
  fontWeight: z.number().min(100).max(900).default(700),
  color: z.string().default('#ffffff'),
  strokeColor: z.string().default('#000000'),
  strokeWidth: z.number().default(2),
  shadowColor: z.string().default('rgba(0,0,0,0.5)'),
  shadowBlur: z.number().default(10),
  position: CornerPosition.default('center'),
  animation: z.enum(['pop', 'slide', 'fade', 'typewriter', 'bounce', 'glitch', 'wave']).default('pop'),
})

// Transition effects
export const transitionPropsSchema = z.object({
  color: z.string().default('#000000'),
  direction: z.enum(['left', 'right', 'up', 'down', 'radial']).default('left'),
  style: z.enum(['wipe', 'fade', 'flash', 'pixel', 'glitch', 'zoom', 'spin']).default('wipe'),
})

// Overlay effects
export const overlayPropsSchema = z.object({
  opacity: z.number().min(0).max(1).default(0.8),
  color: z.string().default('#000000'),
  blendMode: z.enum(['normal', 'multiply', 'screen', 'overlay', 'soft-light']).default('normal'),
  position: CornerPosition.default('center'),
  size: z.number().min(50).max(800).default(300),
})

// Motion effects
export const motionPropsSchema = z.object({
  intensity: z.number().min(1).max(50).default(10),
  speed: z.number().min(0.1).max(10).default(1),
  direction: z.enum(['horizontal', 'vertical', 'both', 'circular']).default('both'),
  easing: EasingFunction.default('ease-in-out'),
})

// Color effects
export const colorPropsSchema = z.object({
  intensity: z.number().min(0).max(2).default(1),
  hueShift: z.number().min(-180).max(180).default(0),
  saturation: z.number().min(0).max(2).default(1),
  brightness: z.number().min(0).max(2).default(1),
  contrast: z.number().min(0).max(2).default(1),
  temperature: z.enum(['warm', 'cool', 'neutral']).default('neutral'),
})

// B-roll effects
export const brollPropsSchema = z.object({
  src: z.string().default(''),
  position: CornerPosition.default('top-right'),
  size: z.number().min(100).max(800).default(300),
  borderRadius: z.number().default(12),
  borderColor: z.string().default('#ffffff'),
  borderWidth: z.number().default(3),
  shadow: z.boolean().default(true),
  animation: z.enum(['scale', 'slide', 'fade', 'bounce']).default('scale'),
})

// Audio visual effects
export const audioPropsSchema = z.object({
  color: z.string().default('#00ffff'),
  bars: z.number().min(5).max(100).default(20),
  sensitivity: z.number().min(0.1).max(2).default(1),
  style: z.enum(['bars', 'waveform', 'circle', 'spectrum']).default('bars'),
  position: z.enum(['bottom', 'top', 'center', 'background']).default('bottom'),
})

// ==================== MAIN EFFECT SCHEMA ====================
export const effectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: EffectCategory,
  layer: LayerType.default('overlay'),
  priority: z.number().min(0).max(100).default(50),
  
  // Which video modes this effect works best with
  modes: z.array(VideoMode).default(['lemmino', 'documentary']),
  
  // Effects that can't be used together
  conflicts: z.array(z.string()).default([]),
  
  // Effects that work well together
  pairsWith: z.array(z.string()).default([]),
  
  // Trigger configuration
  triggers: effectTriggerSchema,
  
  // Timing configuration
  timing: effectTimingSchema,
  
  // Props schema (type-specific)
  props: z.record(z.any()).default({}),
  
  // Variants of this effect
  variants: z.array(z.string()).default([]),
  
  // Required assets
  assets: z.object({
    required: z.array(z.string()).default([]),
    optional: z.array(z.string()).default([]),
  }).default({ required: [], optional: [] }),
})

export type Effect = z.infer<typeof effectSchema>

// ==================== MODE CONFIGURATIONS ====================
export const modeConfigSchema = z.object({
  name: VideoMode,
  displayName: z.string(),
  emoji: z.string(),
  description: z.string(),
  editsPerMinute: z.number().min(5).max(60).default(20),
  preferredEffects: z.array(z.string()).default([]),
  avoidEffects: z.array(z.string()).default([]),
  colorGrade: z.string().default('cinematic'),
  pacing: z.enum(['slow', 'medium', 'fast', 'chaotic']).default('medium'),
  brollFrequency: z.number().min(0).max(1).default(0.3),
  textOverlayFrequency: z.number().min(0).max(1).default(0.2),
})

export type ModeConfig = z.infer<typeof modeConfigSchema>

// ==================== MODE PRESETS ====================
export const MODE_CONFIGS: Record<VideoModeType, ModeConfig> = {
  lemmino: {
    name: 'lemmino',
    displayName: 'Lemmino',
    emoji: '🎬',
    description: 'Cinematic documentary style with slow zooms and letterbox',
    editsPerMinute: 8,
    preferredEffects: ['zoom_in_slow', 'letterbox', 'cinematic', 'vignette', 'ken_burns_broll'],
    avoidEffects: ['zoom_punch', 'shake_heavy', 'emoji_rain', 'confetti'],
    colorGrade: 'cinematic',
    pacing: 'slow',
    brollFrequency: 0.4,
    textOverlayFrequency: 0.1,
  },
  mrbeast: {
    name: 'mrbeast',
    displayName: 'MrBeast',
    emoji: '🔥',
    description: 'High energy with fast cuts, zooms, and text pops',
    editsPerMinute: 40,
    preferredEffects: ['zoom_punch', 'flash_white', 'text_pop', 'shake_heavy', 'subscribe_button', 'emoji_rain'],
    avoidEffects: ['zoom_in_slow', 'letterbox', 'noir'],
    colorGrade: 'saturate_boost',
    pacing: 'chaotic',
    brollFrequency: 0.5,
    textOverlayFrequency: 0.6,
  },
  tiktok: {
    name: 'tiktok',
    displayName: 'TikTok',
    emoji: '📱',
    description: 'Trendy effects with bouncy animations and emojis',
    editsPerMinute: 50,
    preferredEffects: ['zoom_bounce', 'text_bounce', 'emoji_rain', 'confetti', 'neon_glow', 'text_gradient'],
    avoidEffects: ['letterbox', 'noir', 'sepia'],
    colorGrade: 'saturate_boost',
    pacing: 'chaotic',
    brollFrequency: 0.3,
    textOverlayFrequency: 0.7,
  },
  documentary: {
    name: 'documentary',
    displayName: 'Documentary',
    emoji: '🎥',
    description: 'Professional documentary with subtle effects',
    editsPerMinute: 12,
    preferredEffects: ['zoom_in_slow', 'pan_left', 'pan_right', 'vignette', 'warm_grade', 'ken_burns_broll'],
    avoidEffects: ['glitch_transition', 'emoji_rain', 'neon_glow'],
    colorGrade: 'cinematic',
    pacing: 'slow',
    brollFrequency: 0.5,
    textOverlayFrequency: 0.15,
  },
  tutorial: {
    name: 'tutorial',
    displayName: 'Tutorial',
    emoji: '📚',
    description: 'Educational with clear text and highlights',
    editsPerMinute: 15,
    preferredEffects: ['zoom_focus', 'spotlight', 'arrow_pointer', 'text_typewriter', 'progress_bar'],
    avoidEffects: ['shake_heavy', 'glitch_transition', 'emoji_rain'],
    colorGrade: 'contrast_boost',
    pacing: 'medium',
    brollFrequency: 0.2,
    textOverlayFrequency: 0.4,
  },
  vox: {
    name: 'vox',
    displayName: 'Vox Explainer',
    emoji: '📊',
    description: 'Clean explainer style with data visualization',
    editsPerMinute: 18,
    preferredEffects: ['zoom_in_slow', 'text_slide_in', 'progress_bar', 'spotlight', 'cold_grade'],
    avoidEffects: ['emoji_rain', 'confetti', 'fire_overlay'],
    colorGrade: 'cold_grade',
    pacing: 'medium',
    brollFrequency: 0.4,
    textOverlayFrequency: 0.5,
  },
  truecrime: {
    name: 'truecrime',
    displayName: 'True Crime',
    emoji: '🔍',
    description: 'Dark and suspenseful with dramatic effects',
    editsPerMinute: 10,
    preferredEffects: ['zoom_in_slow', 'vignette', 'noir', 'dramatic', 'shake_light', 'spotlight'],
    avoidEffects: ['emoji_rain', 'confetti', 'saturate_boost', 'subscribe_button'],
    colorGrade: 'noir',
    pacing: 'slow',
    brollFrequency: 0.3,
    textOverlayFrequency: 0.2,
  },
  naturedoc: {
    name: 'naturedoc',
    displayName: 'Nature Doc',
    emoji: '🌿',
    description: 'Beautiful nature footage with Ken Burns',
    editsPerMinute: 6,
    preferredEffects: ['ken_burns_broll', 'zoom_in_slow', 'zoom_out_slow', 'warm_grade', 'vignette'],
    avoidEffects: ['glitch_transition', 'shake_heavy', 'emoji_rain', 'neon_glow'],
    colorGrade: 'warm_grade',
    pacing: 'slow',
    brollFrequency: 0.7,
    textOverlayFrequency: 0.05,
  },
  shorts: {
    name: 'shorts',
    displayName: 'YouTube Shorts',
    emoji: '⚡',
    description: 'Quick vertical content with fast effects',
    editsPerMinute: 45,
    preferredEffects: ['zoom_punch', 'text_pop', 'flash_white', 'subscribe_button', 'emoji_rain'],
    avoidEffects: ['letterbox', 'zoom_in_slow'],
    colorGrade: 'saturate_boost',
    pacing: 'chaotic',
    brollFrequency: 0.4,
    textOverlayFrequency: 0.6,
  },
  gaming: {
    name: 'gaming',
    displayName: 'Gaming',
    emoji: '🎮',
    description: 'Gaming content with energetic effects',
    editsPerMinute: 35,
    preferredEffects: ['zoom_punch', 'shake_heavy', 'neon_glow', 'glitch_transition', 'fire_overlay'],
    avoidEffects: ['letterbox', 'sepia', 'vintage'],
    colorGrade: 'neon_glow',
    pacing: 'fast',
    brollFrequency: 0.2,
    textOverlayFrequency: 0.4,
  },
  course: {
    name: 'course',
    displayName: 'Online Course',
    emoji: '🎓',
    description: 'Professional educational content',
    editsPerMinute: 10,
    preferredEffects: ['zoom_focus', 'spotlight', 'text_typewriter', 'progress_bar', 'arrow_pointer'],
    avoidEffects: ['shake_heavy', 'emoji_rain', 'glitch_transition'],
    colorGrade: 'contrast_boost',
    pacing: 'slow',
    brollFrequency: 0.15,
    textOverlayFrequency: 0.3,
  },
  cinematic: {
    name: 'cinematic',
    displayName: 'Cinematic',
    emoji: '🎞️',
    description: 'Film-like quality with letterbox and grades',
    editsPerMinute: 8,
    preferredEffects: ['letterbox', 'cinematic', 'vignette', 'zoom_in_slow', 'dolly_zoom'],
    avoidEffects: ['emoji_rain', 'subscribe_button', 'neon_glow'],
    colorGrade: 'cinematic',
    pacing: 'slow',
    brollFrequency: 0.4,
    textOverlayFrequency: 0.1,
  },
  trailer: {
    name: 'trailer',
    displayName: 'Movie Trailer',
    emoji: '🎬',
    description: 'Epic trailer style with dramatic effects',
    editsPerMinute: 25,
    preferredEffects: ['flash_black', 'zoom_punch', 'text_pop', 'dramatic', 'letterbox', 'bass_pulse'],
    avoidEffects: ['emoji_rain', 'subscribe_button'],
    colorGrade: 'dramatic',
    pacing: 'fast',
    brollFrequency: 0.3,
    textOverlayFrequency: 0.4,
  },
  podcast: {
    name: 'podcast',
    displayName: 'Podcast',
    emoji: '🎙️',
    description: 'Clean podcast style with minimal effects',
    editsPerMinute: 8,
    preferredEffects: ['zoom_in_slow', 'audio_bars', 'waveform', 'vignette'],
    avoidEffects: ['shake_heavy', 'emoji_rain', 'glitch_transition', 'confetti'],
    colorGrade: 'warm_grade',
    pacing: 'slow',
    brollFrequency: 0.1,
    textOverlayFrequency: 0.15,
  },
  aesthetic: {
    name: 'aesthetic',
    displayName: 'Aesthetic/ASMR',
    emoji: '✨',
    description: 'Soft aesthetic vibes with gentle effects',
    editsPerMinute: 5,
    preferredEffects: ['zoom_in_slow', 'particles', 'vintage', 'blur_focus', 'light_leak'],
    avoidEffects: ['shake_heavy', 'zoom_punch', 'glitch_transition', 'flash_white'],
    colorGrade: 'vintage',
    pacing: 'slow',
    brollFrequency: 0.3,
    textOverlayFrequency: 0.05,
  },
  vlog: {
    name: 'vlog',
    displayName: 'Vlog',
    emoji: '📹',
    description: 'Casual vlog style with fun effects',
    editsPerMinute: 20,
    preferredEffects: ['zoom_punch', 'text_pop', 'emoji_rain', 'warm_grade', 'pip_center'],
    avoidEffects: ['noir', 'letterbox'],
    colorGrade: 'warm_grade',
    pacing: 'medium',
    brollFrequency: 0.3,
    textOverlayFrequency: 0.3,
  },
}

// ==================== EFFECT REGISTRY HELPERS ====================
export const getEffectsForMode = (mode: VideoModeType, allEffects: Effect[]): Effect[] => {
  const config = MODE_CONFIGS[mode]
  return allEffects.filter(effect => 
    effect.modes.includes(mode) && 
    !config.avoidEffects.includes(effect.id)
  ).sort((a, b) => {
    const aPreferred = config.preferredEffects.includes(a.id) ? 1 : 0
    const bPreferred = config.preferredEffects.includes(b.id) ? 1 : 0
    return bPreferred - aPreferred
  })
}

export const getRandomEffectForKeyword = (
  keyword: string,
  mode: VideoModeType,
  allEffects: Effect[],
  usedRecently: string[] = []
): Effect | null => {
  const modeEffects = getEffectsForMode(mode, allEffects)
  const keywordLower = keyword.toLowerCase()
  
  // Find effects triggered by this keyword
  const triggered = modeEffects.filter(e => 
    e.triggers.keywords.some(k => keywordLower.includes(k.toLowerCase())) &&
    !usedRecently.includes(e.id)
  )
  
  if (triggered.length > 0) {
    // Weight-based random selection
    const totalWeight = triggered.reduce((sum, e) => sum + e.triggers.weight, 0)
    let random = Math.random() * totalWeight
    for (const effect of triggered) {
      random -= effect.triggers.weight
      if (random <= 0) return effect
    }
    return triggered[0]
  }
  
  // Fallback: random effect from mode
  const available = modeEffects.filter(e => !usedRecently.includes(e.id))
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null
}

// Export everything for brain to use
export default {
  effectCategories,
  videoModes,
  cornerPositions,
  MODE_CONFIGS,
  getEffectsForMode,
  getRandomEffectForKeyword,
}

