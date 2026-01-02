// THE BRAIN - this is where the magic happens fr fr
// scans the edits folder and builds a catalog of what we can do
// claude reads this catalog and decides what effects to slap on your video
// NOW WITH 100+ EFFECTS AND PROPER SCHEMAS!

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

// Effects registry types - the actual data is loaded dynamically
// This avoids TS issues with files outside src folder

export interface Effect {
  id: string
  name: string
  description: string
  category: string
  layer: string
  priority: number
  modes: string[]
  conflicts: string[]
  pairsWith: string[]
  triggers: {
    keywords: string[]
    punctuation: string[]
    sentiment: string
    weight: number
    maxPerMinute: number
    minGapFrames: number
  }
  timing: {
    minDuration: number
    maxDuration: number
    defaultDuration: number
    cooldown: number
    attackFrames: number
    releaseFrames: number
  }
  props: Record<string, any>
  variants: string[]
  assets: { required: string[]; optional: string[] }
}

export interface ModeConfig {
  name: string
  displayName: string
  emoji: string
  description: string
  editsPerMinute: number
  preferredEffects: string[]
  avoidEffects: string[]
  colorGrade: string
  pacing: string
  brollFrequency: number
  textOverlayFrequency: number
}

export type VideoModeType = 'lemmino' | 'mrbeast' | 'tiktok' | 'documentary' | 'tutorial' | 'vox' | 'truecrime' | 'naturedoc' | 'shorts' | 'gaming' | 'course' | 'cinematic' | 'trailer' | 'podcast' | 'aesthetic' | 'vlog'

