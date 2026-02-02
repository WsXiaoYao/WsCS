<template>
  <el-menu
    mode="horizontal"
    :router="true"
    :default-active="activeMenu"
    background-color="#409eff"
    text-color="#fff"
    active-text-color="#ffd04b"
  >
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="/tools">
      <el-icon><Tools /></el-icon>
      <span>AI工具箱</span>
    </el-menu-item>
    <el-menu-item index="/history">
      <el-icon><Clock /></el-icon>
      <span>历史记录</span>
    </el-menu-item>
    <el-menu-item index="/about">
      <el-icon><InfoFilled /></el-icon>
      <span>关于</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Tools, InfoFilled, Clock } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.el-menu {
  border-bottom: none;
}
</style>
