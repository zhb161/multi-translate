<template>
  <div class="app-container">
    <!-- 控制面板 -->
    <div class="controls">
      <button 
        class="control-btn"
        :class="{ active: store.settings.alwaysOnTop }"
        @click="toggleAlwaysOnTop"
        title="置顶窗口"
      >
        📌
      </button>
      
      <div class="opacity-control">
        <label>透明度</label>
        <input 
          type="range" 
          class="opacity-slider"
          min="0.3" 
          max="1" 
          step="0.1"
          :value="store.settings.opacity"
          @input="updateOpacity"
        />
      </div>

      <!-- 自动翻译开关 -->
      <div class="auto-translate-control">
        <label class="switch-label">自动翻译</label>
        <div class="switch" :class="{ active: store.settings.autoTranslate }" @click="toggleAutoTranslate">
          <div class="switch-handle"></div>
        </div>
      </div>
      
      <button 
        class="control-btn"
        @click="showSettings = !showSettings"
        title="设置"
      >
        ⚙️
      </button>
    </div>

    <!-- 主内容区域 -->
    <div class="header">
      <h1 class="app-title">MultiTranslate</h1>
      <p class="app-subtitle">多语言同步翻译工具</p>
    </div>

    <!-- 输入区域 -->
    <div class="input-section">
      <div class="input-container">
        <textarea
          v-model="store.inputText"
          class="text-input"
          placeholder="输入要翻译的文本，或复制文本后按空格键翻译..."
          @keydown.ctrl.enter="handleTranslate"
        ></textarea>
        
        <button 
          class="translate-btn"
          @click="handleTranslate"
          :disabled="store.isTranslating || !store.inputText.trim()"
        >
          {{ store.isTranslating ? '翻译中...' : '翻译' }}
        </button>
      </div>
      
      <!-- 语言选择 -->
      <div class="language-selector">
        <div class="language-chips">
          <div 
            v-for="lang in store.availableLanguages"
            :key="lang.code"
            class="language-chip"
            :class="{ active: store.settings.selectedLanguages.includes(lang.code) }"
            @click="store.toggleLanguage(lang.code)"
          >
            <span class="flag">{{ lang.flag }}</span>
            <span class="name">{{ lang.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 翻译结果区域 -->
    <div class="results-section">
      <div class="results-grid" v-if="store.displayCards.length > 0">
        <transition-group name="card" tag="div" class="card-grid">
          <div 
            v-for="(card, index) in previewCards"
            :key="card.language"
            class="result-card"
            @dragover="onDragOver(index, $event)"
            @drop="onDrop(index, $event)"
            @dragleave="onDragLeave"
            :class="{ 
              'dragging': draggedIndex !== -1 && card.language === store.displayCards[draggedIndex]?.language,
              'drag-over': dragOverIndex === index 
            }"
          >
          <div class="language-title">
            <div class="title-left">
              <span class="language-flag">{{ card.flag }}</span>
              <span>{{ card.languageName }}</span>
            </div>
            <div class="title-actions">
              <button 
                class="drag-handle"
                draggable="true"
                @dragstart="onDragStart(card.language, $event)"
                @dragend="onDragEnd"
                title="拖拽排序"
              >
                ⋮⋮
              </button>
              <button 
                class="copy-btn"
                @click="copyTranslation(card.text)"
                :disabled="!card.text"
                title="复制翻译结果"
              >
                📋
              </button>
            </div>
          </div>
          
          <div 
            class="translation-text"
            :class="{ 
              loading: card.isLoading,
              error: card.error 
            }"
          >
            <div v-if="card.error" class="error-message">
              {{ card.error }}
            </div>
            <div v-else-if="card.isLoading" class="loading-message">
              翻译中...
            </div>
            <div v-else-if="card.text" class="result-text">
              {{ card.text }}
            </div>
            <div v-else class="placeholder-text">
              等待翻译...
              </div>
            </div>
          </div>
        </transition-group>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">🌐</div>
        <p>选择要翻译的语言</p>
        <p class="hint">点击上方语言标签开始</p>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="settings-overlay" @click="showSettings = false">
      <div class="settings-panel" @click.stop>
        <h3>设置</h3>
        
        <!-- API 配置 -->
        <div class="settings-section">
          <h4>翻译服务配置</h4>
          
          <div class="provider-config">
            <label>Google Translate API Key:</label>
            <input 
              v-model="tempApiConfig.google!.apiKey"
              type="password" 
              placeholder="输入Google API密钥"
            />
          </div>
          
          <div class="provider-config">
            <label>Microsoft Translator:</label>
            <input 
              v-model="tempApiConfig.microsoft!.apiKey"
              type="password" 
              placeholder="输入Microsoft API密钥"
            />
            <input 
              v-model="tempApiConfig.microsoft!.region"
              type="text" 
              placeholder="区域 (默认: global)"
            />
          </div>
          
          <div class="provider-config">
            <label>DeepL API Key:</label>
            <input 
              v-model="tempApiConfig.deepl!.apiKey"
              type="password" 
              placeholder="输入DeepL API密钥"
            />
          </div>
          
          <div class="provider-config">
            <label>百度翻译:</label>
            <input 
              v-model="tempApiConfig.baidu!.appId"
              type="text" 
              placeholder="输入百度APP ID"
            />
            <input 
              v-model="tempApiConfig.baidu!.secretKey"
              type="password" 
              placeholder="输入百度密钥"
            />
          </div>
        </div>

        <!-- API选择 -->
        <div class="settings-section">
          <h4>翻译API选择</h4>
          <div class="provider-selector">
            <label>选择翻译服务:</label>
            <select v-model="tempSettings.currentProvider" class="provider-select">
              <option value="">请选择翻译服务</option>
              <option value="Google Translate">Google Translate</option>
              <option value="Microsoft Translator">Microsoft Translator</option>
              <option value="DeepL Translator">DeepL Translator</option>
              <option value="百度翻译">百度翻译</option>
            </select>
          </div>
        </div>

        <!-- 其他设置 -->
        <div class="settings-section">
          <h4>其他设置</h4>
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="tempSettings.autoTranslateOnClipboard"
            />
            复制文本时自动显示翻译提示
          </label>
        </div>

        <div class="settings-actions">
          <button @click="saveSettings" class="save-btn">保存</button>
          <button @click="showSettings = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 翻译确认提示框 -->
    <div v-if="showTranslatePrompt" class="translate-prompt-overlay">
      <div class="translate-prompt">
        <div class="prompt-content">
          <div class="prompt-text">检测到剪贴板内容变化</div>
          <div class="prompt-preview">{{ clipboardPreview }}</div>
          <div class="prompt-actions">
            <button 
              v-if="!store.settings.autoTranslate" 
              class="prompt-btn translate-btn" 
              @click="confirmTranslate"
            >
              翻译
            </button>
            <button 
              v-else 
              class="prompt-btn cancel-btn" 
              @click="hidePrompt"
            >
              取消
            </button>
            <span class="prompt-hint" v-if="store.settings.autoTranslate">
              {{ Math.ceil(countdownPercent / 100 * 3) }}秒后自动翻译
            </span>
            <span class="prompt-hint" v-else>
              点击翻译按钮开始翻译
            </span>
          </div>
        </div>
        <div class="prompt-countdown">
          <div class="countdown-bar" :style="{ width: countdownPercent + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="copy-success-toast">
      已复制到剪贴板 ✓
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useAppStore } from './stores/appStore'
import type { ApiConfig, AppSettings } from './stores/appStore'

