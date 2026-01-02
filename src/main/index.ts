// HITS - Electron Main Process
// this is the boss that ties everything together

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import Store from 'electron-store'
import { brain } from '../core/brain'
import { WhisperService } from '../services/whisper'
import { generateEditManifest, VIDEO_MODES } from '../services/claude'
import { renderService, RenderProgress } from '../services/render'
import { glob } from 'glob'

// config store - persists settings
const store = new Store({
  defaults: {
    anthropicApiKey: '',
    whisperModel: 'large-v3',
    outputDir: path.join(app.getPath('documents'), 'Hits', 'output'),
    assetsDir: ''
  }
})

let mainWindow: BrowserWindow | null = null

// create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,  // custom title bar
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // dev or prod mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// app lifecycle
app.whenReady().then(async () => {
  console.log('[hits] starting up...')
  
  // scan edits folder on startup
  await brain.scan()
  console.log('[hits] brain loaded', brain.getCount(), 'edits')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC HANDLERS - these are how the renderer talks to main process

// window controls (for custom title bar)
ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
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
      { name: 'Media Files', extensions: ['mp4', 'mov', 'mkv', 'webm', 'mp3', 'wav', 'ogg'] }
    ]
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })
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
    id: e.meta.id,
    name: e.meta.name,
    category: e.meta.category,
    description: e.meta.description,
    props: e.meta.props,
    triggers: e.meta.triggers,
    modes: e.meta.modes,
    author: e.meta.author,
    version: e.meta.version
  }))
})

ipcMain.handle('brain:getEditsByCategory', (_, category: string) => {
  return brain.getByCategory(category).map(e => e.meta)
})

ipcMain.handle('brain:getEditsByMode', (_, mode: string) => {
  return brain.getForMode(mode).map(e => e.meta)
})

ipcMain.handle('brain:getModes', () => VIDEO_MODES)

ipcMain.handle('brain:rescan', async () => {
  await brain.scan()
  return brain.getCount()
})

ipcMain.handle('brain:getCount', () => brain.getCount())

// whisper transcription
ipcMain.handle('whisper:transcribe', async (_, videoPath: string) => {
  const model = store.get('whisperModel') as string
  const whisper = new WhisperService(model)
  
  mainWindow?.webContents.send('whisper:progress', { stage: 'starting' })
  
  try {
    const result = await whisper.transcribe(videoPath, (stage) => {
      mainWindow?.webContents.send('whisper:progress', { stage })
    })
    mainWindow?.webContents.send('whisper:progress', { stage: 'complete' })
    return { success: true, data: result }
  } catch (err) {
    mainWindow?.webContents.send('whisper:progress', { stage: 'error', error: String(err) })
    return { success: false, error: String(err) }
  }
})

// claude manifest generation
ipcMain.handle('claude:generateManifest', async (_, transcript, mode, sourceVideo) => {
  const apiKey = store.get('anthropicApiKey') as string
  if (!apiKey) {
    return { success: false, error: 'anthropic API key not set - go to settings' }
  }

  try {
    // gather available assets
    const assetsDir = (store.get('assetsDir') as string) || path.join(process.cwd(), 'assets')
    const images = fs.existsSync(path.join(assetsDir, 'images'))
      ? await glob('**/*.{jpg,jpeg,png,webp}', { cwd: path.join(assetsDir, 'images') })
      : []
    const audio = fs.existsSync(path.join(assetsDir, 'sfx'))
      ? await glob('**/*.{wav,mp3}', { cwd: path.join(assetsDir, 'sfx') })
      : []

    const manifest = await generateEditManifest(
      apiKey,
      transcript,
      mode,
      sourceVideo,
      { images, audio }
    )

    return { success: true, data: manifest }
  } catch (err) {
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

// assets handlers
ipcMain.handle('assets:listSfx', async () => {
  const assetsDir = (store.get('assetsDir') as string) || path.join(process.cwd(), 'assets')
  const sfxDir = path.join(assetsDir, 'sfx')
  if (!fs.existsSync(sfxDir)) return []
  return glob('**/*.{wav,mp3}', { cwd: sfxDir })
})

ipcMain.handle('assets:listImages', async () => {
  const assetsDir = (store.get('assetsDir') as string) || path.join(process.cwd(), 'assets')
  const imgDir = path.join(assetsDir, 'images')
  if (!fs.existsSync(imgDir)) return []
  return glob('**/*.{jpg,jpeg,png,webp}', { cwd: imgDir })
})

ipcMain.handle('assets:setDir', async (_, dir: string) => {
  store.set('assetsDir', dir)
  return true
})

// shell handlers
ipcMain.handle('shell:openExternal', async (_, url: string) => {
  await shell.openExternal(url)
})

ipcMain.handle('shell:showItemInFolder', async (_, filePath: string) => {
  shell.showItemInFolder(filePath)
})

// edits folder handler
ipcMain.handle('edits:openFolder', async () => {
  const editsDir = path.join(process.cwd(), 'edits')
  if (!fs.existsSync(editsDir)) {
    fs.mkdirSync(editsDir, { recursive: true })
  }
  shell.showItemInFolder(editsDir)
})

