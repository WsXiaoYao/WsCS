<template>
  <div class="about">
    <el-container>
      <el-main>
        <el-card>
          <h2>关于 AI Tools Platform</h2>
          <p>这是一个用于串联多个AI工具的全栈应用平台。</p>
          
          <h3>支持的AI工具</h3>
          <ul>
            <li>OpenAI GPT (官方)</li>
            <li>第三方OpenAI兼容API (支持GPT/Claude/Gemini等)</li>
          </ul>
          
          <h3>功能特性</h3>
          <ul>
            <li>🔌 多AI工具集成接口</li>
            <li>🔄 工具链式调用</li>
            <li>📊 结果可视化</li>
            <li>🎨 响应式设计</li>
          </ul>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 关于页面
</script>

<style scoped>
.about {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h3 {
  margin-top: 30px;
  color: #409eff;
}

ul {
  line-height: 1.8;
}
</style>
