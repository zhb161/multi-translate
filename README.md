# MultiTranslate

A powerful multi-language simultaneous translation desktop application built with Electron + Vue 3, supporting multiple translation APIs with modern UI and intelligent interaction.

## Language / 语言

- [English](README.md) | [中文](README_CN.md)

## ✨ Core Features

### 🌐 Multi-language Simultaneous Translation
- Single input, simultaneous translation to multiple target languages
- Real-time translation results display, supporting 14 common languages
- Intelligent language detection with automatic source language recognition

### 🔄 Intelligent Clipboard Monitoring
- **Auto Mode**: Automatically translates 3 seconds after copying text, supports manual cancellation
- **Manual Mode**: Detects clipboard changes and fills input box directly, manual translation trigger
- Smart filtering mechanism: Avoids re-detecting translation results, prevents infinite loops

### 🎛️ Flexible Interaction
- **Drag & Drop Sorting**: Adjust translation card display order by dragging icons
- **One-click Copy**: Each translation result provides a copy button for easy use
- **Real-time Preview**: Preview final arrangement during drag operation
- **Toggle Controls**: Auto translation, clipboard monitoring and other features can be controlled independently

### 🖥️ Window Management
- **Always on Top**: Set window to always stay in front
- **Opacity Adjustment**: Adjust window opacity within 0.3-1.0 range
- **Modern UI**: Dark theme, card layout, smooth animations

### 🔌 Multiple API Support
- **Google Translate API** - Most comprehensive language coverage
- **Microsoft Translator** - Enterprise-grade translation quality
- **DeepL API** - Preferred for European languages
- **Baidu Translate API** - Optimized for Chinese translation

## 🌍 Supported Languages

| Language | Code | Flag | Language | Code | Flag |
|----------|------|------|----------|------|------|
| English | en | 🇺🇸 | French | fr | 🇫🇷 |
| Chinese | zh | 🇨🇳 | German | de | 🇩🇪 |
| Japanese | ja | 🇯🇵 | Spanish | es | 🇪🇸 |
| Korean | ko | 🇰🇷 | Italian | it | 🇮🇹 |
| Russian | ru | 🇷🇺 | Portuguese | pt | 🇵🇹 |
| Arabic | ar | 🇸🇦 | Thai | th | 🇹🇭 |
| Vietnamese | vi | 🇻🇳 | Hindi | hi | 🇮🇳 |

## 🚀 Quick Start

### Requirements
- Node.js >= 16.0.0
- npm >= 8.0.0

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

