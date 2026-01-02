// HITS STORE - zustand state management
// keeps track of everything thats going on

import { create } from 'zustand'

// project state
export interface Project {
  id: string
  name: string
  sourceFile: string | null
  mode: string
  transcript: TranscriptData | null
  manifest: any | null
  status: 'idle' | 'transcribing' | 'generating' | 'rendering' | 'complete' | 'error'
  progress: number
  error: string | null
  createdAt: string
  updatedAt: string
}

export interface TranscriptData {
  segments: TranscriptSegment[]
  duration: number
  language: string
  text: string
}

export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
  words: { word: string; start: number; end: number }[]
}

export interface EditInfo {
  id: string
  name: string
  category: string
  description: string
  props: any[]
  triggers?: string[]
  modes?: string[]
  author?: string
  version?: string
}

export interface RenderProgress {
  percent: number
  frame: number
  totalFrames: number
  eta: number
  stage: string
}

// the store state
interface StoreState {
  // current project
  currentProject: Project | null
  projects: Project[]
  
  // available edits from brain
  edits: EditInfo[]
  editCount: number
  
  // UI state
  sidebarCollapsed: boolean
  
  // render progress
  renderProgress: RenderProgress | null
  
  // video output settings
  outputFormat: 'horizontal' | 'vertical' | 'square' | 'custom'
  
  // actions
  createProject: (name: string, mode: string) => Project
  setCurrentProject: (project: Project | null) => void
  updateProject: (updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  setSourceFile: (file: string) => void
  setTranscript: (transcript: TranscriptData) => void
  setManifest: (manifest: any) => void
  setStatus: (status: Project['status']) => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  
  setEdits: (edits: EditInfo[]) => void
  setEditCount: (count: number) => void
  
  setSidebarCollapsed: (collapsed: boolean) => void
  setRenderProgress: (progress: RenderProgress | null) => void
  setOutputFormat: (format: 'horizontal' | 'vertical' | 'square' | 'custom') => void
}

export const useStore = create<StoreState>((set, get) => ({
  currentProject: null,
  projects: [],
  edits: [],
  editCount: 0,
  sidebarCollapsed: false,
  renderProgress: null,
  outputFormat: 'horizontal',
  
  // project actions
  createProject: (name, mode) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      sourceFile: null,
      mode,
      transcript: null,
      manifest: null,
      status: 'idle',
      progress: 0,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    set((state) => ({
      projects: [...state.projects, project],
      currentProject: project,
    }))
    
    return project
  },
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (updates) => {
    const { currentProject } = get()
    if (!currentProject) return
    
    const updated = { ...currentProject, ...updates, updatedAt: new Date().toISOString() }
    
    set((state) => ({
      currentProject: updated,
      projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
    }))
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }))
  },
  
  // shortcuts for updating current project
  setSourceFile: (file) => get().updateProject({ sourceFile: file }),
  setTranscript: (transcript) => get().updateProject({ transcript }),
  setManifest: (manifest) => get().updateProject({ manifest }),
  setStatus: (status) => get().updateProject({ status }),
  setProgress: (progress) => get().updateProject({ progress }),
  setError: (error) => get().updateProject({ error, status: error ? 'error' : 'idle' }),
  
  // edit actions
  setEdits: (edits) => set({ edits }),
  setEditCount: (count) => set({ editCount: count }),
  
  // UI actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setRenderProgress: (progress) => set({ renderProgress: progress }),
  setOutputFormat: (format) => set({ outputFormat: format }),
}))

