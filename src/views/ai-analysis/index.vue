<template>
  <div class="ai-analysis-container">
    <!-- 顶部黑色导航区域 -->
    <div class="top-section">
      <div class="top-left">
        <!-- 修改1: 左上角文字样式调整 -->
        <div class="logo-text">PaperPurify</div>
        <h1>論文のAI成分を浄化し、学術を初心に戻す</h1>
        <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>
      </div>
      <div class="top-right">
        <div class="user-info">
          <el-avatar :size="40" :src="user.avatar" />
          <span class="username">{{ user.name }}</span>
          <el-button link class="logout-btn" @click="handleLogout">ログアウト</el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 初始状态/上传文件 -->
      <div v-if="pageState === 'initial'" class="upload-section">
        <h2>論文のAI成分を浄化し、学術を初心に戻す</h2>
        <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>

        <div class="upload-area" @click="triggerFileInput">
          <div class="upload-placeholder">
            <el-icon :size="50"><Plus /></el-icon>
            <p>ファイルを追加するには、クリックするかドラッグ＆ドロップしてください</p>
            <span>PDF、WORDなどの形式のファイルをサポートしています。</span>
          </div>
          <input
              ref="fileInput"
              type="file"
              accept=".pdf,.docx"
              @change="handleFileUpload"
              style="display: none"
          />
        </div>

        <!-- 修改2: 继续按钮居中 -->
        <div class="button-container">
          <el-button
              class="continue-btn"
              :disabled="!uploadedFile"
              @click="startAnalysis"
          >
            继续
          </el-button>
        </div>
      </div>

      <!-- 其他页面状态代码保持不变 -->
      <!-- ... -->
    </div>
  </div>
</template>

<script setup>
// 脚本部分保持不变
// ...
</script>

<style lang="scss" scoped>
.ai-analysis-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部黑色区域 */
.top-section {
  background-color: #000;
  color: #fff;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-left {
  /* 修改1: 左上角文字样式调整 */
  .logo-text {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
    color: #fff;
  }

  h1 {
    font-size: 16px; /* 调整为较小字体 */
    font-weight: normal;
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  p {
    font-size: 14px;
    margin: 0;
    opacity: 0.8;
    line-height: 1.4;
  }
}

.top-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 16px;
}

.logout-btn {
  color: #fff;
  margin-left: 15px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  background-color: #fff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content h2 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 16px 0;
}

.main-content > p {
  font-size: 16px;
  text-align: center;
  margin: 0 0 40px 0;
  color: #666;
}

/* 上传区域 */
.upload-area {
  width: 600px;
  height: 240px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-bottom: 40px;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-placeholder {
  text-align: center;
  color: #999;
}

.upload-placeholder .el-icon {
  margin-bottom: 16px;
  color: #d9d9d9;
}

.upload-placeholder p {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.upload-placeholder span {
  font-size: 14px;
}

/* 修改2: 继续按钮居中 */
.button-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.continue-btn {
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 12px 40px;
  font-size: 16px;
  font-weight: 500;
}

.continue-btn:disabled {
  background-color: #d9d9d9;
  color: #999;
  cursor: not-allowed;
}

/* 其他样式保持不变 */
/* ... */
</style>