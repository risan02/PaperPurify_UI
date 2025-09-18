<template>
  <div class="ai-analysis-container">
    <!-- 顶部黑色导航区域 -->
    <div class="top-section">
      <div class="top-left">
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

        <el-button
            class="continue-btn"
            :disabled="!uploadedFile"
            @click="startAnalysis"
        >
          继续
        </el-button>
      </div>

      <!-- 文件已上传状态 -->
      <div v-if="pageState === 'fileUploaded'" class="uploaded-section">
        <h2>論文のAI成分を浄化し、学術を初心に戻す</h2>
        <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>

        <div class="file-preview">
          <div class="file-card">
            <el-icon :size="40" class="file-icon">
              <Document v-if="uploadedFile.type === 'pdf'" />
              <Document v-else />
            </el-icon>
            <div class="file-info">
              <h4>{{ uploadedFile.name }}</h4>
              <span>{{ uploadedFile.size }} KB</span>
            </div>
            <el-button link @click="removeFile">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <el-button class="continue-btn" @click="startAnalysis">
          继续
        </el-button>
      </div>

      <!-- 分析中状态 -->
      <div v-if="pageState === 'analyzing'" class="analyzing-section">
        <h2>論文のAI成分を浄化し、学術を初心に戻す</h2>
        <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>

        <div class="analyzing-area">
          <div class="loading-indicator">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>論文AI成分净化中...</p>
          </div>
        </div>

        <el-button class="continue-btn" disabled>
          確認して続行
        </el-button>
      </div>

      <!-- 分析完成状态 -->
      <div v-if="pageState === 'analysisComplete'" class="result-section">
        <h2>論文のAI成分を浄化し、学術を初心に戻す</h2>
        <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>

        <div class="result-content">
          <div class="ai-probability">
            <h3>本文AI生成の可能性: <span :class="probabilityClass">{{ aiProbabilityText }}</span></h3>
            <div class="probability-chart">
              <div class="chart-container">
                <div class="chart" ref="chart"></div>
                <span class="chart-value">{{ analysisResult.score }}%</span>
              </div>
            </div>
          </div>

          <div class="dimension-scores">
            <div class="dimension">
              <h4>論理的整合性</h4>
              <el-progress :percentage="analysisResult.dimensions.logic" :color="getScoreColor(analysisResult.dimensions.logic)" />
              <span class="score-label">{{ getScoreLabel(analysisResult.dimensions.logic) }}</span>
            </div>
            <div class="dimension">
              <h4>表現の自然さ</h4>
              <el-progress :percentage="analysisResult.dimensions.expression" :color="getScoreColor(analysisResult.dimensions.expression)" />
              <span class="score-label">{{ getScoreLabel(analysisResult.dimensions.expression) }}</span>
            </div>
            <div class="dimension">
              <h4>内容の独自性</h4>
              <el-progress :percentage="analysisResult.dimensions.originality" :color="getScoreColor(analysisResult.dimensions.originality)" />
              <span class="score-label">{{ getScoreLabel(analysisResult.dimensions.originality) }}</span>
            </div>
          </div>
        </div>

        <div class="recommendations">
          <h4>改善提案:</h4>
          <ul>
            <li v-for="(recommendation, index) in analysisResult.recommendations" :key="index">
              {{ recommendation }}
            </li>
          </ul>
        </div>

        <el-button class="continue-btn" @click="downloadReport">
          レポートをダウンロード
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Document, Close, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 用户信息
const user = ref({
  name: 'ユーザー名',
  avatar: ''
})

// 页面状态管理: initial, fileUploaded, analyzing, analysisComplete
const pageState = ref('initial')
const uploadedFile = ref(null)
const fileInput = ref(null)
const analysisResult = ref({})
const chart = ref(null)
let chartInstance = null

// 模拟分析结果
const mockAnalysisResult = {
  score: 75,
  probability: 'high', // low, medium, high
  dimensions: {
    logic: 65,
    expression: 80,
    originality: 70
  },
  recommendations: [
    '結論部分の論理展開に一貫性が不足しています。具体例を追加して説明を補強してください。',
    '専門用語の使用がやや過剰です。読み手の理解度に合わせて平易な表現に置き換えることを検討してください。',
    '独自の考察部分をさらに拡充し、既存研究との差異を明確に示すとより説得力が増します。'
  ]
}