This will start both:
- Electron main process (auto-assigned port)
- Vue development server (http://localhost:3000)

### Build Project
```bash
npm run build
```

### Package Application

#### Windows Executable (.exe)
```bash
# Package as Windows installer (.exe)
npm run dist:win
```

This generates:
- `release/MultiTranslate Setup 1.0.0.exe` - Windows installer
- `release/win-unpacked/` - Unpacked application folder

#### Other Platforms
```bash
# Cross-platform packaging (auto-detects current system)
npm run dist

# Or specify platform
npm run build && electron-builder --mac    # macOS
npm run build && electron-builder --linux  # Linux
```

#### Packaging Configuration
- All packaged files located in `release/` directory
- Windows installer supports custom installation path
- Application icon located at `assets/icon.ico` (prepare this file)
- Installer size approximately 150-200MB (includes Electron runtime)

#### Installation & Usage
1. Download `MultiTranslate Setup 1.0.0.exe`
2. Double-click to run installer
3. Choose installation location (optional)
4. Use after installation completion

## ⚙️ API Configuration

Configure at least one translation service provider before use:

### Google Translate API
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project and enable "Cloud Translation API"
3. Generate API key
4. Enter API key in application settings

### Microsoft Translator
1. Visit [Azure Portal](https://portal.azure.com/)
2. Create "Translator" resource
3. Get subscription key and region information
4. Enter key and region in application settings (default: global)

### DeepL API
1. Visit [DeepL API](https://www.deepl.com/pro#developer)
2. Register developer account
3. Get Authentication Key
4. Enter API key in application settings

### Baidu Translate API
1. Visit [Baidu Translate Open Platform](https://fanyi-api.baidu.com/)
2. Register and complete real-name verification
3. Create application to get APP ID and key
4. Enter APP ID and Secret Key in application settings

## 📖 Usage Instructions

### Basic Translation
1. Enter text to translate in input box
2. Click language tags to select target languages (multiple selection supported)
3. Click "Translate" button or press `Ctrl+Enter` to start translation

### Smart Clipboard
1. **Enable Clipboard Monitoring**: Check "Automatically show translation prompt when copying text" in settings
2. **Auto Translation Mode**:
   - Enable auto translation switch
   - Copy any text, auto-translate after 3 seconds
   - Click "Cancel" button to stop translation
3. **Manual Translation Mode**:
   - Disable auto translation switch
   - Auto-fill input box after copying text
   - Manually click translate button

### Result Management
- **Drag & Drop Sorting**: Click "⋮⋮" icon in top-right corner of card to drag and adjust order
- **Copy Results**: Click "📋" button to copy translation result
- **Real-time Preview**: Preview final arrangement during drag operation

### Window Controls
- **Always on Top**: Click "📌" button to toggle window always-on-top status
- **Opacity**: Drag opacity slider to adjust window transparency
- **Settings**: Click "⚙️" button to open settings panel

## 🏗️ Project Architecture

```
src/
├── main/                   # Electron main process
│   ├── index.ts           # Main process entry, window management, clipboard monitoring
│   ├── preload.ts         # Preload script, IPC communication bridge
│   └── tsconfig.json      # Main process TypeScript config
│
├── renderer/              # Vue 3 renderer process
│   ├── App.vue           # Main application component
│   ├── main.ts           # Renderer process entry
│   ├── index.html        # HTML template
│   ├── style.css         # Global styles
│   │
│   ├── i18n/             # Internationalization
│   │   ├── index.ts      # i18n configuration
│   │   └── locales/      # Language files
│   │       ├── en.json   # English
│   │       └── zh-CN.json# Chinese (Simplified)
│   │
│   ├── stores/           # Pinia state management
│   │   └── appStore.ts   # Application state, settings, translation logic
│   │
│   ├── services/         # Business services
│   │   └── translationService.ts  # Translation service, API integration
│   │
│   └── types/            # TypeScript type definitions
│       └── electron.d.ts # Electron API type declarations
│
├── tsconfig.json         # Root TypeScript configuration
└── vite.config.ts        # Vite build configuration
```

## 🛠️ Tech Stack

### Core Frameworks
- **[Electron 25+](https://www.electronjs.org/)** - Cross-platform desktop application framework
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[TypeScript 5+](https://www.typescriptlang.org/)** - Static type checking

### Development Tools
- **[Vite 4+](https://vitejs.dev/)** - Modern build tool
- **[Pinia](https://pinia.vuejs.org/)** - Vue 3 state management
- **[Vue I18n](https://vue-i18n.intlify.dev/)** - Internationalization framework
- **[Electron Builder](https://www.electron.build/)** - Application packaging tool

### UI Components
- **[Element Plus](https://element-plus.org/)** - Vue 3 component library
- **CSS Variables** - Theme customization
- **CSS Transitions** - Smooth animations

### Network Communication
- **[Axios](https://axios-http.com/)** - HTTP client
- **Native Fetch API** - Backup network request solution

## 🔧 Development Guide

### Code Standards
```bash
# Code linting
npm run lint

# Type checking
npm run type-check
```

### Debugging Tips
1. **Main Process Debugging**: Use VSCode's Node.js debugger
2. **Renderer Process Debugging**: Enable developer tools (F12)
3. **IPC Communication**: Check `window.electronAPI` object in console

### Adding New Translation Service
1. Implement `TranslationProvider` interface in `translationService.ts`
2. Register service in `initializeTranslationServices` in `appStore.ts`
3. Add configuration form in settings interface

## 📝 Changelog

### v1.0.0 (Current Version)
- ✅ Multi-language simultaneous translation
- ✅ Intelligent clipboard monitoring and processing
- ✅ Drag & drop sorting and one-click copy
- ✅ Four major translation API integrations
- ✅ Modern UI design
- ✅ Window management features
- ✅ Internationalization support (English/Chinese)

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

1. Fork this project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## 📄 License

This project is open sourced under [MIT License](LICENSE).

## 🙏 Acknowledgments

Thanks to the following open source projects:
- [Electron](https://www.electronjs.org/) - Cross-platform desktop application development
- [Vue.js](https://vuejs.org/) - Progressive frontend framework
- [Element Plus](https://element-plus.org/) - Vue 3 component library
- [Vite](https://vitejs.dev/) - Next generation frontend build tool
- [Vue I18n](https://vue-i18n.intlify.dev/) - Vue internationalization framework

---

For questions or suggestions, feel free to submit an [Issue](../../issues) or contact the developer.