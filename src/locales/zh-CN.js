/**
 * 中文语言包
 */
export default {
  common: {
    language: '语言',
    logout: '退出',  // 修改：从'退出登录'改为'退出'
    continue: '继续',
    back: '返回',
    confirm: '确认',  // 登出确认按钮使用
    cancel: '取消',
    submit: '提交',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    search: '搜索',
    reset: '重置',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    username: '用户名',
    password: '密码',
    account: '账号',
    confirmPassword: '确认密码',
    verificationCode: '验证码',
    register: '注册',
    login: '登录',
    alreadyHaveAccount: '已有账号？',
    termsOfService: '使用条款',
    privacyPolicy: '隐私政策',
    info: '解决提交前的风险和不安'
  },
  aiAnalysis: {
    title: 'PaperPurify｜留学生文书辅助工具',  // 修改：大标语
    description: '让留学生的志望理由书写得更自然、更有说服力。',  // 修改：小标语
    uploadHint: '点击或拖放以添加志望理由书',
    fileTypeSupport: '支持PDF、DOCX格式的文件。',
    fileSizeLimit: '文件大小请控制在10MB以下',
    fileTypeError: '仅支持PDF或DOCX格式的文件',
    uploadError: '文件上传过程中发生错误',
    analyzing: 'Loading...',
    analyzingError: '分析过程中发生错误',
    confirmContinue: '确认并继续',
    aiProbabilityTitle: '本文AI生成的可能性',
    aiProbabilityHigh: '高',
    aiProbabilityMedium: '中',
    aiProbabilityLow: '低',
    generateSpecificEvaluation: '具体评价',  // 修改：从'生成具体评价'改为'具体评价'
    detailedEvaluation: '详细评价',
    detailedEvaluationDesc: '从6个维度评估了论文的质量',
    scrollForMore: '详细',  // 修改：从'向下滚动查看更多'改为'详细'
    modificationSuggestions: '修改建议',  // 保持不变（中文本来就是'修改建议'）
    modificationSuggestionsDesc: '基于AI分析结果，提供具体可行的论文修改建议，有效降低AI比例，提升论文质量。',
    exportPDF: '导出PDF',
    generatingPDF: '正在生成PDF...',
    pdfExportSuccess: 'PDF导出完成',
    pdfExportError: 'PDF导出过程中发生错误',
    radarChartNote: '※ 详细的雷达图请在Web应用程序中查看',
    page: '页',
    of: '/',
    aiGenerationPossibilityAnalysis: 'AI生成可能性分析',
    pdfTitle: 'PaperPurify 分析报告',
    pdfGenerationDate: '生成日期',
    pdfFooter: 'PaperPurify - 净化论文AI成分，回归学术初心',
    pdfTableHeadAiDimension: '评价维度',
    pdfTableHeadLevel: '级别',
    pdfTableHeadEvaluation: '评价内容',
    pdfTableHeadScore: '分数',
    radarChartScoreName: '评价分数',
    pdfDocumentName: '文档名称',
    pdfAiGenerationTrace: 'AI生成痕迹分析',
    pdfDocumentQuality: '文档质量分析',
    pdfAiScore: 'AI生成可能性评分',
    pdfAiDimensionsTitle: 'AI生成痕迹六大维度',
    pdfQualityDimensionsTitle: '文档质量六大维度',
    pdfScoreUnit: '分'
  },
  login: {
    title: '登录',
    loginButton: '登录',
    loggingIn: '登录中...',
    registerButton: '注册',  // 登录页面的注册按钮
    rememberPassword: '记住密码',
    usernamePlaceholder: '账号',
    passwordPlaceholder: '密码',
    usernameRequired: '请输入您的账号',
    passwordRequired: '请输入您的密码',
    codeRequired: '请输入验证码',
    loginExpired: '登录状态已过期，您可以继续留在该页面，或者重新登录',
    systemPrompt: '系统提示',
    relogin: '重新登录',
    invalidSession: '无效的会话，或者会话已过期，请重新登录。',
    logoutConfirm: '操作确认: 退出后本次結果将无法找回。',  // 新增：登出确认消息
    logoutTitle: '退出'  // 新增：登出对话框标题
  },
  register: {
    title: '注册',
    registerButton: '注册',
    registering: '注册中...',
    loginLink: '登录',
    usernamePlaceholder: '账号',
    passwordPlaceholder: '密码',
    confirmPasswordPlaceholder: '确认密码',
    codePlaceholder: '验证码',
    usernameRequired: '请输入您的账号',
    usernameLength: '用户账号长度必须介于 2 和 20 之间',
    passwordRequired: '请输入您的密码',
    passwordLength: '用户密码长度必须介于 5 和 20 之间',
    passwordInvalidChars: '不能包含非法字符：< > \" \' \\ |',
    confirmPasswordRequired: '请再次输入您的密码',
    passwordMismatch: '两次输入的密码不一致',
    codeRequired: '请输入验证码',
    registerSuccess: '恭喜你，您的账号 {username} 注册成功！',
    registerSuccessTitle: '系统提示'
  },
  error: {
    networkError: '后端接口连接异常',
    timeout: '系统接口请求超时',
    systemError: '系统接口{code}异常',
    downloadError: '下载文件出现错误，请联系管理员！',
    dataProcessing: '数据正在处理，请勿重复提交',
    downloading: '正在下载数据，请稍候'
  }
}