// Mode configurations - hardcoded for reliability
export const MODE_CONFIGS: Record<VideoModeType, ModeConfig> = {
  lemmino: { name: 'lemmino', displayName: 'Lemmino', emoji: '🎬', description: 'Cinematic documentary', editsPerMinute: 8, preferredEffects: ['zoom_in_slow', 'letterbox', 'cinematic'], avoidEffects: ['zoom_punch', 'emoji_rain'], colorGrade: 'cinematic', pacing: 'slow', brollFrequency: 0.4, textOverlayFrequency: 0.1 },
  mrbeast: { name: 'mrbeast', displayName: 'MrBeast', emoji: '🔥', description: 'High energy', editsPerMinute: 40, preferredEffects: ['zoom_punch', 'flash_white', 'text_pop'], avoidEffects: ['zoom_in_slow', 'letterbox'], colorGrade: 'saturate_boost', pacing: 'chaotic', brollFrequency: 0.5, textOverlayFrequency: 0.6 },
  tiktok: { name: 'tiktok', displayName: 'TikTok', emoji: '📱', description: 'Trendy effects', editsPerMinute: 50, preferredEffects: ['zoom_bounce', 'text_bounce', 'emoji_rain'], avoidEffects: ['letterbox', 'noir'], colorGrade: 'saturate_boost', pacing: 'chaotic', brollFrequency: 0.3, textOverlayFrequency: 0.7 },
  documentary: { name: 'documentary', displayName: 'Documentary', emoji: '🎥', description: 'Professional', editsPerMinute: 12, preferredEffects: ['zoom_in_slow', 'pan_left', 'vignette'], avoidEffects: ['glitch_transition', 'emoji_rain'], colorGrade: 'cinematic', pacing: 'slow', brollFrequency: 0.5, textOverlayFrequency: 0.15 },
  tutorial: { name: 'tutorial', displayName: 'Tutorial', emoji: '📚', description: 'Educational', editsPerMinute: 15, preferredEffects: ['zoom_focus', 'spotlight', 'arrow_pointer'], avoidEffects: ['shake_heavy', 'emoji_rain'], colorGrade: 'contrast_boost', pacing: 'medium', brollFrequency: 0.2, textOverlayFrequency: 0.4 },
  vox: { name: 'vox', displayName: 'Vox Explainer', emoji: '📊', description: 'Clean explainer', editsPerMinute: 18, preferredEffects: ['zoom_in_slow', 'text_slide_in', 'progress_bar'], avoidEffects: ['emoji_rain', 'confetti'], colorGrade: 'cold_grade', pacing: 'medium', brollFrequency: 0.4, textOverlayFrequency: 0.5 },
  truecrime: { name: 'truecrime', displayName: 'True Crime', emoji: '🔍', description: 'Dark and suspenseful', editsPerMinute: 10, preferredEffects: ['zoom_in_slow', 'vignette', 'noir'], avoidEffects: ['emoji_rain', 'confetti'], colorGrade: 'noir', pacing: 'slow', brollFrequency: 0.3, textOverlayFrequency: 0.2 },
  naturedoc: { name: 'naturedoc', displayName: 'Nature Doc', emoji: '🌿', description: 'Beautiful nature', editsPerMinute: 6, preferredEffects: ['ken_burns_broll', 'zoom_in_slow', 'warm_grade'], avoidEffects: ['glitch_transition', 'neon_glow'], colorGrade: 'warm_grade', pacing: 'slow', brollFrequency: 0.7, textOverlayFrequency: 0.05 },
  shorts: { name: 'shorts', displayName: 'YouTube Shorts', emoji: '⚡', description: 'Quick vertical', editsPerMinute: 45, preferredEffects: ['zoom_punch', 'text_pop', 'flash_white'], avoidEffects: ['letterbox'], colorGrade: 'saturate_boost', pacing: 'chaotic', brollFrequency: 0.4, textOverlayFrequency: 0.6 },
  gaming: { name: 'gaming', displayName: 'Gaming', emoji: '🎮', description: 'Energetic gaming', editsPerMinute: 35, preferredEffects: ['zoom_punch', 'shake_heavy', 'neon_glow'], avoidEffects: ['letterbox', 'sepia'], colorGrade: 'neon_glow', pacing: 'fast', brollFrequency: 0.2, textOverlayFrequency: 0.4 },
  course: { name: 'course', displayName: 'Online Course', emoji: '🎓', description: 'Professional educational', editsPerMinute: 10, preferredEffects: ['zoom_focus', 'spotlight', 'text_typewriter'], avoidEffects: ['shake_heavy', 'emoji_rain'], colorGrade: 'contrast_boost', pacing: 'slow', brollFrequency: 0.15, textOverlayFrequency: 0.3 },
  cinematic: { name: 'cinematic', displayName: 'Cinematic', emoji: '🎞️', description: 'Film-like quality', editsPerMinute: 8, preferredEffects: ['letterbox', 'cinematic', 'vignette'], avoidEffects: ['emoji_rain', 'subscribe_button'], colorGrade: 'cinematic', pacing: 'slow', brollFrequency: 0.4, textOverlayFrequency: 0.1 },
  trailer: { name: 'trailer', displayName: 'Movie Trailer', emoji: '🎬', description: 'Epic trailer style', editsPerMinute: 25, preferredEffects: ['flash_black', 'zoom_punch', 'text_pop'], avoidEffects: ['emoji_rain'], colorGrade: 'dramatic', pacing: 'fast', brollFrequency: 0.3, textOverlayFrequency: 0.4 },
  podcast: { name: 'podcast', displayName: 'Podcast', emoji: '🎙️', description: 'Clean podcast', editsPerMinute: 8, preferredEffects: ['zoom_in_slow', 'audio_bars', 'waveform'], avoidEffects: ['shake_heavy', 'confetti'], colorGrade: 'warm_grade', pacing: 'slow', brollFrequency: 0.1, textOverlayFrequency: 0.15 },
  aesthetic: { name: 'aesthetic', displayName: 'Aesthetic/ASMR', emoji: '✨', description: 'Soft aesthetic', editsPerMinute: 5, preferredEffects: ['zoom_in_slow', 'particles', 'vintage'], avoidEffects: ['shake_heavy', 'zoom_punch'], colorGrade: 'vintage', pacing: 'slow', brollFrequency: 0.3, textOverlayFrequency: 0.05 },
  vlog: { name: 'vlog', displayName: 'Vlog', emoji: '📹', description: 'Casual vlog', editsPerMinute: 20, preferredEffects: ['zoom_punch', 'text_pop', 'emoji_rain'], avoidEffects: ['noir', 'letterbox'], colorGrade: 'warm_grade', pacing: 'medium', brollFrequency: 0.3, textOverlayFrequency: 0.3 },
}

