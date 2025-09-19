<template>
  <div class="ai-analysis-container">
    <!-- 顶部黑色导航区域 -->
    <div class="top-section">
      <div class="top-left">
        <h1>PaperPurify</h1>
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
            <span>PDF、DOCX形式のファイルをサポートしています。</span>
          </div>
          <input
              ref="fileInput"
              type="file"
              accept=".pdf,.docx"
              @change="handleFileUpload"
              style="display: none"
          />
        </div>

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

      <div class="button-container">
        <el-button class="continue-btn" @click="startAnalysis">
          继续
        </el-button>
      </div>
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

        <div class="button-container">
          <el-button class="continue-btn" disabled>
            確認して続行
          </el-button>
        </div>
    </div>

    <!-- 分析完成状态 - 页面1: AI生成可能性 -->
    <div v-if="pageState === 'analysisComplete' && resultPage === 'probability'" class="result-section">
      <h2>論文のAI成分を浄化し、学術を初心に戻す</h2>
      <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>

      <div class="result-content">
        <div class="ai-probability">
          <h3>本文AI生成の可能性: <span :class="probabilityClass">{{ aiProbabilityText }}</span></h3>
          <div class="probability-chart">
            <div class="chart-container">
              <div class="chart" ref="chart"></div>
              <span class="chart-value">{{ analysisResult.aiScore }}%</span>
            </div>
          </div>
        </div>

        <div class="dimension-scores">
          <div class="dimension" v-for="(dimension, index) in analysisResult.aiDimensions" :key="index">
            <h4>{{ dimension.name }}</h4>
            <div class="score-level" :class="dimension.level">
              {{ dimension.level }}
            </div>
            <p class="evaluation">{{ dimension.evaluation }}</p>
          </div>
        </div>
      </div>

      <div class="button-container">
        <el-button class="continue-btn" @click="switchToDimensions">
          生成具体评价
        </el-button>
      </div>
    </div>

    <!-- 分析完成状态 - 页面2: 详细评价 -->
    <div v-if="pageState === 'analysisComplete' && resultPage === 'dimensions'" class="dimensions-section">
      <h2>詳細評価</h2>
      <p>論文の質を6つの次元で評価しました</p>

      <div class="radar-chart-container">
        <div class="radar-chart" ref="radarChart"></div>
      </div>

      <div class="quality-dimensions">
        <div class="quality-dimension" v-for="(dimension, index) in analysisResult.qualityDimensions" :key="index">
          <h4>{{ dimension.name }}</h4>
          <el-progress :percentage="dimension.score" :color="getQualityScoreColor(dimension.score)" />
          <span class="score-value">{{ dimension.score }}/100</span>
          <p class="dimension-evaluation">{{ dimension.evaluation }}</p>
        </div>
      </div>

      <div class="button-container">
        <el-button class="continue-btn scroll-btn" @click="switchToRecommendations">
          <el-icon><ArrowDown /></el-icon>
          下滑展示更多
        </el-button>
      </div>
    </div>

    <!-- 分析完成状态 - 页面3: 修改建议 -->
    <div v-if="pageState === 'analysisComplete' && resultPage === 'recommendations'" class="recommendations-section">
      <h2>修改建议</h2>
      <p>AI分析結果に基づき、具体的で実行可能な論文の修正提案を提供し、AI比率を効果的に下げ、論文の質を向上させるお手伝いをします。</p>

      <div class="recommendations-content">
        <h4>改善提案:</h4>
        <div class="recommendations-text">
          <p v-for="(recommendation, index) in analysisResult.recommendations" :key="index">
            {{ recommendation }}
          </p>
        </div>
      </div>

      <div class="button-container">
        <el-button class="continue-btn" @click="downloadReport">
          PDFをエクスポート
        </el-button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Document, Close, Loading, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

// 用户信息
const user = ref({
  name: 'ユーザー名',
  avatar: ''
})

