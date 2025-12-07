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
          <span class="score-value">{{ dimension.score }}/100</span>
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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { Plus, Document, Close, Loading, ArrowDown, ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
const analysisResult = ref({})
const chart = ref(null)
const radarChart = ref(null)
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
        value: analysisResult.value.qualityDimensions.map(d => d.score),
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

// 下载报告,导出PDF
const downloadReport = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: t('aiAnalysis.generatingPDF'),
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 创建PDF实例
    const doc = new jsPDF('p', 'mm', 'a4')

    // 添加标题
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text(t('aiAnalysis.pdfTitle'), 105, 20, { align: 'center' })

    // 添加日期
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    const now = new Date()
    doc.text(`${t('aiAnalysis.pdfGenerationDate')}: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, 30, { align: 'center' })

    let yPosition = 45

    // 1. 添加AI生成可能性部分
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text(t('aiAnalysis.aiGenerationPossibilityAnalysis'), 20, yPosition)
    yPosition += 10

    doc.setFontSize(14)
    const aiProbabilityText = analysisResult.value.aiScore >= 70 ? t('aiAnalysis.aiProbabilityHigh') :
        analysisResult.value.aiScore >= 40 ? t('aiAnalysis.aiProbabilityMedium') : t('aiAnalysis.aiProbabilityLow')
    doc.text(`${t('aiAnalysis.aiProbabilityTitle')}: ${aiProbabilityText} (${analysisResult.value.aiScore}%)`, 20, yPosition)
    yPosition += 15

    // 添加AI维度评分表格 - 使用autoTable函数而不是doc.autoTable
    // 注意：表格内容由后台返回，表格头部使用i18n翻译
    autoTable(doc, {
      startY: yPosition,
      head: [[t('aiAnalysis.pdfTableHeadAiDimension'), t('aiAnalysis.pdfTableHeadLevel'), t('aiAnalysis.pdfTableHeadEvaluation')]],
      body: analysisResult.value.aiDimensions.map(d => [
        d.name,
        typeof d.level === 'number' ? d.level.toFixed(1) : d.level,
        d.evaluation
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: 255
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' }
      }
    })

    yPosition = doc.lastAutoTable.finalY + 15

    // 添加新页面
    doc.addPage()
    yPosition = 20

    // 2. 添加详细评价部分
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text(t('aiAnalysis.detailedEvaluation'), 20, yPosition)
    yPosition += 10

    // 添加质量维度评分表格 - 使用autoTable函数而不是doc.autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [[t('aiAnalysis.pdfTableHeadAiDimension'), t('aiAnalysis.pdfTableHeadScore'), t('aiAnalysis.pdfTableHeadEvaluation')]],
      body: analysisResult.value.qualityDimensions.map(d => [d.name, d.score, d.evaluation]),
      theme: 'grid',
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: 255
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' }
      }
    })

    yPosition = doc.lastAutoTable.finalY + 15

    // 添加雷达图占位说明
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(t('aiAnalysis.radarChartNote'), 20, yPosition)

    // 添加新页面
    doc.addPage()
    yPosition = 20

    // 3. 添加修改建议部分
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text(t('aiAnalysis.modificationSuggestions'), 20, yPosition)
    yPosition += 10

    doc.setFontSize(12)
    doc.setTextColor(80, 80, 80)
    doc.text(t('aiAnalysis.modificationSuggestionsDesc'), 20, yPosition, { maxWidth: 170 })
    yPosition += 15

    // 添加建议列表
    analysisResult.value.recommendations.forEach((rec, index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.text(`${index + 1}. ${rec}`, 25, yPosition, { maxWidth: 160 })
      yPosition += 20
    })

    // 添加页脚
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`${t('aiAnalysis.page')} ${i} ${t('aiAnalysis.of')} ${totalPages}`, 105, 285, { align: 'center' })
      doc.text(t('aiAnalysis.pdfFooter'), 105, 290, { align: 'center' })
    }

    // 保存PDF
    const fileName = t('aiAnalysis.pdfTitle') + '.pdf'
    doc.save(fileName)

    ElMessage.success(t('aiAnalysis.pdfExportSuccess'))
  } catch (error) {
    console.error('PDF导出错误:', error)
    ElMessage.error(t('aiAnalysis.pdfExportError') + ': ' + error.message)
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
</style>