// what an edit plugin looks like - every edit gotta have this metadata
export interface EditMeta {
  id: string                    // unique id like "zoom_pulse" or "ken_burns" 
  name: string                  // pretty name for the UI
  category: 'text' | 'motion' | 'transition' | 'background' | 'overlay' | 'audio' | 'effect'
  description: string           // tell claude what this does
  author?: string               // credit where its due
  version?: string
  
  // what props this edit accepts - claude needs to know what knobs to turn
  props: EditPropDef[]
  
  // when should AI use this edit - these are the trigger words
  triggers?: string[]           // keywords that trigger this edit
  modes?: string[]              // which video modes use this (lemmino, mrbeast, etc)
  weight?: number               // 0-1, how often to use it
}

// each prop the edit takes
export interface EditPropDef {
  name: string
  type: 'number' | 'string' | 'boolean' | 'color' | 'file' | 'select'
  default: any
  min?: number
  max?: number
  options?: string[]            // for select type
  description?: string
}

// registered edit with path to component
export interface RegisteredEdit {
  meta: EditMeta
  componentPath: string         // path to the .tsx file
  component?: React.ComponentType<any>  // loaded component (lazy loaded)
}

// THE BRAIN CLASS - singleton that manages all the edit plugins
class EditBrain {
  private edits: Map<string, RegisteredEdit> = new Map()
  private editsDir: string
  private loaded: boolean = false

  constructor() {
    // will be set on first scan
    this.editsDir = ''
  }
  
  // find the edits folder - try multiple locations
  private findEditsDir(): string {
    if (this.editsDir && fs.existsSync(this.editsDir)) {
      return this.editsDir
    }
    
    const possiblePaths = [
      // @ts-ignore - process.resourcesPath only exists in electron
      process.resourcesPath ? path.join(process.resourcesPath, 'edits') : '',
      path.join(__dirname, '../../../edits'),               // packaged relative to dist/main/main/
      path.join(__dirname, '../../../../edits'),            // another packaged layout
      path.join(process.cwd(), 'edits'),                    // dev mode from project root
      path.join(__dirname, '../../edits'),                  // dev relative to dist/main/
    ].filter(Boolean)
    
    console.log('[brain] searching for edits in:', possiblePaths)
    
    // use first existing path, or fallback to cwd
    this.editsDir = possiblePaths.find(p => {
      const exists = fs.existsSync(p)
      console.log(`[brain] checking ${p}: ${exists ? 'found' : 'nope'}`)
      return exists
    }) || path.join(process.cwd(), 'edits')
    
    return this.editsDir
  }