const store = useAppStore()
const showSettings = ref(false)
const showTranslatePrompt = ref(false)
const clipboardPreview = ref('')
const clipboardText = ref('')
const countdownPercent = ref(100)
let promptTimeout: NodeJS.Timeout | null = null
let countdownInterval: NodeJS.Timeout | null = null

// 拖拽相关状态
const draggedIndex = ref(-1)
const dragOverIndex = ref(-1)

// 用于预览的卡片排序
const previewCards = computed(() => {
  if (draggedIndex.value === -1 || dragOverIndex.value === -1) {
    return store.displayCards
  }
  
  const cards = [...store.displayCards]
  const draggedCard = cards[draggedIndex.value]
  
  // 移除拖拽的卡片
  cards.splice(draggedIndex.value, 1)
  // 在新位置插入
  cards.splice(dragOverIndex.value, 0, draggedCard)
  
  return cards
})

// 剪贴板过滤机制
const ignoreClipboardUntil = ref(0)
const lastTranslationResults = ref<string[]>([])
const showCopySuccess = ref(false)

const tempApiConfig = ref<ApiConfig>({
  google: { apiKey: '' },
  microsoft: { apiKey: '', region: 'global' },
  deepl: { apiKey: '' },
  baidu: { appId: '', secretKey: '' }
})
const tempSettings = ref<AppSettings>({
  selectedLanguages: [],
  alwaysOnTop: false,
  opacity: 1,
  autoTranslateOnClipboard: true,
  autoTranslate: false,
  currentProvider: ''
})

