// THE BRAIN - this is where the magic happens fr fr
// scans the edits folder and builds a catalog of what we can do
// claude reads this catalog and decides what effects to slap on your video

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

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
}

// singleton instance - the one brain to rule them all
export const brain = new EditBrain()

// helper to create edit metadata (for component authors)
export function defineEdit(meta: EditMeta): EditMeta {
  return meta
}