  // scan the edits folder and register everything we find
  // this runs on app start and whenever user drops new edits
  async scan(): Promise<void> {
    const editsDir = this.findEditsDir()
    console.log('[brain] scanning for edits in:', editsDir)
    
    // make the folder if it dont exist
    if (!fs.existsSync(editsDir)) {
      fs.mkdirSync(editsDir, { recursive: true })
      console.log('[brain] created edits folder - its empty rn but drop some plugins in there')
      return
    }

    // clear old registrations
    this.edits.clear()

    // find all .meta.json files - thats how we know whats an edit
    const metaFiles = await glob('**/*.meta.json', { cwd: editsDir })
    
    for (const metaFile of metaFiles) {
      try {
        const fullPath = path.join(editsDir, metaFile)
        const meta = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as EditMeta
        
        // component file should be same name but .tsx instead of .meta.json
        const componentPath = fullPath.replace('.meta.json', '.tsx')
        
        if (!fs.existsSync(componentPath)) {
          console.warn(`[brain] no component found for ${meta.id} - need ${componentPath}`)
          continue
        }

        this.edits.set(meta.id, {
          meta,
          componentPath
        })
        
        console.log(`[brain] registered: ${meta.id} (${meta.category})`)
      } catch (err) {
        console.error(`[brain] failed to load ${metaFile}:`, err)
      }
    }

    this.loaded = true
    console.log(`[brain] loaded ${this.edits.size} edits total - we cookin now`)
  }

  // get all registered edits
  getAll(): RegisteredEdit[] {
    return Array.from(this.edits.values())
  }

  // get edit by id
  get(id: string): RegisteredEdit | undefined {
    return this.edits.get(id)
  }

  // get edits by category
  getByCategory(category: string): RegisteredEdit[] {
    return this.getAll().filter(e => e.meta.category === category)
  }

  // get edits that work for a specific mode (lemmino, mrbeast, etc)
  getForMode(mode: string): RegisteredEdit[] {
    return this.getAll().filter(e => {
      if (!e.meta.modes) return true  // available in all modes if not specified
      return e.meta.modes.includes(mode)
    })
  }

  // get edits matching trigger keywords in text
  getByTriggers(text: string): RegisteredEdit[] {
    const words = text.toLowerCase().split(/\s+/)
    return this.getAll().filter(e => {
      if (!e.meta.triggers) return false
      return e.meta.triggers.some(t => words.includes(t.toLowerCase()))
    })
  }

  // generate the catalog for claude - tells it what edits exist and how to use them
  // this is the key thing - claude reads this and knows how to edit your video
  generateEditCatalog(): string {
    const categories: Record<string, RegisteredEdit[]> = {}
    
    for (const edit of this.getAll()) {
      const cat = edit.meta.category
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(edit)
    }

    let catalog = '## AVAILABLE EDITS\n\n'
    catalog += 'These are all the edit effects you can use. Pick the right ones based on the content.\n\n'
    
    for (const [category, edits] of Object.entries(categories)) {
      catalog += `### ${category.toUpperCase()}\n`
      
      for (const edit of edits) {
        catalog += `\n**${edit.meta.id}** - ${edit.meta.name}\n`
        catalog += `${edit.meta.description}\n`
        catalog += `Props:\n`
        
        for (const prop of edit.meta.props) {
          catalog += `  - ${prop.name} (${prop.type}): ${prop.description || 'no description'}`
          if (prop.default !== undefined) catalog += ` [default: ${prop.default}]`
          catalog += '\n'
        }
        
        if (edit.meta.triggers?.length) {
          catalog += `Triggers: ${edit.meta.triggers.join(', ')}\n`
        }
      }
      
      catalog += '\n'
    }

    return catalog
  }