const handleTranslate = () => {
  store.translate()
}

const toggleAlwaysOnTop = () => {
  store.setAlwaysOnTop(!store.settings.alwaysOnTop)
}

const updateOpacity = (event: Event) => {
  const target = event.target as HTMLInputElement
  store.setOpacity(parseFloat(target.value))
}

const toggleAutoTranslate = () => {
  store.updateSettings({ autoTranslate: !store.settings.autoTranslate })
}

const saveSettings = () => {
  store.updateApiConfig(tempApiConfig.value)
  store.updateSettings(tempSettings.value)
  // 设置当前API提供商
  if (tempSettings.value.currentProvider) {
    store.setProvider(tempSettings.value.currentProvider)
  }
  showSettings.value = false
}

// 处理剪贴板内容变化
const handleClipboardContent = (text: string) => {
  if (!store.settings.autoTranslateOnClipboard) {
    return
  }
  
  // 检查是否在忽略窗口内
  if (Date.now() < ignoreClipboardUntil.value) {
    return
  }
  
  // 检查是否是已有的翻译结果
  if (lastTranslationResults.value.includes(text)) {
    return
  }
  
  if (store.settings.autoTranslate) {
    // 自动翻译模式：显示弹窗倒计时
    showPrompt(text)
  } else {
    // 手动翻译模式：直接填入输入框
    store.inputText = text
    // 聚焦到输入框（如果需要的话）
    const textInput = document.querySelector('.text-input') as HTMLTextAreaElement
    if (textInput) {
      textInput.focus()
    }
  }
}

// 显示翻译提示框（仅自动翻译模式使用）
const showPrompt = (text: string) => {
  if (showTranslatePrompt.value) {
    return
  }
  
  // 保存完整文本和截取预览文本
  clipboardText.value = text
  clipboardPreview.value = text.length > 50 ? text.substring(0, 50) + '...' : text
  showTranslatePrompt.value = true
  countdownPercent.value = 100
  
  // 3秒倒计时
  const COUNTDOWN_DURATION = 3000
  const COUNTDOWN_INTERVAL = 50
  let elapsed = 0
  
  countdownInterval = setInterval(() => {
    elapsed += COUNTDOWN_INTERVAL
    countdownPercent.value = 100 - (elapsed / COUNTDOWN_DURATION) * 100
    
    if (elapsed >= COUNTDOWN_DURATION) {
      confirmTranslate()
    }
  }, COUNTDOWN_INTERVAL)
  
  promptTimeout = setTimeout(() => {
    confirmTranslate()
  }, COUNTDOWN_DURATION)
}

