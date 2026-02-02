<template>
  <div class="tools-page">
    <el-container>
      <el-header>
        <h1>🛠️ AI 工具箱</h1>
        <p class="subtitle">选择AI工具开始您的智能之旅</p>
      </el-header>
      <el-main>
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading" size="large">
            <Loading />
          </el-icon>
          <p>正在加载AI工具...</p>
        </div>
        
        <!-- 错误信息 -->
        <el-alert v-else-if="error" :title="error" type="error" :closable="false" class="error-alert">
          <template #default>
            <p>请检查：</p>
            <ul>
              <li>后端服务是否已启动 (npm run dev)</li>
              <li>网络连接是否正常</li>
              <li>浏览器控制台是否有更详细的错误信息</li>
            </ul>
          </template>
        </el-alert>
        
        <!-- 工具列表 -->
        <template v-else>
          <el-row :gutter="20">
            <el-col :span="12" v-for="tool in tools" :key="tool.id">
              <el-card class="tool-card" @click="goToTool(tool.id)">
                <div class="tool-header">
                  <div class="tool-icon">{{ getToolIcon(tool) }}</div>
                  <div class="tool-basic-info">
                    <h3 class="tool-name">{{ tool.name }}</h3>
                    <el-tag :type="getTagType(tool)" size="small">
                      {{ getStatusText(tool) }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="tool-description">
                  <p>{{ tool.description }}</p>
                </div>
                
                <div class="tool-details">
                  <div class="detail-item">
                    <span class="detail-label">📡 API提供商：</span>
                    <span class="detail-value">{{ tool.apiProvider || '官方API' }}</span>
                  </div>
                  
                  <div class="detail-item" v-if="tool.apiBaseURL">
                    <span class="detail-label">🔗 API地址：</span>
                    <span class="detail-value url" :title="tool.apiBaseURL">{{ tool.apiBaseURL }}</span>
                  </div>
                  
                  <div class="detail-item" v-if="tool.configuredModel">
                    <span class="detail-label">🤖 模型：</span>
                    <span class="detail-value">{{ tool.configuredModel }}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-label">🏷️ 分类：</span>
                    <span class="detail-value">{{ getCategoryText(tool.category) }}</span>
                  </div>
                </div>
                
                <div class="tool-action">
                  <el-button type="primary" size="small" plain>
                    使用工具
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-empty v-if="tools.length === 0" description="暂无可用工具" />
        </template>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTools } from '@/api/tools'
import type { ToolConfig } from '@/api/tools'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const router = useRouter()
const tools = ref<ToolConfig[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const response = await getTools()
    console.log('Tools API response:', response)
    
    if (response.success) {
      tools.value = response.data || []
      if (tools.value.length === 0) {
        error.value = '没有可用的AI工具，请检查后端配置'
      }
    } else {
      error.value = response.error || '加载工具失败'
      ElMessage.error(error.value)
    }
  } catch (err: any) {
    console.error('Failed to load tools:', err)
    error.value = err.message || '网络请求失败，请检查后端服务是否正常运行'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
})

const goToTool = (id: string) => {
  router.push(`/tool/${id}`)
}

const getToolIcon = (tool: ToolConfig) => {
  if (tool.id === 'openai') return '🤖'
  if (tool.id === 'custom-openai') return '🔌'
  return '⚡'
}

const getTagType = (tool: ToolConfig) => {
  if (tool.isConfigured) return 'success'
  if (tool.status === 'configuring') return 'warning'
  return 'info'
}

const getStatusText = (tool: ToolConfig) => {
  if (tool.isConfigured) return '✅ 已配置'
  if (tool.status === 'configuring') return '⚙️ 配置中'
  return '📦 内置工具'
}

const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    'text-generation': '文本生成',
    'image-generation': '图像生成',
    'audio-processing': '音频处理',
    'data-analysis': '数据分析',
    'translation': '翻译'
  }
  return categoryMap[category] || category
}
</script>

<style scoped>
.tools-page {
  padding: 20px;
}

.el-header {
  text-align: center;
  margin-bottom: 30px;
}

.el-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.tool-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  height: 100%;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.tool-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.tool-icon {
  font-size: 48px;
  margin-right: 15px;
}

.tool-basic-info {
  flex: 1;
}

.tool-name {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.tool-description {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.tool-description p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.tool-details {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #909399;
  font-weight: 500;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

.detail-value.url {
  font-family: monospace;
  font-size: 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-action {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-container .el-icon {
  margin-bottom: 20px;
}

.loading-container .is-loading {
  animation: rotating 2s linear infinite;
}

.error-alert {
  margin: 20px 0;
}

.error-alert ul {
  margin: 10px 0 0 20px;
  padding: 0;
}

.error-alert li {
  margin-bottom: 5px;
}
</style>
