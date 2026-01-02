// PRELOAD SCRIPT - exposes safe APIs to the renderer process
// this is the bridge between electron main and react UI
// NOW WITH CLAUDE PROGRESS EVENTS!

import { contextBridge, ipcRenderer } from 'electron'

// type definitions for the API
export interface HitsAPI {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<boolean>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  config: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
    getAll: () => Promise<Record<string, any>>
  }
  dialog: {
    openFile: (filters?: any[]) => Promise<string | null>
    openFiles: (filters?: any[]) => Promise<string[]>
    openDirectory: () => Promise<string | null>
    saveFile: (defaultName: string) => Promise<string | null>
  }
  brain: {
    getEdits: () => Promise<any[]>
    getEditsByCategory: (category: string) => Promise<any[]>
    getEditsByMode: (mode: string) => Promise<any[]>
    getModes: () => Promise<Record<string, any>>
    rescan: () => Promise<number>
    getCount: () => Promise<number>
  }
  whisper: {
    transcribe: (videoPath: string) => Promise<{ success: boolean; data?: any; error?: string }>
    listModels: () => Promise<any[]>
    isDownloaded: (model: string) => Promise<boolean>
    downloadModel: (model: string) => Promise<{ success: boolean; path?: string; error?: string }>
    onProgress: (callback: (data: any) => void) => () => void
    onDownloadProgress: (callback: (data: any) => void) => () => void
  }
  claude: {
    generateManifest: (transcript: any, mode: string, sourceVideo: string, aspectRatio?: string) => Promise<{ success: boolean; data?: any; error?: string }>
    onProgress: (callback: (data: any) => void) => () => void  // NEW!
  }
  render: {
    start: (manifest: any, outputPath: string) => Promise<{ success: boolean; error?: string }>
    onProgress: (callback: (data: any) => void) => () => void
  }
  assets: {
    listSfx: () => Promise<string[]>
    listImages: () => Promise<string[]>
    setDir: (dir: string) => Promise<boolean>
  }
  shell: {
    openExternal: (url: string) => Promise<void>
    showItemInFolder: (path: string) => Promise<void>
  }
  edits: {
    openFolder: () => Promise<void>
    addFromCode: (code: string, meta: string, category: string) => Promise<{ success: boolean; id?: string; error?: string }>
  }
  folder: {
    listMedia: (folderPath: string) => Promise<string[]>
  }
  transcode: {
    needsConvert: (filePath: string) => Promise<boolean>
    isFFmpegInstalled: () => Promise<boolean>
    convert: (filePath: string) => Promise<{ success: boolean; outputPath: string; error?: string }>
    onProgress: (callback: (data: any) => void) => () => void
  }
}

// expose the API to the renderer
const api: HitsAPI = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },
  config: {
    get: (key) => ipcRenderer.invoke('config:get', key),
    set: (key, value) => ipcRenderer.invoke('config:set', key, value),
    getAll: () => ipcRenderer.invoke('config:getAll'),
  },
  dialog: {
    openFile: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
    openFiles: (filters) => ipcRenderer.invoke('dialog:openFiles', filters),
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    saveFile: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  },
  brain: {
    getEdits: () => ipcRenderer.invoke('brain:getEdits'),
    getEditsByCategory: (category) => ipcRenderer.invoke('brain:getEditsByCategory', category),
    getEditsByMode: (mode) => ipcRenderer.invoke('brain:getEditsByMode', mode),
    getModes: () => ipcRenderer.invoke('brain:getModes'),
    rescan: () => ipcRenderer.invoke('brain:rescan'),
    getCount: () => ipcRenderer.invoke('brain:getCount'),
  },
  whisper: {
    transcribe: (videoPath) => ipcRenderer.invoke('whisper:transcribe', videoPath),
    listModels: () => ipcRenderer.invoke('whisper:listModels'),
    isDownloaded: (model) => ipcRenderer.invoke('whisper:isDownloaded', model),
    downloadModel: (model) => ipcRenderer.invoke('whisper:downloadModel', model),
    onProgress: (callback) => {
      const handler = (_: any, data: any) => callback(data)
      ipcRenderer.on('whisper:progress', handler)
      return () => ipcRenderer.removeListener('whisper:progress', handler)
    },
    onDownloadProgress: (callback) => {
      const handler = (_: any, data: any) => callback(data)
      ipcRenderer.on('whisper:downloadProgress', handler)
      return () => ipcRenderer.removeListener('whisper:downloadProgress', handler)
    },
  },
  claude: {
    generateManifest: (transcript, mode, sourceVideo, aspectRatio) => 
      ipcRenderer.invoke('claude:generateManifest', transcript, mode, sourceVideo, aspectRatio),
    // NEW: Listen to progress events from generate!
    onProgress: (callback) => {
      const handler = (_: any, data: any) => callback(data)
      ipcRenderer.on('claude:progress', handler)
      return () => ipcRenderer.removeListener('claude:progress', handler)
    },
  },
  render: {
    start: (manifest, outputPath) => ipcRenderer.invoke('render:start', manifest, outputPath),
    onProgress: (callback) => {
      const handler = (_: any, data: any) => callback(data)
      ipcRenderer.on('render:progress', handler)
      return () => ipcRenderer.removeListener('render:progress', handler)
    },
  },
  assets: {
    listSfx: () => ipcRenderer.invoke('assets:listSfx'),
    listImages: () => ipcRenderer.invoke('assets:listImages'),
    setDir: (dir) => ipcRenderer.invoke('assets:setDir', dir),
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
    showItemInFolder: (path) => ipcRenderer.invoke('shell:showItemInFolder', path),
  },
  edits: {
    openFolder: () => ipcRenderer.invoke('edits:openFolder'),
    addFromCode: (code, meta, category) => ipcRenderer.invoke('edits:addFromCode', code, meta, category),
  },
  folder: {
    listMedia: (folderPath) => ipcRenderer.invoke('folder:listMedia', folderPath),
  },
  transcode: {
    needsConvert: (filePath) => ipcRenderer.invoke('transcode:needsConvert', filePath),
    isFFmpegInstalled: () => ipcRenderer.invoke('transcode:isFFmpegInstalled'),
    convert: (filePath) => ipcRenderer.invoke('transcode:convert', filePath),
    onProgress: (callback) => {
      const handler = (_: any, data: any) => callback(data)
      ipcRenderer.on('transcode:progress', handler)
      return () => ipcRenderer.removeListener('transcode:progress', handler)
    },
  },
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: HitsAPI
  }
}
