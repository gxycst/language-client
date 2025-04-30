import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as path from "node:path";
const { machineIdSync } = require('node-machine-id')
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://taqgurcocnamesqzuytt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcWd1cmNvY25hbWVzcXp1eXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDk1OTksImV4cCI6MjA2MTEyNTU5OX0.cXJqPeBFlQNKPTMHm7_eTcPB_27psHpPUOoh2Qfpw8A')
async function checkActivation(page = 1, pageSize = 10) {
  const code = machineIdSync({ original: true })
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' }) // 这里会返回总条数，方便计算总页数
    .order('created_at', { ascending: false })
    .range(from, to)
  query = query.ilike('code', `%${code}%`)
  const { data, error } = await query
  if (error) {
    console.error('查询失败:', error)
    return false
  }
  if (data && data.length) {
    return data[0].active
  } else {
    return false
  }
}

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    fullscreen: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  let activated = await checkActivation()
  console.log('is active',activated);
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = activated
      ? `${process.env['ELECTRON_RENDERER_URL']}#/activated`
      : `${process.env['ELECTRON_RENDERER_URL']}#/not-activated`
    mainWindow.loadURL(url)
  } else {
    const url = activated
      ? `file://${path.join(__dirname, '../renderer/index.html')}#/activated`
      : `file://${path.join(__dirname, '../renderer/index.html')}#/not-activated`
    mainWindow.loadFile(join(__dirname, url))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
