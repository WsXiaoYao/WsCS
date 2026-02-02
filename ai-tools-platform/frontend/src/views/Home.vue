<template>
  <div class="home">
    <el-container>
      <el-main>
        <div class="hero-section">
          <h1>AI Tools Platform</h1>
          <p class="subtitle">一个用于串联多个AI工具的全栈应用平台</p>
        </div>
        
        <el-row :gutter="20" class="features">
          <el-col :span="8">
            <el-card class="feature-card">
              <h3>🔌 多工具集成</h3>
              <p>集成多个AI工具，一站式管理</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card">
              <h3>🔗 链式调用</h3>
              <p>工具间链式调用，实现复杂任务</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card">
              <h3>📊 结果可视化</h3>
              <p>直观展示执行结果</p>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="action-area">
          <el-button type="primary" size="large" @click="$router.push('/tools')">
            <el-icon style="margin-right: 8px"><Tools /></el-icon>
            进入AI工具箱
          </el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 首页组件
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-section {
  text-align: center;
  padding: 60px 20px 40px;
}

.hero-section h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
}

.subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.features {
  padding: 0 40px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  color: #409eff;
  margin-bottom: 15px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.action-area {
  text-align: center;
  margin-top: 60px;
  padding-bottom: 60px;
}

.action-area .el-button {
  padding: 20px 40px;
  font-size: 18px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}
</style>
