# MultiTranslate

一个功能强大的多语言同步翻译桌面应用，基于 Electron + Vue 3 构建，支持多个翻译API，具有现代化的界面和智能的交互体验。

## ✨ 核心功能

### 🌐 多语言同步翻译
- 一次输入，同时翻译到多种目标语言
- 实时显示翻译结果，支持14种常用语言
- 智能语言检测，自动识别源语言

### 🔄 智能剪贴板监听
- **自动模式**：复制文本后3秒内自动翻译，支持手动取消
- **手动模式**：检测到剪贴板变化后直接填入输入框，手动触发翻译
- 智能过滤机制：避免翻译结果被重复检测，防止无限循环

### 🎛️ 灵活的交互方式
- **拖拽排序**：通过拖拽图标调整翻译卡片显示顺序
- **一键复制**：每个翻译结果都提供复制按钮，便于使用
- **实时预览**：拖拽过程中实时预览最终排列效果
- **开关控制**：自动翻译、剪贴板监听等功能均可独立控制

### 🖥️ 窗口管理
- **窗口置顶**：可设置窗口始终保持在最前面
- **透明度调节**：0.3-1.0范围内调整窗口透明度
- **现代化UI**：深色主题，卡片式布局，流畅动画效果

### 🔌 多API支持
- **Google Translate API** - 覆盖语言最全面
- **Microsoft Translator** - 企业级翻译质量
- **DeepL API** - 欧洲语言翻译首选
- **百度翻译API** - 中文翻译优化

## 🌍 支持的语言

| 语言 | 代码 | 国旗 | 语言 | 代码 | 国旗 |
|------|------|------|------|------|------|
| 英语 | en | 🇺🇸 | 法语 | fr | 🇫🇷 |
| 中文 | zh | 🇨🇳 | 德语 | de | 🇩🇪 |
| 日语 | ja | 🇯🇵 | 西班牙语 | es | 🇪🇸 |
| 韩语 | ko | 🇰🇷 | 意大利语 | it | 🇮🇹 |
| 俄语 | ru | 🇷🇺 | 葡萄牙语 | pt | 🇵🇹 |
| 阿拉伯语 | ar | 🇸🇦 | 泰语 | th | 🇹🇭 |
| 越南语 | vi | 🇻🇳 | 印地语 | hi | 🇮🇳 |

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

这会同时启动：
- Electron 主进程（端口自动分配）
- Vue 开发服务器（http://localhost:3000）

### 构建项目
```bash
npm run build
```

### 打包应用

#### Windows 安装包 (.exe)
```bash
# 打包为 Windows 安装程序 (.exe)
npm run dist:win
```

这会生成以下文件：
- `release/MultiTranslate Setup 1.0.0.exe` - Windows 安装程序
- `release/win-unpacked/` - 未打包的应用文件夹

#### 其他平台打包
```bash
# 跨平台打包（根据当前系统自动选择）
npm run dist

# 或者指定特定平台
npm run build && electron-builder --mac    # macOS
npm run build && electron-builder --linux  # Linux
```

#### 打包配置说明
- 所有打包文件位于 `release/` 目录
- Windows 安装包支持自定义安装路径
- 应用图标位于 `assets/icon.ico`（需要准备此文件）
- 安装包大小约 150-200MB（包含 Electron 运行时）

#### 安装与使用
1. 下载 `MultiTranslate Setup 1.0.0.exe`
2. 双击运行安装程序
3. 选择安装位置（可选）
4. 完成安装后即可使用

## ⚙️ API 配置

使用前需要配置至少一个翻译服务提供商：

### Google Translate API
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目并启用 "Cloud Translation API"
3. 生成 API 密钥
4. 在应用设置中输入 API 密钥