// 隐藏提示框
const hidePrompt = () => {
  showTranslatePrompt.value = false
  if (promptTimeout) {
    clearTimeout(promptTimeout)
    promptTimeout = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// 确认翻译
const confirmTranslate = () => {
  if (showTranslatePrompt.value) {
    // 使用原始剪贴板文本，而不是截断的预览文本
    const fullText = clipboardText.value || clipboardPreview.value
    store.handleClipboardText(fullText)
    hidePrompt()
  }
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (!showTranslatePrompt.value) return
  
  if (event.code === 'Space') {
    event.preventDefault()
    confirmTranslate()
  } else if (event.code === 'Escape') {
    event.preventDefault()
    hidePrompt()
  }
}

// 拖拽处理方法
const onDragStart = (language: string, event: DragEvent) => {
  draggedIndex.value = store.displayCards.findIndex(card => card.language === language)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', language)
  }
}

const onDragOver = (hoverIndex: number, event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  
  // 更新悬停索引用于预览
  if (draggedIndex.value !== -1) {
    dragOverIndex.value = hoverIndex
  }
}

const onDragLeave = () => {
  // 可以在这里处理拖拽离开事件，但通常不需要重置 dragOverIndex
  // 因为 onDragOver 会持续更新它
}

const onDrop = (dropIndex: number, event: DragEvent) => {
  event.preventDefault()
  const dragIndex = draggedIndex.value
  
  if (dragIndex !== -1 && dragIndex !== dropIndex) {
    // 重新排列语言顺序
    const newOrder = [...store.settings.selectedLanguages]
    const draggedLang = newOrder[dragIndex]
    
    // 移除拖拽的元素
    newOrder.splice(dragIndex, 1)
    // 在新位置插入
    newOrder.splice(dropIndex, 0, draggedLang)
    
    // 更新设置
    store.updateSettings({ selectedLanguages: newOrder })
  }
  
  // 重置拖拽状态
  draggedIndex.value = -1
  dragOverIndex.value = -1
}

const onDragEnd = () => {
  draggedIndex.value = -1
  dragOverIndex.value = -1
}

// 复制翻译内容
const copyTranslation = async (text: string) => {
  if (!text) return
  
  try {
    // 设置忽略窗口：接下来500ms内忽略剪贴板变化
    ignoreClipboardUntil.value = Date.now() + 500
    
    // 执行复制
    await navigator.clipboard.writeText(text)
    
    // 显示复制成功提示
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：使用传统方法复制
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      showCopySuccess.value = true
      setTimeout(() => {
        showCopySuccess.value = false
      }, 2000)
    } catch (fallbackError) {
      console.error('复制完全失败:', fallbackError)
    }
  }
}

// 剪贴板监听
onMounted(() => {
  store.loadSettings()
  
  // 设置临时配置为当前配置
  tempApiConfig.value = {
    google: { apiKey: store.apiConfig.google?.apiKey || '' },
    microsoft: { 
      apiKey: store.apiConfig.microsoft?.apiKey || '', 
      region: store.apiConfig.microsoft?.region || 'global' 
    },
    deepl: { apiKey: store.apiConfig.deepl?.apiKey || '' },
    baidu: { 
      appId: store.apiConfig.baidu?.appId || '', 
      secretKey: store.apiConfig.baidu?.secretKey || '' 
    }
  }
  tempSettings.value = { ...store.settings }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
  
  // 监听翻译结果变化，更新过滤列表
  watch(() => store.translationResults, (newResults) => {
    lastTranslationResults.value = newResults.map(r => r.text).filter(Boolean)
  }, { deep: true })
  
  if (window.electronAPI) {
    // 保持原有的剪贴板文本处理
    window.electronAPI.onClipboardText((text: string) => {
      store.handleClipboardText(text)
    })
    
    // 新增：剪贴板变化监听
    window.electronAPI.onClipboardChanged((text: string) => {
      handleClipboardContent(text)
    })
  }
})