// 初始化图表
const initChart = () => {
  if (!chart.value) return

  chartInstance = echarts.init(chart.value)
  const option = {
    series: [{
      type: 'pie',
      radius: ['70%', '90%'],
      avoidLabelOverlap: false,
      itemStyle: {
        color: '#1890ff'
      },
      label: {
        show: false
      },
      data: [
        { value: mockAnalysisResult.score },
        { value: 100 - mockAnalysisResult.score, itemStyle: { color: '#f0f0f0' } }
      ]
    }]
  }

  chartInstance.setOption(option)

  // 添加动画效果
  let currentValue = 0
  const animationDuration = 1500
  const animationFrame = 16
  const totalFrames = animationDuration / animationFrame
  const valueIncrement = mockAnalysisResult.score / totalFrames

  const animateChart = () => {
    if (currentValue < mockAnalysisResult.score) {
      currentValue += valueIncrement
      option.series[0].data[0].value = currentValue
      option.series[0].data[1].value = 100 - currentValue
      chartInstance.setOption(option)
      setTimeout(animateChart, animationFrame)
    }
  }

  animateChart()
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  const fileType = file.name.split('.').pop().toLowerCase()
  if (fileType !== 'pdf' && fileType !== 'docx') {
    ElMessage.error('PDFまたはWord形式のファイルのみ対応しています')
    return
  }

  // 检查文件大小 (最大10MB)
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('ファイルサイズは10MB以下にしてください')
    return
  }

  uploadedFile.value = {
    file: file,
    name: file.name,
    size: Math.round(file.size / 1024),
    type: fileType
  }

  pageState.value = 'fileUploaded'
}

// 移除已选文件
const removeFile = () => {
  uploadedFile.value = null
  pageState.value = 'initial'
  fileInput.value.value = ''
}

// 开始分析
const startAnalysis = async () => {
  if (!uploadedFile.value) return

  pageState.value = 'analyzing'

  // 创建FormData对象上传文件
  const formData = new FormData()
  formData.append('file', uploadedFile.value.file)

  try {
    // 调用后端分析接口
    const response = await fetch('/ai/contentAnalyse', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('分析リクエストが失敗しました')
    }

    const data = await response.json()
    analysisResult.value = data

    // 模拟延迟，让用户看到加载效果
    setTimeout(() => {
      pageState.value = 'analysisComplete'
      nextTick(() => {
        initChart()
      })
    }, 2000)

  } catch (error) {
    ElMessage.error('分析中にエラーが発生しました: ' + error.message)
    pageState.value = 'fileUploaded'
  }
}

// 下载报告
const downloadReport = () => {
  ElMessage.success('レポートのダウンロードを開始します')
  // 这里实现实际的下载逻辑
}

// 退出登录
const handleLogout = () => {
  // 调用退出登录接口
  ElMessage.success('ログアウトしました')
  router.push('/login')
}

// 根据分数获取标签
const getScoreLabel = (score) => {
  if (score >= 80) return '高い'
  if (score >= 60) return '中'
  return '低い'
}

// 根据分数获取颜色
const getScoreColor = (score) => {
  if (score >= 80) return '#f56c6c' // 红色表示高风险
  if (score >= 60) return '#e6a23c' // 黄色表示中等风险
  return '#67c23a' // 绿色表示低风险
}

// 计算AI可能性文本和样式
const aiProbabilityText = computed(() => {
  if (analysisResult.value.score >= 70) return '高い'
  if (analysisResult.value.score >= 40) return '中'
  return '低い'
})

const probabilityClass = computed(() => {
  if (analysisResult.value.score >= 70) return 'high-probability'
  if (analysisResult.value.score >= 40) return 'medium-probability'
  return 'low-probability'
})

// 组件挂载和卸载
onMounted(() => {
  // 初始化时可以使用模拟数据
  analysisResult.value = mockAnalysisResult
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})

const router = useRouter()
</script>

<style scoped>
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

.top-left h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.top-left p {
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
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

/* 文件预览 */
.file-preview {
  width: 600px;
  margin-bottom: 40px;
}

.file-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.file-icon {
  margin-right: 16px;
  color: #f56c6c;
}

.file-info {
  flex: 1;
}

.file-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.file-info span {
  font-size: 14px;
  color: #999;
}

/* 分析中区域 */
.analyzing-area {
  width: 600px;
  height: 240px;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.loading-indicator {
  text-align: center;
}

.loading-icon {
  font-size: 50px;
  color: #1890ff;
  margin-bottom: 16px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-indicator p {
  font-size: 16px;
  margin: 0;
  color: #666;
}

/* 结果区域 */
.result-content {
  width: 800px;
  display: flex;
  margin-bottom: 40px;
  gap: 40px;
}

.ai-probability {
  flex: 1;
}

.ai-probability h3 {
  font-size: 20px;
  margin: 0 0 24px 0;
  text-align: center;
}

.high-probability {
  color: #f56c6c;
}

.medium-probability {
  color: #e6a23c;
}

.low-probability {
  color: #67c23a;
}

.probability-chart {
  display: flex;
  justify-content: center;
}

.chart-container {
  position: relative;
  width: 180px;
  height: 180px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
}

.dimension-scores {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dimension h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.score-label {
  display: block;
  text-align: right;
  font-size: 14px;
  margin-top: 4px;
}

.recommendations {
  width: 800px;
  margin-bottom: 40px;
}

.recommendations h4 {
  font-size: 18px;
  margin: 0 0 16px 0;
}

.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.recommendations li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

/* 继续按钮 */
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
</style>