// 页面状态管理
const pageState = ref('initial')
const resultPage = ref('probability') // probability, dimensions, recommendations
const uploadedFile = ref(null)
const fileInput = ref(null)
const analysisResult = ref({})
const chart = ref(null)
const radarChart = ref(null)
let chartInstance = null
let radarChartInstance = null

// 模拟分析结果
const mockAnalysisResult = {
  aiScore: 75,
  aiProbability: 'high', // low, medium, high
  aiDimensions: [
    {
      name: '言語的困惑度',
      level: '高',
      evaluation: '専門用語が使われているにもかかわらず、文章の構造があまりにも整然としていて、自然な流暢さに欠けている。'
    },
    {
      name: '構造とテンプレート使用傾向',
      level: '中',
      evaluation: '抽象的な定義から入り、論理展開が非常に典型的で、独自性に欠ける。'
    },
    {
      name: '専門用語密度と論理的一貫性',
      level: '高',
      evaluation: '「第一性原理的思考」「制度設計」「政策立案型エコノミスト」など高度な専門用語が一貫して使用されているが、論理展開にやや無理がある。'
    }
  ],
  qualityDimensions: [
    {
      name: '志望動機の明確性と具体性',
      score: 88,
      evaluation: '志望動機は明確で具体的ですが、より個人的な経験や具体例を追加すると説得力が増します。'
    },
    {
      name: '学部専門との適合度',
      score: 75,
      evaluation: '選択した専門分野との関連性はありますが、より深い関連性を示す具体例が必要です。'
    },
    {
      name: '学習計画の合理性',
      score: 68,
      evaluation: '学習計画は基本的に合理的ですが、時間配分と具体的な実施方法についてより詳細な記述が必要です。'
    },
    {
      name: '文章構造と論理展開',
      score: 80,
      evaluation: '文章構造は整っていますが、段落間のつながりや論理の流れに改善の余地があります。'
    },
    {
      name: '表現力と説得力',
      score: 92,
      evaluation: '言語表現が流暢で、学術用語が正確で、文体が美しく、かなりの可読性があります。'
    },
    {
      name: '文法と日本語の正確性',
      score: 95,
      evaluation: '文法は正確で、日本語表現も自然です。ただし、一部の表現がやや硬い印象です。'
    }
  ],
  recommendations: [
    '結論部分の論理展開に一貫性が不足しています。具体例を追加して説明を補強してください。',
    '専門用語の使用がやや過剰です。読み手の理解度に合わせて平易な表現に置き換えることを検討してください。',
    '独自の考察部分をさらに拡充し、既存研究との差異を明確に示すとより説得力が増します。',
    '第2-4段落の表現方法を見直し、より自然な流れになるように調整してください。',
    '結論部分の論理的一貫性を強化し、論文全体の主張を明確にまとめてください。'
  ]
}

// 初始化饼图
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
        { value: mockAnalysisResult.aiScore },
        { value: 100 - mockAnalysisResult.aiScore, itemStyle: { color: '#f0f0f0' } }
      ]
    }]
  }

  chartInstance.setOption(option)

  // 添加动画效果
  let currentValue = 0
  const animationDuration = 1500
  const animationFrame = 16
  const totalFrames = animationDuration / animationFrame
  const valueIncrement = mockAnalysisResult.aiScore / totalFrames

  const animateChart = () => {
    if (currentValue < mockAnalysisResult.aiScore) {
      currentValue += valueIncrement
      option.series[0].data[0].value = currentValue
      option.series[0].data[1].value = 100 - currentValue
      chartInstance.setOption(option)
      setTimeout(animateChart, animationFrame)
    }
  }

  animateChart()
}

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChart.value) return

  radarChartInstance = echarts.init(radarChart.value)
  const option = {
    radar: {
      indicator: mockAnalysisResult.qualityDimensions.map(d => ({
        name: d.name,
        max: 100
      })),
      shape: 'circle',
      splitNumber: 4,
      axisName: {
        color: '#333'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: mockAnalysisResult.qualityDimensions.map(d => d.score),
        name: '評価スコア',
        areaStyle: {
          color: 'rgba(24, 144, 255, 0.6)'
        },
        lineStyle: {
          color: 'rgba(24, 144, 255, 1)'
        },
        itemStyle: {
          color: 'rgba(24, 144, 255, 1)'
        }
      }]
    }]
  }

  radarChartInstance.setOption(option)
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
    ElMessage.error('PDFまたはDOCX形式のファイルのみ対応しています')
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
    // 使用若依框架的request方法调用后端接口
    const result = await request({
      url: '/ai/contentAnalyse',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60秒超时
    })

    // 若依框架的request方法会自动处理响应格式
    analysisResult.value = result.data

    // 模拟延迟，让用户看到加载效果
    setTimeout(() => {
      pageState.value = 'analysisComplete'
      resultPage.value = 'probability'
      nextTick(() => {
        initChart()
      })
    }, 2000)

  } catch (error) {
    ElMessage.error('分析中にエラーが発生しました: ' + error.message)
    pageState.value = 'fileUploaded'
  }
}

