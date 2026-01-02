// RENDER SERVICE - uses remotion to actually render the video
// GPU accelerated when possible cause aint nobody got time for CPU rendering
// FIXED: Works in packaged apps, allows file:// playback

import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
import { EditManifest } from '../types/manifest'

// render progress callback type
export interface RenderProgress {
  percent: number
  frame: number
  totalFrames: number
  eta: number
  stage: string
}

// figure out where we are - dev vs packaged
function getAppPath(): string {
  // try multiple paths cause electron is weird
  const possible = [
    process.resourcesPath ? path.join(process.resourcesPath, 'app') : null,
    app?.getAppPath?.() || null,
    process.cwd(),
    __dirname,
  ].filter(Boolean) as string[]
  
  for (const p of possible) {
    try {
      const testPath = path.join(p, 'src/remotion/index.ts')
      if (fs.existsSync(testPath)) {
        console.log('[render] found app path:', p)
        return p
      }
      // also try tsx
      const tsxPath = path.join(p, 'src/remotion/index.tsx')
      if (fs.existsSync(tsxPath)) {
        console.log('[render] found app path (tsx):', p)
        return p
      }
    } catch {}
  }
  
  console.log('[render] falling back to:', possible[0])
  return possible[0] || process.cwd()
}

// render service class
export class RenderService {
  private bundlePath: string | null = null

  // bundle the remotion project (do this once)
  async bundle(): Promise<string> {
    if (this.bundlePath) return this.bundlePath

    console.log('[render] bundling remotion project...')
    
    const appPath = getAppPath()
    
    // try .ts first, then .tsx
    let entryPoint = path.join(appPath, 'src/remotion/index.ts')
    if (!fs.existsSync(entryPoint)) {
      entryPoint = path.join(appPath, 'src/remotion/index.tsx')
    }
    
    console.log('[render] entry point:', entryPoint)
    
    if (!fs.existsSync(entryPoint)) {
      throw new Error(`Remotion entry point not found: ${entryPoint}`)
    }
    
    this.bundlePath = await bundle({
      entryPoint,
      onProgress: (progress) => {
        console.log(`[render] bundle progress: ${Math.round(progress * 100)}%`)
      }
    })

    console.log('[render] bundle complete:', this.bundlePath)
    return this.bundlePath
  }

  // render a video from manifest
  async render(
    manifest: EditManifest,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<void> {
    const bundlePath = await this.bundle()

    console.log('[render] starting render:', outputPath)
    console.log('[render] manifest:', JSON.stringify(manifest, null, 2).slice(0, 500))
    console.log('[render] duration:', manifest.duration, 'seconds @', manifest.fps, 'fps')

    // make sure we have valid values
    const fps = manifest.fps || 30
    const duration = manifest.duration || 30
    const width = manifest.width || 1920
    const height = manifest.height || 1080
    const totalFrames = Math.round(duration * fps)

    console.log('[render] computed frames:', totalFrames)

    // select the composition
    const composition = await selectComposition({
      serveUrl: bundlePath,
      id: 'HitsVideo',
      inputProps: { manifest }
    })

    // override dimensions from manifest
    const compositionWithOverrides = {
      ...composition,
      width,
      height,
      fps,
      durationInFrames: totalFrames
    }

    const startTime = Date.now()

    // render with GPU acceleration + FILE:// SUPPORT
    await renderMedia({
      composition: compositionWithOverrides,
      serveUrl: bundlePath,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { manifest },
      
      // GPU settings for linux + ALLOW FILE:// URLS
      chromiumOptions: {
        gl: 'angle-egl',
        enableMultiProcessOnLinux: true,
        disableWebSecurity: true, // CRITICAL: allows file:// video playback
      },

      onProgress: ({ renderedFrames, stitchStage }) => {
        const elapsed = (Date.now() - startTime) / 1000
        const renderFps = renderedFrames / elapsed
        const remaining = totalFrames - renderedFrames
        const eta = renderFps > 0 ? remaining / renderFps : 0

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
    console.log('[render] complete in', elapsed, 'seconds:', outputPath)
  }
}

// singleton instance
export const renderService = new RenderService()
