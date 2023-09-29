<template>
  <RouterView />
</template>

<style>
:root {
  /* --el-color-primary: #74C7D1;
  --el-menu-hover-bg-color: rgba(0, 0, 0, 0.2); */
  --el-font-family: 'Public Sans', sans-serif;
}
</style>

<script setup>
import { RouterView } from 'vue-router'
import { useChatStore } from './stores'
import { onMounted } from 'vue'

onMounted(() => {
  useChatStore().dbInitFinshed = false
})
</script>
