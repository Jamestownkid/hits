// RENDER SERVICE - renders video using Remotion
// THE KEY: Video must be copied to publicDir BEFORE bundle() runs!
// publicDir contents get bundled INTO webpack - so video must exist first

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

// temp folder for videos - must be writable
const RENDER_TEMP_DIR = path.join(os.tmpdir(), 'hits-render-public')

// ensure temp dir exists
function ensureTempDir(): string {
  if (!fs.existsSync(RENDER_TEMP_DIR)) {
    fs.mkdirSync(RENDER_TEMP_DIR, { recursive: true })
  }
  return RENDER_TEMP_DIR
}

// generate unique filename
function generateTempVideoName(): string {
  return `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`
}

// copy or symlink video (symlink is faster!)
function copyVideoToPublic(sourcePath: string): string {
  const tempDir = ensureTempDir()
  const tempName = generateTempVideoName()
  const destPath = path.join(tempDir, tempName)
  
  const cleanSource = sourcePath.replace(/^file:\/\//i, '')
  console.log('[render] preparing video:', cleanSource)
  
  try {
    fs.symlinkSync(cleanSource, destPath)
    console.log('[render] symlinked to:', destPath)
  } catch {
    fs.copyFileSync(cleanSource, destPath)
    console.log('[render] copied to:', destPath)
  }
  
  return tempName
}

// cleanup temp video
function cleanupTempVideo(filename: string): void {
  try {
    const filePath = path.join(RENDER_TEMP_DIR, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('[render] cleaned up:', filename)
    }
  } catch {}
}

// cleanup all old temp files
export function cleanupOldTempFiles(): void {
  try {
    if (!fs.existsSync(RENDER_TEMP_DIR)) return
    const files = fs.readdirSync(RENDER_TEMP_DIR)
    files.forEach(f => { try { fs.unlinkSync(path.join(RENDER_TEMP_DIR, f)) } catch {} })
    if (files.length) console.log('[render] cleaned', files.length, 'old files')
  } catch {}
}

// find app path
function getAppPath(): string {
  const paths = [
    process.resourcesPath ? path.join(process.resourcesPath, 'app') : null,
    app?.getAppPath?.() || null,
    process.cwd(),
    __dirname,
  ].filter(Boolean) as string[]
  
  for (const p of paths) {
    try {
      if (fs.existsSync(path.join(p, 'src/remotion/index.ts'))) return p
      if (fs.existsSync(path.join(p, 'src/remotion/index.tsx'))) return p
    } catch {}
  }
  return paths[0] || process.cwd()
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

      // STEP 1: Validate source video
      if (manifest.sourceVideo) {
        const videoPath = manifest.sourceVideo.replace(/^file:\/\//, '')
        if (!fs.existsSync(videoPath)) {
          throw new Error(`Video not found: ${videoPath}`)
        }
        console.log('[render] source:', videoPath)
        
        // STEP 2: Copy video to temp dir FIRST (BEFORE bundle!)
        tempVideoName = copyVideoToPublic(videoPath)
        manifest.sourceVideo = tempVideoName
        console.log('[render] video ready in publicDir:', tempVideoName)
      }

      // STEP 3: Find entry point
      const appPath = getAppPath()
      let entryPoint = path.join(appPath, 'src/remotion/index.ts')
      if (!fs.existsSync(entryPoint)) {
        entryPoint = path.join(appPath, 'src/remotion/index.tsx')
      }
      if (!fs.existsSync(entryPoint)) {
        throw new Error(`Entry point not found: ${entryPoint}`)
      }

      // STEP 4: Bundle WITH publicDir - video is already there!
      console.log('[render] bundling...')
      console.log('[render] publicDir:', RENDER_TEMP_DIR)
      console.log('[render] files in publicDir:', fs.readdirSync(RENDER_TEMP_DIR))
      
      const bundlePath = await bundle({
        entryPoint,
        publicDir: RENDER_TEMP_DIR,  // video is already here!
        onProgress: (p) => console.log(`[render] bundle: ${Math.round(p * 100)}%`)
      })
      console.log('[render] bundle:', bundlePath)

      // STEP 5: Render
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

      console.log('[render] done in', ((Date.now() - startTime) / 1000).toFixed(1), 's')
      
    } finally {
      if (tempVideoName) cleanupTempVideo(tempVideoName)
    }
  }
}

export const renderService = new RenderService()
