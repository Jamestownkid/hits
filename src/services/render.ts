// RENDER SERVICE - uses Remotion to render the video
// PROPERLY SERVES VIDEO OVER HTTP - no more file:// nonsense!
// 1. Copies video to temp public folder (or symlinks for speed)
// 2. Bundles with publicDir pointing to temp folder
// 3. Remotion serves video at http://localhost:3000/video.mp4
// 4. OffthreadVideo can now fetch it properly
// 5. Cleans up temp files after render

import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { app } from 'electron'
import { EditManifest } from '../types/manifest'

export interface RenderProgress {
  percent: number
  frame: number
  totalFrames: number
  eta: number
  stage: string
}

// use temp folder that's always writable
const RENDER_TEMP_DIR = path.join(os.tmpdir(), 'hits-render-public')

// create temp public folder if it doesn't exist
function ensureTempDir(): string {
  if (!fs.existsSync(RENDER_TEMP_DIR)) {
    fs.mkdirSync(RENDER_TEMP_DIR, { recursive: true })
    console.log('[render] created temp public dir:', RENDER_TEMP_DIR)
  }
  return RENDER_TEMP_DIR
}

// generate unique filename to avoid collisions
function generateTempVideoName(): string {
  return `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`
}

// copy or symlink video to temp public folder (symlink is faster!)
function copyVideoToPublic(sourcePath: string): string {
  const tempDir = ensureTempDir()
  const tempName = generateTempVideoName()
  const destPath = path.join(tempDir, tempName)
  
  // clean path - remove file:// if present
  const cleanSource = sourcePath.replace(/^file:\/\//i, '')
  
  console.log('[render] preparing video:', cleanSource)
  
  // try symlink first (instant, no disk space), fall back to copy
  try {
    fs.symlinkSync(cleanSource, destPath)
    console.log('[render] symlinked video to:', destPath)
  } catch (symlinkErr) {
    console.log('[render] symlink failed, copying instead...')
    fs.copyFileSync(cleanSource, destPath)
    console.log('[render] copied video to:', destPath)
  }
  
  return tempName
}

// cleanup temp video file
function cleanupTempVideo(filename: string): void {
  try {
    const filePath = path.join(RENDER_TEMP_DIR, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('[render] cleaned up temp video:', filename)
    }
  } catch (err) {
    console.warn('[render] cleanup failed:', err)
  }
}

// cleanup ALL old temp files on startup
export function cleanupOldTempFiles(): void {
  try {
    if (!fs.existsSync(RENDER_TEMP_DIR)) return
    const files = fs.readdirSync(RENDER_TEMP_DIR)
    for (const file of files) {
      try { fs.unlinkSync(path.join(RENDER_TEMP_DIR, file)) } catch {}
    }
    if (files.length > 0) console.log('[render] cleaned up', files.length, 'old temp files')
  } catch {}
}

// figure out where we are - dev vs packaged
function getAppPath(): string {
  const possible = [
    process.resourcesPath ? path.join(process.resourcesPath, 'app') : null,
    app?.getAppPath?.() || null,
    process.cwd(),
    __dirname,
  ].filter(Boolean) as string[]
  
  for (const p of possible) {
    try {
      if (fs.existsSync(path.join(p, 'src/remotion/index.ts'))) return p
      if (fs.existsSync(path.join(p, 'src/remotion/index.tsx'))) return p
    } catch {}
  }
  
  return possible[0] || process.cwd()
}

export class RenderService {
  async render(
    manifest: EditManifest,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<void> {
    let tempVideoName: string | null = null
    
    try {
      console.log('[render] starting:', outputPath)
      console.log('[render] manifest mode:', manifest.mode)
      console.log('[render] manifest scenes:', manifest.scenes?.length || 0)

      // STEP 1: Validate source video exists
      if (manifest.sourceVideo) {
        const videoPath = manifest.sourceVideo.replace(/^file:\/\//, '')
        if (!fs.existsSync(videoPath)) {
          throw new Error(`Video file not found: ${videoPath}`)
        }
        const stats = fs.statSync(videoPath)
        if (stats.size < 1000) {
          throw new Error(`Video file appears empty or corrupt: ${videoPath}`)
        }
        console.log('[render] source video:', videoPath, Math.round(stats.size / 1024), 'KB')
        
        // STEP 2: Copy/symlink video to temp public folder
        tempVideoName = copyVideoToPublic(videoPath)
        
        // STEP 3: Update manifest to use just the filename
        manifest.sourceVideo = tempVideoName
      }

      // STEP 4: Bundle with publicDir
      const appPath = getAppPath()
      let entryPoint = path.join(appPath, 'src/remotion/index.ts')
      if (!fs.existsSync(entryPoint)) {
        entryPoint = path.join(appPath, 'src/remotion/index.tsx')
      }
      if (!fs.existsSync(entryPoint)) {
        throw new Error(`Remotion entry point not found: ${entryPoint}`)
      }

      console.log('[render] bundling with publicDir:', RENDER_TEMP_DIR)
      
      const bundlePath = await bundle({
        entryPoint,
        publicDir: RENDER_TEMP_DIR,
        onProgress: (p) => console.log(`[render] bundle: ${Math.round(p * 100)}%`)
      })
      console.log('[render] bundle complete:', bundlePath)

      // defaults
      const fps = manifest.fps || 30
      const duration = manifest.duration || 30
      const width = manifest.width || 1920
      const height = manifest.height || 1080
      const totalFrames = Math.round(duration * fps)
      
      const startTime = Date.now()

      const composition = await selectComposition({
        serveUrl: bundlePath,
        id: 'HitsVideo',
        inputProps: { manifest },
        timeoutInMilliseconds: 300000,
      })

      await renderMedia({
        composition: { ...composition, width, height, fps, durationInFrames: totalFrames },
        serveUrl: bundlePath,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: { manifest },
        timeoutInMilliseconds: 300000,
        concurrency: 2,
        chromiumOptions: {
          gl: 'angle-egl',
          enableMultiProcessOnLinux: true,
        },
        onProgress: ({ renderedFrames, stitchStage }) => {
          const elapsed = (Date.now() - startTime) / 1000
          const renderFps = renderedFrames / Math.max(0.1, elapsed)
          const eta = renderFps > 0 ? (totalFrames - renderedFrames) / renderFps : 0

          onProgress?.({
            percent: (renderedFrames / totalFrames) * 100,
            frame: renderedFrames,
            totalFrames,
            eta,
            stage: stitchStage || 'rendering'
          })
        }
      })

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log('[render] done in', elapsed, 'seconds:', outputPath)
      
    } finally {
      if (tempVideoName) cleanupTempVideo(tempVideoName)
    }
  }
}

export const renderService = new RenderService()
