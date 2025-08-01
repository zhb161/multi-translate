export interface ElectronAPI {
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<boolean>
  setOpacity: (opacity: number) => Promise<boolean>
  getClipboardText: () => Promise<string>
  onClipboardText: (callback: (text: string) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}