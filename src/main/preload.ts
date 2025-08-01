import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // 窗口控制
  setAlwaysOnTop: (alwaysOnTop: boolean) => ipcRenderer.invoke('set-always-on-top', alwaysOnTop),
  setOpacity: (opacity: number) => ipcRenderer.invoke('set-opacity', opacity),
  
  // 剪贴板
  getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
  onClipboardText: (callback: (text: string) => void) => {
    ipcRenderer.on('clipboard-text', (event, text) => callback(text))
  },
  onClipboardChanged: (callback: (text: string) => void) => {
    ipcRenderer.on('clipboard-changed', (event, text) => callback(text))
  },
  
  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI