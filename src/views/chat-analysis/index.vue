<template>
  <!-- 修复容器布局，确保占满整个视口 -->
  <div id="app" class="flex flex-col h-screen bg-gray-50 dark:bg-gray-800">
    <!-- 顶部导航栏 -->
    <header class="bg-white dark:bg-gray-700 shadow-sm py-3 px-4 flex items-center justify-between">
      <div class="flex items-center">
        <div class="text-xl font-bold text-blue-600 dark:text-blue-400">志望理由分析顾问</div>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="startNewConversation"
          class="ml-2 p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white"
          style="width: 50px"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button @click="toggleDarkMode" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
          <i :class="darkMode ? 'fas fa-moon text-gray-600 dark:text-gray-300' : 'fas fa-sun text-gray-600 dark:text-gray-300'"></i>
        </button>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-1 min-h-0 overflow-y-auto p-4 space-y-6" ref="chatContainer" :class="{ 'bg-gray-800': darkMode }">
      <div v-for="(message, index) in messages" :key="index" class="max-w-3xl mx-auto">
        <div :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
          <div :class="['flex items-start space-x-3', message.role === 'user' ? 'flex-row-reverse space-x-reverse' : '']">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center',
                            message.role === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200' : 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200']">
              <i :class="message.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
            </div>
            <div :class="['p-3 rounded-lg max-w-lg',
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-100'
                                : 'bg-white shadow border border-gray-100']">
              <div v-if="message.role === 'assistant' && message.isLoading" class="flex space-x-2">
                <div :class="['w-2 h-2 rounded-full', darkMode ? 'bg-gray-400' : 'bg-gray-300', 'animate-pulse']"></div>
                <div :class="['w-2 h-2 rounded-full', darkMode ? 'bg-gray-400' : 'bg-gray-300', 'animate-pulse delay-100']"></div>
                <div :class="['w-2 h-2 rounded-full', darkMode ? 'bg-gray-400' : 'bg-gray-300', 'animate-pulse delay-200']"></div>
              </div>
              <div v-else class="whitespace-pre-wrap">
                <span v-for="(char, charIndex) in message.content" :key="charIndex"
                      :class="{'opacity-0': charIndex >= message.visibleChars, 'fade-in': charIndex < message.visibleChars}">
                  {{ char }}
                </span>
                <span v-if="message.isStreaming" class="typing-cursor"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部输入区域 -->
    <footer :class="['border-t p-4', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <div class="max-w-3xl mx-auto relative">
        <div class="flex items-center flex-wrap gap-2">
          <!-- 文件上传区域 -->
          <div class="relative">
            <input
              type="file"
              @change="handleFileUpload"
              accept=".pdf,.docx,.txt,.jpg,.png"
              multiple
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="fileInput"
            >
            <label
              for="fileInput"
              :class="['flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors',
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700']">
              <i class="fas fa-paperclip mr-1.5"></i>
              <span>附件</span>
            </label>
          </div>
          <div v-if="selectedFiles.length" class="flex flex-wrap gap-1">
            <div :class="['text-xs px-2 py-0.5 rounded-full',
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800']">
              {{ selectedFiles.length }}个文件已选
            </div>
          </div>

          <!-- 输入框 -->
          <textarea
            v-model="userInput"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.ctrl.enter.exact.prevent="sendMessage"
            @keydown.esc.exact="stopResponse"
            placeholder="输入您的问题..."
            :class="['flex-1 border rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 resize-none',
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400 placeholder-gray-400'
                : 'border-gray-300 focus:ring-blue-500 focus:border-transparent']"
            rows="1"
            ref="textarea"
            @input="adjustTextareaHeight"
          ></textarea>

          <!-- 发送/停止按钮 -->
          <button
            @click="isLoading ? stopResponse() : sendMessage()"
            :disabled="!userInput.trim() && !isLoading && selectedFiles.length === 0"
            :class="['ml-2 p-3 rounded-lg',
              isLoading
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed']"
          >
            <i :class="isLoading ? 'fas fa-stop' : 'fas fa-paper-plane'"></i>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

// 状态定义
const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const textarea = ref(null)
const darkMode = ref(false)
const selectedFiles = ref([])
const memoryId = ref(Date.now().toString())

let controller = null
let typingInterval = null

