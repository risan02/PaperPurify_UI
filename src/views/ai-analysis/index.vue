<template>
  <div class="ai-analysis-container">
    <!-- 顶部黑色导航区域 -->
    <div class="top-section">
      <div class="top-left">
        <h1>PaperPurify</h1>
      </div>
      <div class="top-right">
        <div class="user-info">
          <LanguageSwitcher />
          <el-avatar :size="40" :src="user.avatar" />
          <span class="username">{{ user.name }}</span>
          <el-button link class="logout-btn" @click="handleLogout">{{ $t('common.logout') }}</el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 初始状态/上传文件 -->
      <div v-if="pageState === 'initial'" class="upload-section">
        <h2>{{ $t('aiAnalysis.title') }}</h2>
        <p>{{ $t('aiAnalysis.description') }}</p>

        <div class="upload-area" @click="triggerFileInput">
          <div class="upload-placeholder">
            <el-icon :size="50"><Plus /></el-icon>
            <p>{{ $t('aiAnalysis.uploadHint') }}</p>
            <span>{{ $t('aiAnalysis.fileTypeSupport') }}</span>
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
            {{ $t('common.continue') }}
          </el-button>
        </div>
      </div>

      <!-- 文件已上传状态 -->
      <div v-if="pageState === 'fileUploaded'" class="uploaded-section">
        <h2>{{ $t('aiAnalysis.title') }}</h2>
        <p>{{ $t('aiAnalysis.description') }}</p>

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
          {{ $t('common.continue') }}
        </el-button>
      </div>
    </div>

      <!-- 分析中状态 -->
      <div v-if="pageState === 'analyzing'" class="analyzing-section">
        <h2>{{ $t('aiAnalysis.title') }}</h2>
        <p>{{ $t('aiAnalysis.description') }}</p>

        <div class="analyzing-area">
          <div class="loading-indicator">
            <div class="red-circle-loader"></div>
            <p>{{ $t('aiAnalysis.analyzing') }}</p>
          </div>
        </div>

        <div class="button-container">
          <el-button class="continue-btn" disabled>
            {{ $t('aiAnalysis.confirmContinue') }}
          </el-button>
        </div>
    </div>

    <!-- 分析完成状态 - 页面1: AI生成可能性 -->
    <div v-if="pageState === 'analysisComplete' && resultPage === 'probability'" class="result-section">
        <div class="result-content">
          <div class="ai-probability">
            <!-- 将可能性文本放在饼图上方 -->
            <h3>{{ $t('aiAnalysis.aiProbabilityTitle') }}: <span :class="probabilityClass">{{ aiProbabilityText }}</span></h3>
            <div class="probability-chart">
              <div class="chart-container">
                <div class="chart" ref="chart"></div>
                <span class="chart-value">{{ analysisResult.aiScore }}%</span>
              </div>
            </div>
          </div>

          <div class="dimension-scores">
            <div class="dimension" v-for="(dimension, index) in analysisResult.aiDimensions" :key="index">
              <div class="dimension-header">
                <h4>{{ dimension.name }}</h4>
                <!-- 显示数字分数（0.0-10.0），分数越高越接近人类写作 -->
                <div class="score-level" :class="getLevelClass(dimension.level)">
                  {{ formatLevel(dimension.level) }}
                </div>
              </div>
              <p class="evaluation">{{ dimension.evaluation }}</p>
            </div>
          </div>
        </div>

        <div class="button-container">
          <el-button class="back-btn" v-if="canGoBack" @click="goBack">
            <el-icon><ArrowLeft /></el-icon> {{ $t('common.back') }}
          </el-button>
          <el-button class="continue-btn" @click="switchToDimensions">
            {{ $t('aiAnalysis.generateSpecificEvaluation') }}
          </el-button>
        </div>
      </div>

    <!-- 分析完成状态 - 页面2: 详细评价 -->
    <div v-if="pageState === 'analysisComplete' && resultPage === 'dimensions'" class="dimensions-section">
      <h2>{{ $t('aiAnalysis.detailedEvaluation') }}</h2>
      <p>{{ $t('aiAnalysis.detailedEvaluationDesc') }}</p>

      <div class="radar-chart-container">
        <div class="radar-chart" ref="radarChart"></div>
      </div>

      <div class="quality-dimensions">
        <div class="quality-dimension" v-for="(dimension, index) in analysisResult.qualityDimensions" :key="index">
          <h4>{{ dimension.name }}</h4>
          <el-progress :percentage="dimension.score" :color="getQualityScoreColor(dimension.score)" />
          <p class="dimension-evaluation">{{ dimension.evaluation }}</p>
        </div>
      </div>

        <div class="button-container">
          <el-button class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon> {{ $t('common.back') }}
          </el-button>
          <el-button class="continue-btn scroll-btn" @click="switchToRecommendations">
            <el-icon><ArrowDown /></el-icon>
            {{ $t('aiAnalysis.scrollForMore') }}
          </el-button>
        </div>
      </div>

    <!-- 分析完成状态 - 页面3: 修改建议 -->
    <div v-if="pageState === 'analysisComplete' && resultPage === 'recommendations'" class="recommendations-section">
      <!-- PDF导出内容区域（隐藏，仅用于导出） -->
      <div ref="pdfContent" class="pdf-export-content" style="display: none;">
        <div class="pdf-header">
          <h1>PaperPurify</h1>
          <p class="pdf-subtitle">{{ $t('aiAnalysis.pdfTitle') }}</p>
          <p class="pdf-date">{{ $t('aiAnalysis.pdfGenerationDate') }}: {{ formatDate(new Date()) }}</p>
        </div>
        
        <div class="pdf-body">
          <!-- 文档名称 -->
          <div class="pdf-section">
            <div class="pdf-section-title">{{ $t('aiAnalysis.pdfDocumentName') }}</div>
            <div class="pdf-document-name">{{ uploadedFile?.name || '-' }}</div>
          </div>

          <!-- AI生成可能性评分 -->
          <div class="pdf-section" v-if="analysisResult.aiScore !== undefined && analysisResult.aiScore !== null">
            <div class="pdf-section-title">{{ $t('aiAnalysis.pdfAiScore') }}</div>
            <div class="pdf-score-box">
              <div class="pdf-score-value">{{ analysisResult.aiScore }}%</div>
              <div class="pdf-score-label" :class="getProbabilityClassForPDF(analysisResult.aiScore)">
                {{ getProbabilityTextForPDF(analysisResult.aiScore) }}
              </div>
            </div>
          </div>

          <!-- AI生成痕迹六大维度 -->
          <div class="pdf-section" v-if="analysisResult.aiDimensions && analysisResult.aiDimensions.length > 0">
            <div class="pdf-section-title">{{ $t('aiAnalysis.pdfAiDimensionsTitle') }}</div>
            <div class="pdf-dimensions-list">
              <div v-for="(dimension, index) in analysisResult.aiDimensions" :key="index" class="pdf-dimension-item">
                <div class="pdf-dimension-header">
                  <span class="pdf-dimension-name">{{ dimension.name }}</span>
                  <span class="pdf-dimension-level" :class="getLevelClass(dimension.level)">
                    {{ formatLevel(dimension.level) }}
                  </span>
                </div>
                <div class="pdf-dimension-evaluation">{{ dimension.evaluation }}</div>
              </div>
            </div>
          </div>

          <!-- 文档质量六大维度 -->
          <div class="pdf-section" v-if="analysisResult.qualityDimensions && analysisResult.qualityDimensions.length > 0">
            <div class="pdf-section-title">{{ $t('aiAnalysis.pdfQualityDimensionsTitle') }}</div>
            <div class="pdf-dimensions-list">
              <div v-for="(dimension, index) in analysisResult.qualityDimensions" :key="index" class="pdf-dimension-item">
                <div class="pdf-dimension-header">
                  <span class="pdf-dimension-name">{{ dimension.name }}</span>
                  <span class="pdf-quality-score" :class="getQualityScoreClass(dimension.score)">
                    {{ dimension.score }}{{ $t('aiAnalysis.pdfScoreUnit') }}
                  </span>
                </div>
                <div class="pdf-dimension-evaluation">{{ dimension.evaluation }}</div>
              </div>
            </div>
          </div>

          <!-- 修改建议 -->
          <div class="pdf-section" v-if="analysisResult.recommendations && analysisResult.recommendations.length > 0">
            <div class="pdf-section-title">{{ $t('aiAnalysis.modificationSuggestions') }}</div>
            <p class="pdf-desc">{{ $t('aiAnalysis.modificationSuggestionsDesc') }}</p>
            <div class="pdf-recommendations">
              <div v-for="(recommendation, index) in analysisResult.recommendations" :key="index" class="pdf-recommendation-item">
                <p class="pdf-recommendation-text">{{ index + 1 }}. {{ recommendation }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pdf-footer">
          <p>{{ $t('aiAnalysis.pdfFooter') }}</p>
        </div>
      </div>

      <!-- 页面显示内容 -->
      <div class="recommendations-display">
        <h2>{{ $t('aiAnalysis.modificationSuggestions') }}</h2>
        <p>{{ $t('aiAnalysis.modificationSuggestionsDesc') }}</p>

        <div class="recommendations-content">
          <div class="recommendations-text">
            <p v-for="(recommendation, index) in analysisResult.recommendations" :key="index">
              {{ recommendation }}
            </p>
          </div>
        </div>

        <div class="button-container">
          <el-button class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon> {{ $t('common.back') }}
          </el-button>
          <el-button class="continue-btn" @click="downloadReport">
            {{ $t('aiAnalysis.exportPDF') }}
          </el-button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { Plus, Document, Close, Loading, ArrowDown, ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import useUserStore from '@/store/modules/user'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
// 导入默认头像（所有用户使用相同的固定头像）
import defaultAvatar from '@/assets/images/default-avatar.svg'

// 获取用户Store实例
const userStore = useUserStore()
// 获取i18n实例
const { t } = useI18n()

// 用户信息 - 使用computed响应式获取，确保userStore更新时自动同步
// 所有用户使用固定的默认头像
const user = computed(() => ({
  name: userStore.nickName || userStore.name || t('common.username'),
  avatar: defaultAvatar // 使用固定的默认头像
}))

// 页面状态管理
const pageState = ref('initial')
const resultPage = ref('probability') // probability, dimensions, recommendations
const uploadedFile = ref(null)
const fileInput = ref(null)
const analysisResult = ref({
  aiScore: null,
  aiDimensions: [],
  qualityDimensions: [],
  recommendations: []
})
const chart = ref(null)
const radarChart = ref(null)
const pdfContent = ref(null) // PDF导出内容引用
let chartInstance = null
let radarChartInstance = null

// 页面历史记录
const pageHistory = ref([])

// 模拟分析结果
const mockAnalysisResult = {
  aiScore: 75,
  aiDimensions: [
    {
      name: '言語的困惑度',
      level: 2.5,
      evaluation: '専門用語が使われているにもかかわらず、文章の構造があまりにも整然としていて、自然な流暢さに欠けている。'
    },
    {
      name: '句式変化幅',
      level: 3.2,
      evaluation: '文章の表現パターンが非常に均一で、人間が書いた文章に特徴的な多様性が不足している。'
    },
    {
      name: '意味分布エントロピー',
      level: 4.8,
      evaluation: '意味の分布はある程度多様性を示しているが、完全に自然な人間の文章とは異なる特徴が見られる。'
    },
    {
      name: '推論複雑性',
      level: 5.5,
      evaluation: '論理展開は基本的に一貫しているが、推論の複雑さや深さに改善の余地がある。'
    },
    {
      name: '感情起伏度',
      level: 3.8,
      evaluation: '文章全体の感情表現がやや平坦で、人間の文章に特徴的な感情の起伏が少ない。'
    },
    {
      name: '構造とテンプレート使用傾向',
      level: 4.2,
      evaluation: '抽象的な定義から入り、論理展開が非常に典型的で、独自性に欠ける。'
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
      score: 72,
      evaluation: '選択した専門分野との関連性はありますが、より深い関連性を示す具体例が必要です。'
    },
    {
      name: '学習計画の合理性',
      score: 68,
      evaluation: '学習計画は基本的に合理的ですが、時間配分と具体的な実施方法についてより詳細な記述が必要です。'
    },
    {
      name: '文章構造と論理展開',
      score: 82,
      evaluation: '文章構造は整っていますが、段落間のつながりや論理の流れに改善の余地があります。'
    },
    {
      name: '表現力と説得力',
      score: 92,
      evaluation: '言語表現が流暢で、学術用語が正確で、文体が美しく、かなりの可読性があります。'
    },
    {
      name: '文法と日本語の正確性',
      score: 98,
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
        color: '#f56c6c' // 红色表示高AI生成可能性
      },
      label: {
        show: false
      },
      data: [
        { value: analysisResult.value.aiScore },
        { value: 100 - analysisResult.value.aiScore, itemStyle: { color: '#f0f0f0' } }
      ]
    }]
  }

  chartInstance.setOption(option)

  // 添加动画效果
  let currentValue = 0
  const animationDuration = 100
  const animationFrame = 16
  const totalFrames = animationDuration / animationFrame
  const valueIncrement = analysisResult.value.aiScore / totalFrames

  const animateChart = () => {
    if (currentValue < analysisResult.value.aiScore) {
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
      indicator: analysisResult.value.qualityDimensions.map(d => ({
        name: d.name,
        min: 0,
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
      },
      // 禁用alignTicks以避免警告
      alignTicks: false
    },
    series: [{
      type: 'radar',
      data: [{
        value: analysisResult.value.qualityDimensions.map(d => d.score),
        name: t('aiAnalysis.radarChartScoreName'),
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
    ElMessage.error(t('aiAnalysis.fileTypeError'))
    return
  }

  // 检查文件大小 (最大10MB)
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error(t('aiAnalysis.fileSizeLimit'))
    return
  }

  uploadedFile.value = {
    file: file,
    name: file.name,
    size: Math.round(file.size / 1024),
    type: fileType
  }

  pageState.value = 'fileUploaded'
  addToHistory('fileUploaded')
}

// 移除已选文件
const removeFile = () => {
  uploadedFile.value = null
  pageState.value = 'initial'
  fileInput.value.value = ''
  addToHistory('initial')
}

// 开始分析
const startAnalysis = async () => {
  if (!uploadedFile.value) return

  pageState.value = 'analyzing'
  addToHistory('analyzing')

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
      timeout: 120000 // 120秒超时
    })

    // 若依框架的request方法会自动处理响应格式
    analysisResult.value = result.data

    // 模拟延迟，让用户看到加载效果
    setTimeout(() => {
      pageState.value = 'analysisComplete'
      resultPage.value = 'probability'
      addToHistory('analysisComplete')
      nextTick(() => {
        initChart()
      })
    }, 2000)

  } catch (error) {
    ElMessage.error(t('aiAnalysis.analyzingError') + ': ' + error.message)
    pageState.value = 'fileUploaded'
    addToHistory('fileUploaded')
  }
}

// 切换到维度评价页面
const switchToDimensions = () => {
  resultPage.value = 'dimensions'
  addToHistory('dimensions')
  nextTick(() => {
    initRadarChart()
  })
}

// 切换到建议页面
const switchToRecommendations = () => {
  resultPage.value = 'recommendations'
  addToHistory('recommendations')
}

// 添加历史记录
const addToHistory = (page) => {
  pageHistory.value.push(page)
}

// 后退功能
const goBack = () => {
  if (pageHistory.value.length > 1) {
    // 移除当前页面
    pageHistory.value.pop()

    // 获取上一个页面
    let prevPage = pageHistory.value[pageHistory.value.length - 1]

    // 特殊处理：如果上一个页面是分析中状态，继续回退
    while (prevPage === 'analyzing' && pageHistory.value.length > 1) {
      pageHistory.value.pop()
      prevPage = pageHistory.value[pageHistory.value.length - 1]
    }

    // 处理特殊页面
    if (prevPage === 'analysisComplete') {
      // 回到分析完成状态，默认显示第一个页面
      pageState.value = 'analysisComplete'
      resultPage.value = 'probability'
      nextTick(() => {
        initChart() // 重新初始化饼图
      })
    } else if (prevPage === 'dimensions') {
      // 直接回退到维度页面
      pageState.value = 'analysisComplete'
      resultPage.value = 'dimensions'
      nextTick(() => {
        initRadarChart() // 重新初始化雷达图
      })
    } else if (prevPage === 'recommendations') {
      // 直接回退到建议页面
      pageState.value = 'analysisComplete'
      resultPage.value = 'recommendations'
    } else {
      pageState.value = prevPage
    }
  }
}

// 检查是否可以后退
const canGoBack = computed(() => {
  return pageHistory.value.length > 1
})

// 格式化日期（用于PDF导出）
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getProbabilityTextForPDF = (score) => {
  if (score >= 70) return t('aiAnalysis.aiProbabilityHigh')
  if (score >= 40) return t('aiAnalysis.aiProbabilityMedium')
  return t('aiAnalysis.aiProbabilityLow')
}

const getProbabilityClassForPDF = (score) => {
  if (score >= 70) return 'pdf-score-high'
  if (score >= 40) return 'pdf-score-medium'
  return 'pdf-score-low'
}

const getQualityScoreClass = (score) => {
  if (score >= 85) return 'pdf-quality-high'
  if (score >= 70) return 'pdf-quality-medium'
  return 'pdf-quality-low'
}

// 下载报告,导出PDF
const downloadReport = async () => {
  if (!pdfContent.value) {
    ElMessage.error('PDF内容未准备好')
    return
  }

  if (!analysisResult.value || Object.keys(analysisResult.value).length === 0) {
    ElMessage.error(t('aiAnalysis.analyzingError') + ': ' + '分析数据不存在，请先完成分析')
    return
  }

  // 确保uploadedFile存在，避免模板中访问undefined
  if (!uploadedFile.value) {
    ElMessage.error('文档信息不存在，无法导出PDF')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: t('aiAnalysis.generatingPDF'),
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 临时显示PDF内容区域
    pdfContent.value.style.display = 'block'
    pdfContent.value.style.position = 'absolute'
    pdfContent.value.style.left = '-9999px'
    pdfContent.value.style.top = '0'
    pdfContent.value.style.width = '210mm' // A4宽度
    pdfContent.value.style.padding = '20mm'
    pdfContent.value.style.boxSizing = 'border-box'
    pdfContent.value.style.overflow = 'visible'

    // 等待DOM更新和字体加载
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500)) // 等待字体渲染

    // 使用html2canvas将HTML转换为canvas（支持中文、日文）
    const canvas = await html2canvas(pdfContent.value, {
      scale: 2, // 提高清晰度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: pdfContent.value.scrollWidth,
      height: pdfContent.value.scrollHeight,
      windowWidth: pdfContent.value.scrollWidth,
      windowHeight: pdfContent.value.scrollHeight,
      allowTaint: false,
      removeContainer: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // 确保克隆的文档中字体正确加载
        const clonedElement = clonedDoc.querySelector('.pdf-export-content')
        if (clonedElement) {
          clonedElement.style.fontFamily = "'Microsoft YaHei', 'SimHei', 'Hiragino Sans GB', 'Meiryo', 'MS PGothic', sans-serif"
        }
      }
    })

    // 检查canvas是否创建成功
    if (!canvas || !canvas.width || !canvas.height) {
      throw new Error('Canvas创建失败，无法生成PDF')
    }

    // 隐藏PDF内容区域
    pdfContent.value.style.display = 'none'
    pdfContent.value.style.position = ''
    pdfContent.value.style.left = ''
    pdfContent.value.style.top = ''
    pdfContent.value.style.width = ''
    pdfContent.value.style.padding = ''
    pdfContent.value.style.boxSizing = ''
    pdfContent.value.style.overflow = ''

    // 创建PDF实例
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210 // A4宽度（mm）
    const pageHeight = 297 // A4高度（mm）
    const marginTop = 15 // 上边距（为页眉留空间）
    const marginBottom = 20 // 下边距（为页脚留空间）
    const contentHeight = pageHeight - marginTop - marginBottom // 可用内容高度
    
    // 计算图片尺寸
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const totalPages = Math.ceil(imgHeight / contentHeight)
    
    // 添加页眉页脚函数
    const addHeaderFooter = (pageNum, totalPages) => {
      // 页眉线
      pdf.setDrawColor(200, 200, 200)
      pdf.setLineWidth(0.5)
      pdf.line(10, marginTop - 5, pageWidth - 10, marginTop - 5)
      
      // 页眉文字
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text('PaperPurify', 15, marginTop - 2)
      
      // 页码
      const pageText = `${pageNum} / ${totalPages}`
      const pageTextWidth = pdf.getTextWidth(pageText)
      pdf.text(pageText, pageWidth - 15 - pageTextWidth, marginTop - 2)
      
      // 页脚线
      pdf.setDrawColor(200, 200, 200)
      pdf.line(10, pageHeight - marginBottom + 5, pageWidth - 10, pageHeight - marginBottom + 5)
      
      // 页脚文字（只使用英文，避免中文乱码）
      pdf.setFontSize(9)
      pdf.setTextColor(150, 150, 150)
      const footerText = 'PaperPurify'
      const footerTextWidth = pdf.getTextWidth(footerText)
      pdf.text(footerText, (pageWidth - footerTextWidth) / 2, pageHeight - marginBottom + 2)
    }

    // 创建临时canvas用于裁剪每一页
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    
    if (!tempCtx) {
      throw new Error('无法创建临时canvas上下文')
    }
    
    tempCanvas.width = canvas.width
    const pageHeightInPixels = Math.ceil(contentHeight * canvas.width / pageWidth)
    tempCanvas.height = pageHeightInPixels

    // 分页添加内容
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (pageNum > 1) {
        pdf.addPage()
      }
      
      // 计算当前页要裁剪的内容位置（像素）
      const sourceY = Math.floor((pageNum - 1) * pageHeightInPixels)
      const remainingHeight = canvas.height - sourceY
      const sourceHeight = Math.min(pageHeightInPixels, remainingHeight)
      
      if (sourceHeight <= 0) {
        break // 没有更多内容了
      }
      
      // 调整临时canvas高度以匹配实际内容
      if (sourceHeight < pageHeightInPixels) {
        tempCanvas.height = sourceHeight
      }
      
      // 清空临时canvas
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
      
      // 设置高质量渲染
      tempCtx.imageSmoothingEnabled = true
      tempCtx.imageSmoothingQuality = 'high'
      
      // 裁剪当前页的内容到临时canvas
      try {
        tempCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        )
      } catch (err) {
        console.error('绘制图片到临时canvas失败:', err)
        throw new Error('图片处理失败: ' + err.message)
      }
      
      // 将裁剪后的内容转换为图片
      const pageImgData = tempCanvas.toDataURL('image/png', 1.0)
      const pageImgHeight = (sourceHeight * imgWidth) / canvas.width
      
      // 添加图片到PDF
      pdf.addImage(
        pageImgData,
        'PNG',
        0,
        marginTop,
        imgWidth,
        pageImgHeight
      )
      
      // 添加页眉页脚
      addHeaderFooter(pageNum, totalPages)
      
      // 如果不是最后一页，添加分页装饰线
      if (pageNum < totalPages) {
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.5)
        pdf.line(25, pageHeight - marginBottom - 3, pageWidth - 25, pageHeight - marginBottom - 3)
      }
      
      // 恢复临时canvas高度
      tempCanvas.height = pageHeightInPixels
    }

    // 保存PDF
    const fileName = t('aiAnalysis.modificationSuggestions') + '.pdf'
    pdf.save(fileName)

    ElMessage.success(t('aiAnalysis.pdfExportSuccess'))
  } catch (error) {
    console.error('PDF导出错误:', error)
    ElMessage.error(t('aiAnalysis.pdfExportError') + ': ' + error.message)
    
    // 确保隐藏PDF内容区域
    if (pdfContent.value) {
      pdfContent.value.style.display = 'none'
      pdfContent.value.style.position = ''
      pdfContent.value.style.left = ''
      pdfContent.value.style.width = ''
      pdfContent.value.style.padding = ''
    }
  } finally {
    loading.close()
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    t('login.loginExpired'), 
    t('login.systemPrompt'), 
    {
      confirmButtonText: t('login.relogin'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    userStore.logOut().then(() => {
      location.href = '/'
    })
  }).catch(() => { })
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

// 根据level数字值（0.0-10.0）返回对应的颜色class
// 分数越高越接近人类写作，分数越低AI痕迹越明显
const getLevelClass = (level) => {
  if (typeof level === 'number') {
    if (level >= 7.0) return 'level-high' // 7.0-10.0：接近人类写作，绿色
    if (level >= 4.0) return 'level-medium' // 4.0-6.9：中等，黄色
    return 'level-low' // 0.0-3.9：AI痕迹明显，红色
  }
  // 兼容旧数据格式（如果level是字符串）
  return 'level-medium'
}

// 格式化level数字，保留1位小数
const formatLevel = (level) => {
  if (typeof level === 'number') {
    return level.toFixed(1)
  }
  return level || '0.0'
}

// 计算AI可能性文本和样式
const aiProbabilityText = computed(() => {
  if (analysisResult.value.aiScore >= 70) return t('aiAnalysis.aiProbabilityHigh')
  if (analysisResult.value.aiScore >= 40) return t('aiAnalysis.aiProbabilityMedium')
  return t('aiAnalysis.aiProbabilityLow')
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
  // 添加初始页面到历史记录
  addToHistory('initial')
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
  gap: 16px;
}

/* 语言切换器样式优化 */
.top-right :deep(.language-trigger) {
  margin-right: 4px;
}

.username {
  font-size: 16px;
  vertical-align: middle;
}

.logout-btn {
  color: #fff;
  margin-left: 15px;
  font-size: 16px;
  vertical-align: middle;
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

/* 各个section内的描述文本居中显示 */
.upload-section > p,
.uploaded-section > p,
.analyzing-section > p {
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
  margin-top: 10px;
  gap: 15px;
}

/* 后退按钮 */
.back-btn {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 500;
  width: 200px;
}

.back-btn:hover {
  background-color: #e6e6e6;
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
  width: 200px;
}

.continue-btn:disabled {
  background-color: #d9d9d9;
  color: #999;
  cursor: not-allowed;
}

.scroll-btn {
  background-color: #1890ff;
  width: 200px;
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
  width: 100%;
  max-width: 1200px;
  display: flex;
  margin-bottom: 40px;
  gap: 40px;
  flex-wrap: wrap;
}

.ai-probability {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  min-width: 500px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 响应式布局：小屏幕时改为单列 */
@media (max-width: 1200px) {
  .result-content {
    flex-direction: column;
    align-items: center;
  }
  
  .dimension-scores {
    width: 100%;
    max-width: 800px;
    min-width: auto;
  }
}

/* 更小屏幕时维度块改为单列 */
@media (max-width: 768px) {
  .dimension-scores {
    grid-template-columns: 1fr;
  }
}

.dimension {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
  width: 100%;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dimension h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.score-level {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  white-space: nowrap;
}

/* 根据level数字值显示颜色：分数越高（越接近人类写作）颜色越绿，分数越低（AI痕迹越明显）颜色越红 */
.score-level.level-high {
  background-color: #67c23a; /* 绿色：7.0-10.0，接近人类写作 */
  color: #fff;
}

.score-level.level-medium {
  background-color: #e6a23c; /* 黄色：4.0-6.9，中等 */
  color: #fff;
}

.score-level.level-low {
  background-color: #f56c6c; /* 红色：0.0-3.9，AI痕迹明显 */
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
  padding: 20px 20px;
}

.dimensions-section h2 {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 12px 0;
}

.dimensions-section > p {
  font-size: 14px;
  text-align: center;
  margin: 0 0 20px 0;
  color: #666;
}

.radar-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.radar-chart {
  width: 500px;
  height: 320px;
}

.quality-dimensions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}
.quality-dimension {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  background-color: #f9f9f9;
}

.quality-dimension h4 {
  font-size: 14px;
  margin: 0 0 6px 0;
}
.score-value {
  display: block;
  text-align: right;
  font-size: 12px;
  margin-top: 2px;
  font-weight: bold;
}
.dimension-evaluation {
  font-size: 12px;
  margin: 6px 0 0 0;
  line-height: 1.5;
}

/* 结果区域 - 页面3: 修改建议 */
.recommendations-section {
  width: 900px;
  max-width: 90%;
  margin: 0 auto;
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
  margin: 0 0 30px 0;
  color: #666;
  line-height: 1.6;
}
.recommendations-section .button-container {
  margin-top: 40px;
  padding-top: 20px;
}

.recommendations-content {
  margin-bottom: 30px;
}

.recommendations-content h4 {
  font-size: 18px;
  margin: 0 0 16px 0;
  text-align: center;
}

.recommendations-text {
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 25px;
  min-height: 600px;
  max-height: 600px;
  overflow-y: auto;
  line-height: 1.8;
}

.recommendations-text p {
  font-size: 15px;
  line-height: 1.8;
  margin: 0 0 15px 0;
  text-align: justify;
}

.recommendations-text p:last-child {
  margin-bottom: 0;
}

/* 确保所有结果页面在导出时显示正确 */
.result-section,
.dimensions-section,
.recommendations-section {
  box-sizing: border-box;
  background-color: white;
}

/* 优化PDF导出时的样式 */
@media print {
  .top-section,
  .button-container {
    display: none !important;
  }

  .main-content {
    padding: 0;
    margin: 0;
  }
}

/* 红色旋转圆圈加载动画 */
.red-circle-loader {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(245, 108, 108, 0.3);
  border-top: 4px solid #f56c6c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* PDF导出内容样式 */
.pdf-export-content {
  background-color: #ffffff;
  font-family: 'Microsoft YaHei', 'SimHei', 'Hiragino Sans GB', 'Meiryo', 'MS PGothic', sans-serif;
  color: #333;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.pdf-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e8e8e8;
}

.pdf-header h1 {
  font-size: 28px;
  font-weight: bold;
  color: #1890ff;
  margin: 0 0 10px 0;
}

.pdf-subtitle {
  font-size: 18px;
  color: #666;
  margin: 10px 0;
}

.pdf-date {
  font-size: 12px;
  color: #999;
  margin: 10px 0 0 0;
}

.pdf-body {
  padding: 20px 0;
}

.pdf-section {
  margin-bottom: 35px;
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-region-break-inside: avoid;
}

.pdf-section-title {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8e8e8;
}

.pdf-document-name {
  font-size: 16px;
  color: #333;
  padding: 12px 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  word-break: break-all;
}

.pdf-score-box {
  text-align: center;
  padding: 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin: 15px 0;
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-region-break-inside: avoid;
}

.pdf-score-value {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.pdf-score-label {
  font-size: 18px;
  font-weight: 500;
  padding: 6px 20px;
  border-radius: 20px;
  display: inline-block;
}

.pdf-score-high {
  background-color: #f56c6c;
  color: #fff;
}

.pdf-score-medium {
  background-color: #e6a23c;
  color: #fff;
}

.pdf-score-low {
  background-color: #67c23a;
  color: #fff;
}

.pdf-dimensions-list {
  margin-top: 15px;
}

.pdf-dimension-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-region-break-inside: avoid;
}

.pdf-dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.pdf-dimension-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.pdf-dimension-level {
  font-size: 14px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
  margin-left: 15px;
}

.pdf-dimension-level.level-high {
  background-color: #67c23a;
  color: #fff;
}

.pdf-dimension-level.level-medium {
  background-color: #e6a23c;
  color: #fff;
}

.pdf-dimension-level.level-low {
  background-color: #f56c6c;
  color: #fff;
}

.pdf-quality-score {
  font-size: 16px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
  margin-left: 15px;
}

.pdf-quality-high {
  background-color: #67c23a;
  color: #fff;
}

.pdf-quality-medium {
  background-color: #e6a23c;
  color: #fff;
}

.pdf-quality-low {
  background-color: #f56c6c;
  color: #fff;
}

.pdf-dimension-evaluation {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  text-align: justify;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pdf-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.8;
}

.pdf-recommendations {
  margin-top: 15px;
}

.pdf-recommendation-item {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-left: 4px solid #1890ff;
  border-radius: 4px;
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-region-break-inside: avoid;
}

.pdf-recommendation-text {
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
  color: #333;
  text-align: justify;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pdf-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
  text-align: center;
}

.pdf-footer p {
  font-size: 12px;
  color: #999;
  margin: 0;
}
</style>