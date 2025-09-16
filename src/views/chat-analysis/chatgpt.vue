<template>
  <div id="app" class="flex flex-col h-screen bg-gray-50 dark:bg-gray-800">
    <!-- 顶部导航栏 -->
    <header class="bg-white dark:bg-gray-700 shadow-sm py-3 px-4 flex items-center justify-between">
      <div class="text-xl font-bold text-blue-600 dark:text-blue-400">ChatGPT</div>
      <div class="flex items-center space-x-3">
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
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部输入区域 -->
    <footer :class="['border-t p-4', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <div class="max-w-3xl mx-auto relative">
        <div class="flex items-center">
          <textarea
              v-model="userInput"
              @keydown.enter.exact.prevent="sendMessage"
              placeholder="输入您的问题..."
              :class="['flex-1 border rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 resize-none',
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400 placeholder-gray-400'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent']"
              rows="1"
              ref="textarea"
          ></textarea>
          <button
              @click="sendMessage"
              :disabled="!userInput.trim()"
              :class="['ml-2 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white', 'disabled:opacity-50 disabled:cursor-not-allowed']"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// 状态定义
const messages = ref([])
const userInput = ref('')
const chatContainer = ref(null)
const textarea = ref(null)
const darkMode = ref(false)

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

// 发送消息
const sendMessage = async () => {
  const userMessage = {
    role: 'user',
    content: userInput.value.trim()
  }

  messages.value.push(userMessage)

  userInput.value = ''
  adjustTextareaHeight()

  // 模拟加载等待动效
  messages.value.push({
    role: 'assistant',
    content: '正在处理中...',
    isLoading: true
  })

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userMessage.content }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = {
      role: 'assistant',
      content: data.response,
      isLoading: false
    }

    messages.value[messages.value.length - 1] = assistantMessage

  } catch (error) {
    console.error('请求出错:', error)
    messages.value[messages.value.length - 1].content = '抱歉，请求过程中出现错误: ' + error.message
    messages.value[messages.value.length - 1].isLoading = false
  } finally {
    scrollToBottom()
  }
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
    content: '你好！我是你的助手，请问有什么能帮到您？',
    isLoading: false
  })

  scrollToBottom()

  nextTick(() => {
    textarea.value.focus()
  })
})
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