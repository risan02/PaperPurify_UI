<template>
  <div class="my-full-page">
    <!-- 你的全屏页面内容 -->
    <h1>这是我的全屏应用</h1>
    <p>所有晴天号的布局元素都已隐藏。</p>
    <!-- 你可以在这里自由构建你的应用界面 -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// 进入页面时隐藏晴天号的布局元素
onMounted(() => {
  // 隐藏侧边栏 (根据晴天号的Vuex状态管理方式)
  store.dispatch('app/toggleSideBarHide', true) // 隐藏侧边栏
  store.dispatch('app/toggleDevice', 'mobile') // 强制切换到移动端布局（侧边栏会自动隐藏）

  // 隐藏顶部导航栏（TagsView）
  store.commit('settings/SET_TAGS_VIEW', false) // 直接修改Vuex state隐藏标签栏
  store.commit('settings/SET_TOP_NAV', false)   // 隐藏顶部导航（如果存在）

  // 你也可以直接操作DOM来隐藏元素（备用方案）
  const sidebar = document.querySelector('.sidebar-container')
  const navbar = document.querySelector('.navbar')
  const tagsView = document.querySelector('.tags-view-container')

  if (sidebar) sidebar.style.display = 'none'
  if (navbar) navbar.style.display = 'none'
  if (tagsView) tagsView.style.display = 'none'
})

// 如果可能会离开此页面回到晴天号其他页面，可以在离开时恢复显示
onUnmounted(() => {
  // 恢复显示布局元素
  store.dispatch('app/toggleSideBarHide', false)
  store.dispatch('app/toggleDevice', 'desktop')
  store.commit('settings/SET_TAGS_VIEW', true)
  store.commit('settings/SET_TOP_NAV', true)

  // 恢复DOM元素的显示
  const sidebar = document.querySelector('.sidebar-container')
  const navbar = document.querySelector('.navbar')
  const tagsView = document.querySelector('.tags-view-container')

  if (sidebar) sidebar.style.display = 'block'
  if (navbar) navbar.style.display = 'block'
  if (tagsView) tagsView.style.display = 'block'
})
</script>

<style scoped>
.my-full-page {
  width: 100vw;     /* 视口宽 */
  height: 100vh;    /* 视口高 */
  padding: 20px;
  box-sizing: border-box;
  /* 添加你需要的其他样式 */
}
</style>