### Microsoft Translator
1. 访问 [Azure Portal](https://portal.azure.com/)
2. 创建 "Translator" 资源
3. 获取订阅密钥和区域信息
4. 在应用设置中输入密钥和区域（默认：global）

### DeepL API
1. 访问 [DeepL API](https://www.deepl.com/pro#developer)
2. 注册开发者账户
3. 获取 Authentication Key
4. 在应用设置中输入 API 密钥

### 百度翻译API
1. 访问 [百度翻译开放平台](https://fanyi-api.baidu.com/)
2. 注册并实名认证
3. 创建应用获取 APP ID 和密钥
4. 在应用设置中输入 APP ID 和 Secret Key

## 📖 使用说明

### 基本翻译
1. 在输入框中输入要翻译的文本
2. 点击语言标签选择目标语言（支持多选）
3. 点击"翻译"按钮或按 `Ctrl+Enter` 开始翻译

### 智能剪贴板
1. **启用剪贴板监听**：在设置中勾选"复制文本时自动显示翻译提示"
2. **自动翻译模式**：
   - 开启自动翻译开关
   - 复制任意文本，3秒后自动翻译
   - 可点击"取消"按钮终止翻译
3. **手动翻译模式**：
   - 关闭自动翻译开关
   - 复制文本后自动填入输入框
   - 手动点击翻译按钮

### 结果管理
- **拖拽排序**：点击卡片右上角的"⋮⋮"图标拖拽调整顺序
- **复制结果**：点击"📋"按钮复制翻译结果
- **实时预览**：拖拽过程中可预览最终排列效果

### 窗口控制
- **置顶**：点击"📌"按钮切换窗口置顶状态
- **透明度**：拖动透明度滑块调整窗口透明度
- **设置**：点击"⚙️"按钮打开设置面板

## 🏗️ 项目架构

```
src/
├── main/                   # Electron 主进程
│   ├── index.ts           # 主进程入口，窗口管理，剪贴板监听
│   ├── preload.ts         # 预加载脚本，IPC 通信桥接
│   └── tsconfig.json      # 主进程 TypeScript 配置
│
├── renderer/              # Vue 3 渲染进程
│   ├── App.vue           # 主应用组件
│   ├── main.ts           # 渲染进程入口
│   ├── index.html        # HTML 模板
│   ├── style.css         # 全局样式
│   │
│   ├── stores/           # Pinia 状态管理
│   │   └── appStore.ts   # 应用状态，设置，翻译逻辑
│   │
│   ├── services/         # 业务服务
│   │   └── translationService.ts  # 翻译服务，API 集成
│   │
│   └── types/            # TypeScript 类型定义
│       └── electron.d.ts # Electron API 类型声明
│
├── tsconfig.json         # 根 TypeScript 配置
└── vite.config.ts        # Vite 构建配置
```

## 🛠️ 技术栈

### 核心框架
- **[Electron 25+](https://www.electronjs.org/)** - 跨平台桌面应用框架
- **[Vue 3](https://vuejs.org/)** - 渐进式 JavaScript 框架
- **[TypeScript 5+](https://www.typescriptlang.org/)** - 静态类型检查

### 开发工具
- **[Vite 4+](https://vitejs.dev/)** - 现代化构建工具
- **[Pinia](https://pinia.vuejs.org/)** - Vue 3 状态管理
- **[Electron Builder](https://www.electron.build/)** - 应用打包工具

### UI 组件
- **[Element Plus](https://element-plus.org/)** - Vue 3 组件库
- **CSS Variables** - 主题定制
- **CSS Transitions** - 流畅动画效果

### 网络通信
- **[Axios](https://axios-http.com/)** - HTTP 客户端
- **原生 Fetch API** - 备用网络请求方案

## 🔧 开发指南

### 代码规范
```bash
# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 调试技巧
1. **主进程调试**：使用 VSCode 的 Node.js 调试器
2. **渲染进程调试**：开启开发者工具（F12）
3. **IPC 通信**：在控制台查看 `window.electronAPI` 对象

### 新增翻译服务
1. 在 `translationService.ts` 中实现 `TranslationProvider` 接口
2. 在 `appStore.ts` 的 `initializeTranslationServices` 中注册服务
3. 在设置界面添加配置表单

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 多语言同步翻译功能
- ✅ 智能剪贴板监听与处理
- ✅ 拖拽排序和一键复制
- ✅ 四大翻译API集成
- ✅ 现代化UI设计
- ✅ 窗口管理功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目：
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用开发
- [Vue.js](https://vuejs.org/) - 渐进式前端框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

如有问题或建议，欢迎提交 [Issue](../../issues) 或联系开发者。