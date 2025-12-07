<template>
  <el-dropdown @command="handleLanguageChange" trigger="click" placement="bottom-end">
    <span class="language-trigger">
      <span class="language-text">{{ currentLanguageText }}</span>
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          command="ja-JP" 
          :class="{ 'is-selected': currentLocale === 'ja-JP' }"
        >
          <span class="language-item">
            <el-icon v-if="currentLocale === 'ja-JP'" class="check-icon"><Check /></el-icon>
            <span :class="{ 'selected-text': currentLocale === 'ja-JP' }">日本語</span>
          </span>
        </el-dropdown-item>
        <el-dropdown-item 
          command="zh-CN"
          :class="{ 'is-selected': currentLocale === 'zh-CN' }"
        >
          <span class="language-item">
            <el-icon v-if="currentLocale === 'zh-CN'" class="check-icon"><Check /></el-icon>
            <span :class="{ 'selected-text': currentLocale === 'zh-CN' }">中文</span>
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Check } from '@element-plus/icons-vue'

const { locale, t } = useI18n()

const currentLocale = computed(() => locale.value)

const currentLanguageText = computed(() => {
  return locale.value === 'ja-JP' ? '日本語' : '中文'
})

const handleLanguageChange = (lang) => {
  locale.value = lang
  localStorage.setItem('app-locale', lang)
  // 触发页面刷新以更新所有文本（包括已加载的组件）
  window.location.reload()
}
</script>

<style scoped lang="scss">
.language-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 14px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .language-text {
    font-size: 14px;
    font-weight: 500;
  }
  
  .el-icon--right {
    font-size: 12px;
    margin-left: 2px;
  }
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  
  &.is-selected {
    background-color: #f5f7fa;
    color: #409eff;
  }
}

.language-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  
  .check-icon {
    color: #409eff;
    font-size: 16px;
  }
  
  .selected-text {
    font-weight: 500;
    color: #409eff;
  }
}
</style>

