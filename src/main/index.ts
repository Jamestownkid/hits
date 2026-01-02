// HITS - Electron Main Process
// this is the boss that ties everything together
// NOW WITH PROGRESS EVENTS so users can see what's happening!

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import Store from 'electron-store'
import { brain } from '../core/brain'
import { WhisperService, listModels, downloadModel, isModelDownloaded } from '../services/whisper'
import { generateEditManifest, VIDEO_MODES } from '../services/claude'
import { renderService, RenderProgress } from '../services/render'
import { glob } from 'glob'

// config store - persists settings
const store = new Store({
  defaults: {
    anthropicApiKey: '',
    openaiApiKey: '',
    whisperModel: 'small',  // small is best balance of speed/quality
    outputDir: path.join(app.getPath('documents'), 'Hits', 'output'),
    assetsDir: '',
    aspectRatio: '16:9'
  }
})

let mainWindow: BrowserWindow | null = null

// create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // ALLOW file:// URLs for video playback
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// app lifecycle
app.whenReady().then(async () => {
  console.log('[hits] starting up...')
  
  await brain.scan()
  console.log('[hits] brain loaded', brain.getCount(), 'edits')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC HANDLERS

// window controls
ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
  return mainWindow?.isMaximized()
})
ipcMain.handle('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized())

// config handlers
ipcMain.handle('config:get', (_, key: string) => store.get(key))
ipcMain.handle('config:set', (_, key: string, value: any) => store.set(key, value))
ipcMain.handle('config:getAll', () => store.store)

// file dialogs
ipcMain.handle('dialog:openFile', async (_, filters) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: filters || [
      { name: 'Media Files', extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv', 'm4v', 'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'] }
    ]
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:openFiles', async (_, filters) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: filters || [
      { name: 'Media Files', extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'mp3', 'wav', 'ogg'] }
    ]
  })
  return result.canceled ? [] : result.filePaths
})

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, { properties: ['openDirectory'] })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:saveFile', async (_, defaultName: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultName,
    filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
  })
  return result.canceled ? null : result.filePath
})

// brain/edits handlers
ipcMain.handle('brain:getEdits', () => {
  return brain.getAll().map(e => ({
    id: e.meta.id, name: e.meta.name, category: e.meta.category,
    description: e.meta.description, props: e.meta.props,
    triggers: e.meta.triggers, modes: e.meta.modes,
    author: e.meta.author, version: e.meta.version
  }))
})
ipcMain.handle('brain:getEditsByCategory', (_, category: string) => brain.getByCategory(category).map(e => e.meta))
ipcMain.handle('brain:getEditsByMode', (_, mode: string) => brain.getForMode(mode).map(e => e.meta))
ipcMain.handle('brain:getModes', () => VIDEO_MODES)
ipcMain.handle('brain:rescan', async () => { await brain.scan(); return brain.getCount() })
ipcMain.handle('brain:getCount', () => brain.getCount())

// WHISPER MODEL MANAGEMENT
ipcMain.handle('whisper:listModels', () => listModels())
ipcMain.handle('whisper:isDownloaded', (_, model: string) => isModelDownloaded(model))

ipcMain.handle('whisper:downloadModel', async (_, model: string) => {
  // whisper downloads models automatically on first use
  mainWindow?.webContents.send('whisper:downloadProgress', { model, percent: 100 })
  return { success: true, path: model }
})

// whisper transcription
ipcMain.handle('whisper:transcribe', async (_, videoPath: string) => {
  const model = store.get('whisperModel') as string
  const openaiKey = store.get('openaiApiKey') as string
  const whisper = new WhisperService(model)
  
  mainWindow?.webContents.send('whisper:progress', { stage: 'starting' })
  
  try {
    const result = await whisper.transcribe(videoPath, (stage) => {
      mainWindow?.webContents.send('whisper:progress', { stage })
    }, openaiKey)
    mainWindow?.webContents.send('whisper:progress', { stage: 'complete' })
    return { success: true, data: result }
  } catch (err) {
    mainWindow?.webContents.send('whisper:progress', { stage: 'error', error: String(err) })
    return { success: false, error: String(err) }
  }
})