onUnmounted(() => {
  // 清理定时器
  hidePrompt()
  
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)
  
  if (window.electronAPI) {
    window.electronAPI.removeAllListeners('clipboard-text')
    window.electronAPI.removeAllListeners('clipboard-changed')
  }
})
</script>

<style scoped>
.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.app-subtitle {
  color: var(--text-secondary);
  text-align: center;
  margin: 8px 0 0 0;
  font-size: 1rem;
}

.language-selector {
  margin-top: 16px;
}

.language-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.language-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--background-dark);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.language-chip:hover {
  border-color: var(--primary-color);
}

.language-chip.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.flag {
  font-size: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.hint {
  font-size: 0.9rem;
  margin-top: 8px;
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.settings-panel {
  background: var(--card-background);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h4 {
  margin-bottom: 12px;
  color: var(--primary-color);
}

.provider-config {
  margin-bottom: 12px;
}

.provider-config label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.provider-config input {
  width: 100%;
  padding: 8px 12px;
  background: var(--background-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.provider-selector {
  margin-bottom: 12px;
}

.provider-selector label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.provider-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--background-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
}

.provider-select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.settings-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background: var(--primary-color);
  color: white;
}

.cancel-btn {
  background: var(--border-color);
  color: var(--text-primary);
}

.opacity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.opacity-control label {
  color: var(--text-secondary);
}

.auto-translate-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.switch-label {
  color: var(--text-secondary);
  font-size: 12px;
}

.switch {
  position: relative;
  width: 44px;
  height: 22px;
  background: var(--border-color);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch.active {
  background: var(--primary-color);
}

.switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch.active .switch-handle {
  transform: translateX(22px);
}

.error-message {
  color: #ef4444;
  font-style: italic;
}

.loading-message {
  color: var(--text-secondary);
  font-style: italic;
}

.placeholder-text {
  color: var(--text-secondary);
  font-style: italic;
  opacity: 0.7;
}

.result-text {
  color: var(--text-primary);
}

.result-card {
  transition: all 0.3s ease;
  cursor: default;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.result-card.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.result-card.drag-over {
  border: 2px dashed var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
}

.language-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-actions {
  display: flex;
  gap: 6px;
}

.drag-handle, .copy-btn {
  background: none;
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.drag-handle {
  cursor: grab;
  letter-spacing: -2px;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle:hover, .copy-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.copy-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.copy-btn:disabled:hover {
  background: none;
  color: var(--text-secondary);
}

.results-grid {
  transition: all 0.3s ease;
}

.card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* 卡片进入/退出动画 */
.card-enter-active {
  transition: all 0.4s ease;
}

.card-leave-active {
  transition: all 0.3s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.card-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.card-move {
  transition: transform 0.3s ease;
}

/* 翻译提示框样式 */
.translate-prompt-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  pointer-events: none;
}

.translate-prompt {
  background: var(--card-background);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  min-width: 300px;
  max-width: 400px;
  animation: slideInRight 0.3s ease-out;
}

.prompt-content {
  margin-bottom: 8px;
}

.prompt-text {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 8px;
}

.prompt-preview {
  color: var(--text-primary);
  font-size: 13px;
  background: var(--background-dark);
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 12px;
  word-break: break-all;
  line-height: 1.4;
}

.prompt-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.prompt-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.prompt-btn.translate-btn {
  background: var(--primary-color);
  color: white;
}

.prompt-btn.translate-btn:hover {
  background: #2563eb;
}

.prompt-btn.cancel-btn {
  background: #ef4444;
  color: white;
}

.prompt-btn.cancel-btn:hover {
  background: #dc2626;
}

.prompt-hint {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.prompt-hint kbd {
  background: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.prompt-countdown {
  height: 3px;
  background: var(--background-dark);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.countdown-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #10b981);
  border-radius: 2px;
  transition: width 0.05s linear;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 复制成功提示 */
.copy-success-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 3000;
  animation: slideInRight 0.3s ease-out;
}
</style>