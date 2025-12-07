/**
 * i18n配置文件
 */
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import jaJP from './ja-JP'

// 从localStorage读取保存的语言设置，默认日文
// 使用try-catch避免在服务端渲染环境报错
let savedLocale = 'ja-JP'
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    savedLocale = localStorage.getItem('app-locale') || 'ja-JP'
  }
} catch (e) {
  console.warn('无法访问localStorage，使用默认语言:', e)
}

const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: savedLocale,
  fallbackLocale: 'ja-JP', // 如果找不到翻译，使用日文作为后备
  messages: {
    'zh-CN': zhCN,
    'ja-JP': jaJP
  },
  globalInjection: true, // 全局注入$t方法
  warnHtmlMessage: false // 禁用HTML消息警告
})

export default i18n

