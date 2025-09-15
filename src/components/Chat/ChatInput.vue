<template>
  <div class="max-w-3xl mx-auto relative">
    <div class="flex items-center flex-wrap gap-2">
      <!-- 文件上传区域 -->
      <div class="relative">
        <input
            type="file"
            @change="$emit('file-upload', $event)"
            accept=".pdf,.docx,.txt,.jpg,.png"
            multiple
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="fileInput"
        >
        <label
            for="fileInput"
            :class="['flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer',
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700']">
          <i class="fas fa-paperclip mr-1.5"></i>
          <span>附件</span>
        </label>
      </div>

      <div v-if="selectedFiles.length" class="flex flex-wrap gap-1">
        <div :class="['text-xs px-2 py-0.5 rounded-full flex items-center',
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800']">
          {{ selectedFiles.length }}个文件已选
          <button @click="$emit('clear-files')" class="ml-1 text-inherit hover:opacity-70">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 输入框 -->
      <textarea
          :value="userInput"
          @input="handleInput"
          @keydown.enter.exact.prevent="$emit('send-message')"
          @keydown.ctrl.enter.exact.prevent="$emit('send-message')"
          @keydown.esc.exact="$emit('stop-response')"
          placeholder="输入您的问题..."
          :class="['flex-1 border rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 resize-none',
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400 placeholder-gray-400'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-transparent']"
          rows="1"
          ref="textarea"
          :disabled="isLoading"
      ></textarea>

      <!-- 发送/停止按钮 -->
      <button
          @click="isLoading ? $emit('stop-response') : $emit('send-message')"
          :disabled="!userInput.trim() && !isLoading && selectedFiles.length === 0"
          :class="['ml-2 p-3 rounded-lg shrink-0',
                isLoading
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed']"
      >
        <i :class="isLoading ? 'fas fa-stop' : 'fas fa-paper-plane'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  userInput: String,
  isLoading: Boolean,
  selectedFiles: {
    type: Array,
    default: () => []
  },
  darkMode: {
    type: Boolean,
    default: false
  }
})

// 添加 handleInput 方法
const handleInput = (event) => {
  // 当输入内容变化时，通知父组件更新 userInput
  emit('update:userInput', event.target.value)
  // 调整文本区域高度
  adjustTextareaHeight()
}

const emit = defineEmits(['update:userInput', 'send-message', 'stop-response', 'file-upload', 'clear-files'])
const textarea = ref(null)

// 调整文本区域高度
const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textarea.value) {
      textarea.value.style.height = 'auto'
      textarea.value.style.height = `${Math.min(textarea.value.scrollHeight, 200)}px`
    }
  })
}


// 监听输入变化
watch(() => props.userInput, adjustTextareaHeight)

onMounted(() => {
  adjustTextareaHeight()
})
</script>