// 切换到维度评价页面
const switchToDimensions = () => {
  resultPage.value = 'dimensions'
  nextTick(() => {
    initRadarChart()
  })
}

// 切换到建议页面
const switchToRecommendations = () => {
  resultPage.value = 'recommendations'
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

// 根据质量分数获取颜色
const getQualityScoreColor = (score) => {
  if (score >= 85) return '#67c23a' // 绿色表示高质量
  if (score >= 70) return '#e6a23c' // 黄色表示中等质量
  return '#f56c6c' // 红色表示低质量
}

// 计算AI可能性文本和样式
const aiProbabilityText = computed(() => {
  if (analysisResult.value.aiScore >= 70) return '高い'
  if (analysisResult.value.aiScore >= 40) return '中'
  return '低い'
})

const probabilityClass = computed(() => {
  if (analysisResult.value.aiScore >= 70) return 'high-probability'
  if (analysisResult.value.aiScore >= 40) return 'medium-probability'
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
  if (radarChartInstance) {
    radarChartInstance.dispose()
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

/* 文件预览区域 */
.file-preview {
  width: 600px;
  height: 240px;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-card {
  width: 100%;
  height: 100%;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info span {
  font-size: 14px;
  color: #999;
}

/* 按钮容器 */
.button-container {
  width: 100%;
  display: flex;
  justify-content: center;
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

.scroll-btn {
  background-color: #1890ff;
}

.scroll-btn:hover {
  background-color: #40a9ff;
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

/* 结果区域 - 页面1: AI生成可能性 */
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

.dimension {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}

.dimension h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.score-level {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.score-level.高 {
  background-color: #f56c6c;
  color: #fff;
}

.score-level.中 {
  background-color: #e6a23c;
  color: #fff;
}

.score-level.低 {
  background-color: #67c23a;
  color: #fff;
}

.evaluation {
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

/* 结果区域 - 页面2: 详细评价 */
.dimensions-section {
  width: 100%;
}

.dimensions-section h2 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 16px 0;
}

.dimensions-section > p {
  font-size: 16px;
  text-align: center;
  margin: 0 0 40px 0;
  color: #666;
}

.radar-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.radar-chart {
  width: 600px;
  height: 400px;
}

.quality-dimensions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.quality-dimension {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}

.quality-dimension h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.score-value {
  display: block;
  text-align: right;
  font-size: 14px;
  margin-top: 4px;
  font-weight: bold;
}

.dimension-evaluation {
  font-size: 14px;
  margin: 8px 0 0 0;
  line-height: 1.6;
}

/* 结果区域 - 页面3: 修改建议 */
.recommendations-section {
  width: 800px;
}

.recommendations-section h2 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 16px 0;
}

.recommendations-section > p {
  font-size: 16px;
  text-align: center;
  margin: 0 0 40px 0;
  color: #666;
}

.recommendations-content {
  margin-bottom: 40px;
}

.recommendations-content h4 {
  font-size: 18px;
  margin: 0 0 16px 0;
}

.recommendations-text {
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.recommendations-text p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.recommendations-text p:last-child {
  margin-bottom: 0;
}
</style>