// claude manifest generation - NOW WITH PROGRESS EVENTS!
ipcMain.handle('claude:generateManifest', async (_, transcript, mode, sourceVideo, aspectRatio) => {
  const apiKey = store.get('anthropicApiKey') as string
  if (!apiKey) {
    mainWindow?.webContents.send('claude:progress', { stage: 'error', error: 'Claude API key not set' })
    return { success: false, error: 'Claude API key not set - go to Settings' }
  }

  try {
    // STAGE 1: Starting
    mainWindow?.webContents.send('claude:progress', { stage: 'starting' })
    
    const assetsDir = (store.get('assetsDir') as string) || path.join(process.cwd(), 'assets')
    
    // STAGE 2: Scanning assets
    mainWindow?.webContents.send('claude:progress', { stage: 'scanning_assets', assetsDir })
    
    // Scan ANY folder for assets - auto-detect by file extension
    let images: string[] = []
    let audio: string[] = []
    let videos: string[] = []
    
    if (fs.existsSync(assetsDir)) {
      // Recursively find all media files regardless of folder structure
      images = await glob('**/*.{jpg,jpeg,png,webp,gif}', { cwd: assetsDir })
      audio = await glob('**/*.{wav,mp3,ogg,m4a,aac}', { cwd: assetsDir })
      videos = await glob('**/*.{mp4,mov,webm,mkv,avi}', { cwd: assetsDir })
      
      console.log('[assets] found:', images.length, 'images,', audio.length, 'audio,', videos.length, 'videos')
    }
    
    // STAGE 3: Assets scanned
    mainWindow?.webContents.send('claude:progress', { 
      stage: 'assets_scanned', 
      images: images.length, 
      audio: audio.length, 
      videos: videos.length 
    })

    // STAGE 4: Generating manifest
    mainWindow?.webContents.send('claude:progress', { stage: 'generating_manifest' })
    
    const manifest = await generateEditManifest(apiKey, transcript, mode, sourceVideo, { images, audio, videos })
    
    // apply aspect ratio
    const ratio = aspectRatio || store.get('aspectRatio') || '16:9'
    if (ratio === '9:16') {
      manifest.width = 1080
      manifest.height = 1920
    } else if (ratio === '1:1') {
      manifest.width = 1080
      manifest.height = 1080
    } else if (ratio === '4:3') {
      manifest.width = 1440
      manifest.height = 1080
    }
    
    // STAGE 5: Complete!
    mainWindow?.webContents.send('claude:progress', { stage: 'complete' })
    
    return { success: true, data: manifest }
  } catch (err) {
    mainWindow?.webContents.send('claude:progress', { stage: 'error', error: String(err) })
    return { success: false, error: String(err) }
  }
})

// render video
ipcMain.handle('render:start', async (_, manifest, outputPath) => {
  try {
    await renderService.render(manifest, outputPath, (progress: RenderProgress) => {
      mainWindow?.webContents.send('render:progress', progress)
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// assets handlers - scan ANY folder for media files
ipcMain.handle('assets:listSfx', async () => {
  const assetsDir = (store.get('assetsDir') as string) || ''
  if (!assetsDir || !fs.existsSync(assetsDir)) return []
  return glob('**/*.{wav,mp3,ogg,m4a,aac}', { cwd: assetsDir })
})

ipcMain.handle('assets:listImages', async () => {
  const assetsDir = (store.get('assetsDir') as string) || path.join(process.cwd(), 'assets')
  const imgDir = path.join(assetsDir, 'images')
  if (!fs.existsSync(imgDir)) return []
  return glob('**/*.{jpg,jpeg,png,webp}', { cwd: imgDir })
})

ipcMain.handle('assets:setDir', async (_, dir: string) => { store.set('assetsDir', dir); return true })

// shell handlers
ipcMain.handle('shell:openExternal', async (_, url: string) => shell.openExternal(url))
ipcMain.handle('shell:showItemInFolder', async (_, filePath: string) => shell.showItemInFolder(filePath))

// edits folder handler
ipcMain.handle('edits:openFolder', async () => {
  const editsDir = path.join(process.cwd(), 'edits')
  if (!fs.existsSync(editsDir)) fs.mkdirSync(editsDir, { recursive: true })
  shell.showItemInFolder(editsDir)
})

// add edit from code (paste feature)
ipcMain.handle('edits:addFromCode', async (_, editCode: string, metaJson: string, category: string) => {
  try {
    const meta = JSON.parse(metaJson)
    if (!meta.id) return { success: false, error: 'Meta JSON needs an "id" field' }
    
    const editsDir = path.join(process.cwd(), 'edits', category)
    if (!fs.existsSync(editsDir)) fs.mkdirSync(editsDir, { recursive: true })
    
    const tsxPath = path.join(editsDir, `${meta.id}.tsx`)
    const jsonPath = path.join(editsDir, `${meta.id}.meta.json`)
    
    fs.writeFileSync(tsxPath, editCode)
    fs.writeFileSync(jsonPath, JSON.stringify(meta, null, 2))
    
    await brain.scan()  // rescan to pick up new edit
    
    return { success: true, id: meta.id }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// list files in a folder (for batch processing)
ipcMain.handle('folder:listMedia', async (_, folderPath: string) => {
  if (!fs.existsSync(folderPath)) return []
  const mediaExts = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'mp3', 'wav', 'ogg']
  const files = fs.readdirSync(folderPath)
  return files
    .filter(f => mediaExts.includes(f.split('.').pop()?.toLowerCase() || ''))
    .map(f => path.join(folderPath, f))
})