// 切换暗黑模式
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)

  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 处理文件上传
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  if (files.length + selectedFiles.value.length > 5) {
    alert('最多只能上传5个文件')
    event.target.value = ''
    return
  }

  const validFiles = files.filter(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} 超过10MB限制，将被忽略`)
      return false
    }
    return true
  })

  selectedFiles.value = [...selectedFiles.value, ...validFiles]
  event.target.value = ''
}

// 清空已选文件
const clearSelectedFiles = () => {
  selectedFiles.value = []
}

// 调整文本区域高度
const adjustTextareaHeight = () => {
  const textareaEl = textarea.value
  textareaEl.style.height = 'auto'
  textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, 200)}px`
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 新建会话
const startNewConversation = () => {
  messages.value = []
  memoryId.value = Date.now().toString()
  messages.value.push({
    role: 'assistant',
    content: '你好！我是日本大学志望理由分析顾问，请问有什么能帮到您？',
    isLoading: false,
    visibleChars: 0,
    isStreaming: false
  })
  messages.value[0].visibleChars = messages.value[0].content.length
  scrollToBottom()
  nextTick(() => {
    textarea.value.focus()
  })
}

// 模拟逐字打印效果
const startTypingEffect = (messageIndex) => {
  const message = messages.value[messageIndex]
  if (!message || message.visibleChars >= message.content.length) {
    clearInterval(typingInterval)
    typingInterval = null
    messages.value[messageIndex].isStreaming = false
    return
  }

  messages.value[messageIndex].visibleChars++
  scrollToBottom()
}

// 发送消息
const sendMessage = async () => {
  if ((!userInput.value.trim() && selectedFiles.value.length === 0) || isLoading.value) return

  if (controller) {
    controller.abort()
  }
  controller = new AbortController()

  let userMessageContent = userInput.value.trim()
  if (selectedFiles.value.length > 0) {
    userMessageContent += `\n\n已上传 ${selectedFiles.value.length} 个文件：`
    selectedFiles.value.forEach((file, index) => {
      userMessageContent += `\n${index + 1}. ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
    })
  }

  const userMessage = {
    role: 'user',
    content: userMessageContent,
    isLoading: false,
    visibleChars: userMessageContent.length,
    isStreaming: false
  }

  messages.value.push(userMessage)

  const assistantMessage = {
    role: 'assistant',
    content: '',
    isLoading: true,
    visibleChars: 0,
    isStreaming: true
  }

  messages.value.push(assistantMessage)

  userInput.value = ''
  adjustTextareaHeight()
  scrollToBottom()

  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('message', userMessageContent)
    formData.append('memoryId', memoryId.value)
    if (selectedFiles.value.length > 0) {
      selectedFiles.value.forEach(file => {
        formData.append('files', file)
      })
    }

    const response = await fetch('/chat', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let messageIndex = messages.value.length - 1

    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }

    while (true) {
      const {done, value} = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, {stream: true})
      buffer += chunk

      messages.value[messageIndex].content = buffer
      messages.value[messageIndex].isLoading = false

      if (!typingInterval) {
        typingInterval = setInterval(() => {
          startTypingEffect(messageIndex)
        }, 20)
      }

      scrollToBottom()
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求被用户中止')
    } else {
      console.error('请求出错:', error)
      const lastMessage = messages.value[messages.value.length - 1]
      lastMessage.content = '抱歉，请求过程中出现错误: ' + error.message
      lastMessage.visibleChars = lastMessage.content.length
    }
  } finally {
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.isLoading = false
    lastMessage.isStreaming = false

    if (lastMessage.visibleChars < lastMessage.content.length) {
      lastMessage.visibleChars = lastMessage.content.length
    }

    isLoading.value = false
    controller = null

    clearSelectedFiles()

    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }

    scrollToBottom()
  }
}

// 停止响应
const stopResponse = () => {
  if (controller) {
    controller.abort()
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.isLoading = false
    lastMessage.isStreaming = false

    if (lastMessage.visibleChars < lastMessage.content.length) {
      lastMessage.visibleChars = lastMessage.content.length
    }

    isLoading.value = false
    controller = null

    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }
  }
}

// 初始化
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true'
  const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

  darkMode.value = savedDarkMode || systemDarkMode

  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  }

  messages.value.push({
    role: 'assistant',
    content: '你好！我是日本大学志望理由分析顾问，请问有什么能帮到您？',
    isLoading: false,
    visibleChars: 0,
    isStreaming: false
  })

  messages.value[0].visibleChars = messages.value[0].content.length
  scrollToBottom()

  nextTick(() => {
    textarea.value.focus()
  })
})

// 监听消息变化自动滚动
watch(messages, scrollToBottom, {deep: true})
</script>

<style scoped>
/* 这里可以放一些组件特有的样式 */
/* 添加暗黑模式过渡动画 */
.dark-transition {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 优化滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>