  // validate an edit call from claude - make sure it makes sense
  validateEditCall(editId: string, props: Record<string, any>): { valid: boolean; errors: string[] } {
    const edit = this.get(editId)
    if (!edit) return { valid: false, errors: [`unknown edit: ${editId} - did you add it to /edits?`] }

    const errors: string[] = []
    
    for (const propDef of edit.meta.props) {
      const value = props[propDef.name]
      
      // check required props have values
      if (value === undefined && propDef.default === undefined) {
        errors.push(`missing required prop: ${propDef.name}`)
        continue
      }

      // type checking - make sure values are right type
      if (value !== undefined) {
        if (propDef.type === 'number' && typeof value !== 'number') {
          errors.push(`${propDef.name} should be number, got ${typeof value}`)
        }
        if (propDef.type === 'string' && typeof value !== 'string') {
          errors.push(`${propDef.name} should be string, got ${typeof value}`)
        }
        if (propDef.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${propDef.name} should be boolean, got ${typeof value}`)
        }
        if (propDef.type === 'select' && propDef.options && !propDef.options.includes(value)) {
          errors.push(`${propDef.name} must be one of: ${propDef.options.join(', ')}`)
        }
        if (propDef.type === 'number' && propDef.min !== undefined && value < propDef.min) {
          errors.push(`${propDef.name} must be >= ${propDef.min}`)
        }
        if (propDef.type === 'number' && propDef.max !== undefined && value > propDef.max) {
          errors.push(`${propDef.name} must be <= ${propDef.max}`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // get default props for an edit
  getDefaultProps(editId: string): Record<string, any> {
    const edit = this.get(editId)
    if (!edit) return {}

    const defaults: Record<string, any> = {}
    for (const prop of edit.meta.props) {
      if (prop.default !== undefined) {
        defaults[prop.name] = prop.default
      }
    }
    return defaults
  }

  // check if brain is ready
  isLoaded(): boolean {
    return this.loaded
  }

  // get count of registered edits
  getCount(): number {
    return this.edits.size
  }

  // ==================== NEW REGISTRY METHODS ====================
  
  // Get all effects from the 100+ registry (combines brain edits + built-in effects)
  getAllRegistryEffects(): Effect[] {
    // Convert brain edits to Effect format
    return this.getAll().map(edit => ({
      id: edit.meta.id,
      name: edit.meta.name,
      description: edit.meta.description,
      category: edit.meta.category,
      layer: 'overlay',
      priority: 50,
      modes: edit.meta.modes || ['lemmino', 'documentary'],
      conflicts: [],
      pairsWith: [],
      triggers: {
        keywords: edit.meta.triggers || [],
        punctuation: [],
        sentiment: 'any',
        weight: edit.meta.weight || 0.5,
        maxPerMinute: 15,
        minGapFrames: 30,
      },
      timing: {
        minDuration: 15,
        maxDuration: 90,
        defaultDuration: 30,
        cooldown: 60,
        attackFrames: 5,
        releaseFrames: 5,
      },
      props: edit.meta.props.reduce((acc, p) => ({ ...acc, [p.name]: p.default }), {}),
      variants: [],
      assets: { required: [], optional: [] },
    }))
  }

  // Get effects optimized for a specific video mode
  getEffectsForVideoMode(mode: VideoModeType): Effect[] {
    const config = MODE_CONFIGS[mode]
    const allEffects = this.getAllRegistryEffects()
    return allEffects.filter(effect => 
      effect.modes.includes(mode) && 
      !config.avoidEffects.includes(effect.id)
    ).sort((a, b) => {
      const aPreferred = config.preferredEffects.includes(a.id) ? 1 : 0
      const bPreferred = config.preferredEffects.includes(b.id) ? 1 : 0
      return bPreferred - aPreferred
    })
  }

  // Get mode configuration (edit density, preferred effects, etc)
  getModeConfig(mode: VideoModeType) {
    return MODE_CONFIGS[mode]
  }

  // Get a random effect based on keyword and mode
  pickEffectForKeyword(keyword: string, mode: VideoModeType, recentlyUsed: string[] = []): Effect | null {
    const modeEffects = this.getEffectsForVideoMode(mode)
    const keywordLower = keyword.toLowerCase()
    
    // Find effects triggered by this keyword
    const triggered = modeEffects.filter(e => 
      e.triggers.keywords.some(k => keywordLower.includes(k.toLowerCase())) &&
      !recentlyUsed.includes(e.id)
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
    const available = modeEffects.filter(e => !recentlyUsed.includes(e.id))
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null
  }

  // Generate edit suggestions for a transcript
  generateEditSuggestions(transcript: string, mode: VideoModeType, durationSeconds: number): Array<{
    effect: Effect
    atSecond: number
    reason: string
  }> {
    const modeConfig = MODE_CONFIGS[mode]
    const editsPerMinute = modeConfig.editsPerMinute
    const totalEdits = Math.floor((durationSeconds / 60) * editsPerMinute)
    
    const suggestions: Array<{ effect: Effect; atSecond: number; reason: string }> = []
    const words = transcript.split(/\s+/)
    const recentlyUsed: string[] = []
    
    // Spread edits evenly across duration with some randomness
    for (let i = 0; i < totalEdits; i++) {
      const baseTime = (i / totalEdits) * durationSeconds
      const jitter = (Math.random() - 0.5) * (durationSeconds / totalEdits) * 0.5
      const atSecond = Math.max(0.5, Math.min(durationSeconds - 1, baseTime + jitter))
      
      // Try to find a keyword-triggered effect
      const wordIndex = Math.floor((atSecond / durationSeconds) * words.length)
      const nearbyWords = words.slice(Math.max(0, wordIndex - 3), wordIndex + 3).join(' ')
      
      let effect = this.pickEffectForKeyword(nearbyWords, mode, recentlyUsed)
      
      // Fallback to random effect for this mode
      if (!effect) {
        const modeEffects = this.getEffectsForVideoMode(mode)
        const available = modeEffects.filter(e => !recentlyUsed.slice(-5).includes(e.id))
        effect = available[Math.floor(Math.random() * available.length)] || modeEffects[0]
      }
      
      if (effect) {
        suggestions.push({
          effect,
          atSecond: Math.round(atSecond * 10) / 10,
          reason: nearbyWords ? `Triggered by: "${nearbyWords.slice(0, 30)}..."` : 'Random placement'
        })
        recentlyUsed.push(effect.id)
      }
    }
    
    return suggestions.sort((a, b) => a.atSecond - b.atSecond)
  }

  // Generate enhanced catalog for Claude with registry effects
  generateEnhancedCatalog(mode: VideoModeType): string {
    const modeConfig = MODE_CONFIGS[mode]
    const modeEffects = this.getEffectsForVideoMode(mode)
    
    let catalog = `## VIDEO EDITING MODE: ${modeConfig.displayName} ${modeConfig.emoji}\n\n`
    catalog += `${modeConfig.description}\n\n`
    catalog += `**Settings:**\n`
    catalog += `- Edits per minute: ${modeConfig.editsPerMinute}\n`
    catalog += `- Pacing: ${modeConfig.pacing}\n`
    catalog += `- B-roll frequency: ${Math.round(modeConfig.brollFrequency * 100)}%\n`
    catalog += `- Text overlay frequency: ${Math.round(modeConfig.textOverlayFrequency * 100)}%\n\n`
    
    catalog += `## PREFERRED EFFECTS (${modeEffects.length} available)\n\n`
    
    // Group by category
    const byCategory: Record<string, Effect[]> = {}
    for (const effect of modeEffects) {
      if (!byCategory[effect.category]) byCategory[effect.category] = []
      byCategory[effect.category].push(effect)
    }
    
    for (const [category, effects] of Object.entries(byCategory)) {
      catalog += `### ${category.toUpperCase()} (${effects.length})\n`
      for (const effect of effects.slice(0, 10)) { // Top 10 per category
        const isPref = modeConfig.preferredEffects.includes(effect.id)
        catalog += `- **${effect.id}**${isPref ? ' ⭐' : ''}: ${effect.description}\n`
        catalog += `  Triggers: ${effect.triggers.keywords.slice(0, 5).join(', ')}\n`
      }
      catalog += '\n'
    }
    
    return catalog
  }
}

// singleton instance - the one brain to rule them all
export const brain = new EditBrain()

// helper to create edit metadata (for component authors)
export function defineEdit(meta: EditMeta): EditMeta {
  return meta
}

