<template>
  <div class="simple-layout">
    <router-view />
  </div>
</template>

<script setup>
// 可以留空或添加少量布局逻辑
</script>

<style scoped>
.simple-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>