<template>
  <div class="my-full-page">
    <!-- 标题 -->
    <h1>志望理由分析顾问</h1>

    <!-- 聊天区域 -->
    <div class="chat-area" ref="chatArea">
      <div class="message-bubble">
        <img src="https://placehold.co/30x30" alt="顾问头像" class="avatar">
        <p>你好！我是日本大学志望理由分析顾问，请问有什么能帮到您？</p>
      </div>
    </div>

    <!-- 输入框和发送按钮 -->
    <div class="input-area">
      <van-cell-group>
        <van-field v-model="message" placeholder="输入您的问题..." />
      </van-cell-group>
      <van-button type="primary" @click="sendMessage">发送</van-button>
    </div>

    <!-- 设置按钮 -->
    <div class="settings-button">
      <button @click="toggleDarkMode">&#9881;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Toast } from 'vant'

const message = ref('')
const chatArea = ref(null)

// 模拟发送消息
const sendMessage = () => {
  if (message.value.trim() === '') return

  // 在这里调用后台接口发送消息
  console.log('发送消息:', message.value)
  message.value = ''
}

// 切换暗色模式
const toggleDarkMode = () => {
  document.body.classList.toggle('dark')
}

// 自动滚动到底部
const scrollToBottom = () => {
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.my-full-page {
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
}

.message-bubble {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  margin-right: 10px;
  border-radius: 50%;
}

.input-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ddd;
}

.settings-button {
  position: absolute;
  top: 20px;
  right: 20px;
}

.dark {
  background-color: #333;
  color: #fff;
}
</style>