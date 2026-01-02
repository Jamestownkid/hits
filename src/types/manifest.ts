// shared types for edit manifests
// used by both main process (services) and renderer/remotion

// what an edit instance looks like in the manifest
export interface EditInstance {
  editId: string              // which edit to use (matches brain registry)
  at: number                  // start time in seconds
  duration: number            // how long in seconds
  props: Record<string, any>  // props to pass to the component
  layer?: number              // z-index (0 = bottom, higher = top)
}

// a scene is a chunk of the video with multiple edits
export interface Scene {
  start: number
  end: number
  text: string                // transcript text for this section
  edits: EditInstance[]
}

// the full manifest that claude generates
export interface EditManifest {
  mode: string
  duration: number
  fps: number
  width: number
  height: number
  sourceVideo: string
  scenes: Scene[]
  videoId?: string
  totalDurationInFrames?: number
  globalAudio?: {
    file: string
    volume: number
  }
  metadata?: {
    mode: string
    createdAt: string
    sourceTranscript?: string
  }
}
