import axios from 'axios'
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'

// 简单的翻译函数（用于非Vue组件环境）
const getLocaleText = (key) => {
  const locale = localStorage.getItem('app-locale') || 'ja-JP'
  const translations = {
    'ja-JP': {
      'login.loginExpired': 'ログイン状態が期限切れです。このページに留まるか、再ログインしてください',
      'login.systemPrompt': 'システムプロンプト',
      'login.relogin': '再ログイン',
      'common.cancel': 'キャンセル',
      'login.invalidSession': '無効なセッション、またはセッションが期限切れです。再ログインしてください。',
      'error.networkError': 'バックエンドインターフェース接続異常',
      'error.timeout': 'システムインターフェースリクエストタイムアウト',
      'error.systemError': 'システムインターフェース{code}異常',
      'error.dataProcessing': 'データを処理中です。重複送信しないでください',
      'error.downloadError': 'ファイルのダウンロード中にエラーが発生しました。管理者に連絡してください！',
      'common.downloading': 'データをダウンロード中です。少々お待ちください'
    },
    'zh-CN': {
      'login.loginExpired': '登录状态已过期，您可以继续留在该页面，或者重新登录',
      'login.systemPrompt': '系统提示',
      'login.relogin': '重新登录',
      'common.cancel': '取消',
      'login.invalidSession': '无效的会话，或者会话已过期，请重新登录。',
      'error.networkError': '后端接口连接异常',
      'error.timeout': '系统接口请求超时',
      'error.systemError': '系统接口{code}异常',
      'error.dataProcessing': '数据正在处理，请勿重复提交',
      'error.downloadError': '下载文件出现错误，请联系管理员！',
      'common.downloading': '正在下载数据，请稍候'
    }
  }
  return translations[locale]?.[key] || key
}

let downloadLoadingInstance
// 是否显示重新登录
export let isRelogin = { show: false }

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  // 添加语言头：从localStorage读取当前语言设置，默认日文
  const currentLocale = localStorage.getItem('app-locale') || 'ja-JP'
  config.headers['Accept-Language'] = currentLocale
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
    const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
      return config
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url                // 请求地址
      const s_data = sessionObj.data              // 请求数据
      const s_time = sessionObj.time              // 请求时间
      const interval = 1000                       // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = getLocaleText('error.dataProcessing') || '数据正在处理，请勿重复提交'
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true
        ElMessageBox.confirm(
          getLocaleText('login.loginExpired'), 
          getLocaleText('login.systemPrompt'), 
          { 
            confirmButtonText: getLocaleText('login.relogin'), 
            cancelButtonText: getLocaleText('common.cancel'), 
            type: 'warning' 
          }
        ).then(() => {
          isRelogin.show = false
          useUserStore().logOut().then(() => {
            location.href = '/index'
          })
      }).catch(() => {
        isRelogin.show = false
      })
    }
    return Promise.reject(getLocaleText('login.invalidSession'))
    } else if (code === 500) {
      ElMessage({ message: msg, type: 'error' })
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      ElNotification.error({ title: msg })
      return Promise.reject('error')
    } else {
      return  Promise.resolve(res.data)
    }
  },
  error => {
    console.log('err' + error)
    let { message } = error
    if (message == "Network Error") {
      message = getLocaleText('error.networkError')
    } else if (message.includes("timeout")) {
      message = getLocaleText('error.timeout')
    } else if (message.includes("Request failed with status code")) {
      const code = message.substr(message.length - 3)
      message = getLocaleText('error.systemError').replace('{code}', code)
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url, params, filename, config) {
  const downloadText = getLocaleText('common.downloading') || '正在下载数据，请稍候'
  downloadLoadingInstance = ElLoading.service({ text: downloadText, background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data)
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text()
      const rspObj = JSON.parse(resText)
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      ElMessage.error(errMsg)
    }
    downloadLoadingInstance.close()
  }).catch((r) => {
    console.error(r)
    ElMessage.error(getLocaleText('error.downloadError') || '下载文件出现错误，请联系管理员！')
    downloadLoadingInstance.close()
  })
}

export default service
