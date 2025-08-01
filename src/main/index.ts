import { app, BrowserWindow, globalShortcut, clipboard, ipcMain, Menu } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#1a1a1a'
  })

  const isDev = !app.isPackaged
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  // 剪贴板监听逻辑
  let lastClipboardContent = ''
  let clipboardCheckInterval: NodeJS.Timeout
  
  const checkClipboardChange = () => {
    try {
      const currentClipboard = clipboard.readText()
      // 检测到剪贴板变化且内容非空
      if (currentClipboard !== lastClipboardContent && currentClipboard.trim()) {
        lastClipboardContent = currentClipboard
        
        // 发送剪贴板变化事件给渲染进程
        if (mainWindow) {
          mainWindow.webContents.send('clipboard-changed', currentClipboard)
        }
      }
    } catch (error) {
      // 忽略剪贴板读取错误
    }
  }
  
  // 每200ms检查一次剪贴板变化
  clipboardCheckInterval = setInterval(checkClipboardChange, 200)
  
  // 清理定时器
  app.on('before-quit', () => {
    if (clipboardCheckInterval) {
      clearInterval(clipboardCheckInterval)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC 处理程序
ipcMain.handle('set-always-on-top', (event, alwaysOnTop: boolean) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(alwaysOnTop)
    return true
  }
  return false
})

ipcMain.handle('set-opacity', (event, opacity: number) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity)
    return true
  }
  return false
})

ipcMain.handle('get-clipboard-text', () => {
  return clipboard.readText()
})

// 隐藏菜单栏
Menu.setApplicationMenu(null)