// RENDER SERVICE - renders video using Remotion
// THE FIX: Copy video directly INTO the bundle folder AFTER bundling!
// This bypasses all publicDir/symlink weirdness - file WILL be there

import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
import { EditManifest } from '../types/manifest'

export interface RenderProgress {
  percent: number
  frame: number
  totalFrames: number
  eta: number
  stage: string
}

// generate unique filename
function generateTempVideoName(): string {
  return `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`
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
    let bundlePath: string | null = null
    
    try {
      console.log('[render] starting:', outputPath)

      // STEP 1: Validate source video and generate temp name
      let originalVideoPath: string | null = null
      if (manifest.sourceVideo) {
        originalVideoPath = manifest.sourceVideo.replace(/^file:\/\//, '')
        if (!fs.existsSync(originalVideoPath)) {
          throw new Error(`Video not found: ${originalVideoPath}`)
        }
        console.log('[render] source video:', originalVideoPath)
        
        // Generate temp name - we'll copy it into bundle later
        tempVideoName = generateTempVideoName()
        manifest.sourceVideo = tempVideoName
      }

      // STEP 2: Bundle first (no publicDir - we'll copy video in manually)
      const appPath = getAppPath()
      let entryPoint = path.join(appPath, 'src/remotion/index.ts')
      if (!fs.existsSync(entryPoint)) {
        entryPoint = path.join(appPath, 'src/remotion/index.tsx')
      }
      if (!fs.existsSync(entryPoint)) {
        throw new Error(`Entry point not found: ${entryPoint}`)
      }

      console.log('[render] bundling...')
      bundlePath = await bundle({
        entryPoint,
        onProgress: (p) => console.log(`[render] bundle: ${Math.round(p * 100)}%`)
      })
      console.log('[render] bundle created:', bundlePath)

      // STEP 3: Copy video directly INTO the bundle folder!
      // This is the key - Remotion serves from bundlePath, so video must be there
      if (originalVideoPath && tempVideoName) {
        const destPath = path.join(bundlePath, tempVideoName)
        console.log('[render] copying video into bundle:', destPath)
        fs.copyFileSync(originalVideoPath, destPath)
        console.log('[render] video copied! size:', fs.statSync(destPath).size, 'bytes')
        
        // Verify it's there
        const filesInBundle = fs.readdirSync(bundlePath).filter(f => f.endsWith('.mp4'))
        console.log('[render] mp4 files in bundle:', filesInBundle)
      }

      // STEP 4: Render
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
      // Cleanup: delete video from bundle folder
      if (bundlePath && tempVideoName) {
        try {
          const videoInBundle = path.join(bundlePath, tempVideoName)
          if (fs.existsSync(videoInBundle)) {
            fs.unlinkSync(videoInBundle)
            console.log('[render] cleaned up video from bundle')
          }
        } catch {}
      }
    }
  }
}

export const renderService = new RenderService()
