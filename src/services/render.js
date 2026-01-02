"use strict";
// RENDER SERVICE - uses remotion to actually render the video
// GPU accelerated when possible cause aint nobody got time for CPU rendering
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderService = exports.RenderService = void 0;
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const path = __importStar(require("path"));
// render service class
class RenderService {
    bundlePath = null;
    // bundle the remotion project (do this once)
    async bundle() {
        if (this.bundlePath)
            return this.bundlePath;
        console.log('[render] bundling remotion project...');
        const entryPoint = path.join(process.cwd(), 'src/remotion/index.ts');
        this.bundlePath = await (0, bundler_1.bundle)({
            entryPoint,
            onProgress: (progress) => {
                console.log(`[render] bundle progress: ${Math.round(progress * 100)}%`);
            }
        });
        console.log('[render] bundle complete:', this.bundlePath);
        return this.bundlePath;
    }
    // render a video from manifest
    async render(manifest, outputPath, onProgress) {
        const bundlePath = await this.bundle();
        console.log('[render] starting render:', outputPath);
        console.log('[render] duration:', manifest.duration, 'seconds @', manifest.fps, 'fps');
        const totalFrames = Math.round(manifest.duration * manifest.fps);
        // select the composition
        const composition = await (0, renderer_1.selectComposition)({
            serveUrl: bundlePath,
            id: 'HitsVideo',
            inputProps: { manifest }
        });
        // override dimensions from manifest
        const compositionWithOverrides = {
            ...composition,
            width: manifest.width,
            height: manifest.height,
            fps: manifest.fps,
            durationInFrames: totalFrames
        };
        const startTime = Date.now();
        // render with GPU acceleration
        await (0, renderer_1.renderMedia)({
            composition: compositionWithOverrides,
            serveUrl: bundlePath,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps: { manifest },
            // GPU settings for linux
            chromiumOptions: {
                gl: 'angle-egl',
                enableMultiProcessOnLinux: true
            },
            onProgress: ({ renderedFrames, stitchStage }) => {
                const elapsed = (Date.now() - startTime) / 1000;
                const fps = renderedFrames / elapsed;
                const remaining = totalFrames - renderedFrames;
                const eta = fps > 0 ? remaining / fps : 0;
                onProgress?.({
                    percent: (renderedFrames / totalFrames) * 100,
                    frame: renderedFrames,
                    totalFrames,
                    eta,
                    stage: stitchStage || 'rendering'
                });
            }
        });
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('[render] complete in', elapsed, 'seconds:', outputPath);
    }
}
exports.RenderService = RenderService;
// singleton instance
exports.renderService = new RenderService();
