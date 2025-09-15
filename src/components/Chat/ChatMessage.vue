<template>
  <div class="max-w-3xl mx-auto">
    <div :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
      <div :class="['flex items-start space-x-3', message.role === 'user' ? 'flex-row-reverse space-x-reverse' : '']">
        <!-- 头像 -->
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600',
                    darkMode && message.role === 'assistant' ? 'bg-gray-700 text-green-400' : '']">
          <i :class="message.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
        </div>

        <!-- 消息内容 -->
        <div :class="['p-3 rounded-lg max-w-lg',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-100 border-gray-600'
                        : 'bg-white shadow border border-gray-100']">
          <!-- 加载动画 -->
          <div v-if="message.role === 'assistant' && message.isLoading" class="flex space-x-2">
            <div :class="['w-2 h-2 rounded-full', darkMode ? 'bg-gray-400' : 'bg-gray-300', 'animate-pulse']"></div>
            <div :class="['w-2 h-2 rounded-full', darkMode ? 'bg-gray-400' : 'bg-gray-300', 'animate-pulse delay-100']"></div>
            <div :class="['w-2 h-2 rounded-full', darkMode ? 'bg-gray-400' : 'bg-gray-300', 'animate-pulse delay-200']"></div>
          </div>

          <!-- 消息文本 -->
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
</template>

<script setup>
defineProps({
  message: {
    type: Object,
    required: true
  },
  darkMode: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.1s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.typing-cursor::after {
  content: "|";
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}
</style>