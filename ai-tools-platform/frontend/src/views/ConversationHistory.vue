<template>
  <div class="conversation-history">
    <el-container>
      <el-header>
        <el-button @click="$router.back()">← 返回</el-button>
        <h1>对话历史记录</h1>
      </el-header>
      
      <el-main>
        <!-- 统计卡片 -->
        <el-row :gutter="20" v-if="stats" style="margin-bottom: 20px">
          <el-col :span="6">
            <el-card>
              <div class="stat-card">
                <div class="stat-number">{{ stats.totalConversations }}</div>
                <div class="stat-label">总对话数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div class="stat-card">
                <div class="stat-number">{{ stats.totalTokens }}</div>
                <div class="stat-label">总Token数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div class="stat-card">
                <div class="stat-number">{{ stats.todayConversations }}</div>
                <div class="stat-label">今日对话</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div class="stat-card">
                <div class="stat-number">{{ conversations.length }}</div>
                <div class="stat-label">当前显示</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 工具统计 -->
        <el-row v-if="stats?.toolStats?.length" style="margin-bottom: 20px">
          <el-col :span="24">
            <el-card>
              <template #header>
                <span>工具使用统计</span>
              </template>
              <el-tag
                v-for="stat in stats.toolStats"
                :key="stat.toolId"
                type="info"
                style="margin-right: 10px; margin-bottom: 10px"
              >
                {{ stat.toolName }}: {{ stat.count }}
              </el-tag>
            </el-card>
          </el-col>
        </el-row>

        <!-- 筛选和操作 -->
        <el-row style="margin-bottom: 20px">
          <el-col :span="12">
            <el-select
              v-model="selectedTool"
              placeholder="筛选工具"
              clearable
              style="width: 200px; margin-right: 10px"
              @change="loadConversations"
            >
              <el-option
                v-for="tool in availableTools"
                :key="tool.id"
                :label="tool.name"
                :value="tool.id"
              />
            </el-select>
            <el-button @click="loadConversations" :loading="loading">刷新</el-button>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-button type="danger" @click="clearAllHistory" :disabled="!conversations.length">
              清空历史
            </el-button>
          </el-col>
        </el-row>

        <!-- 对话列表 -->
        <el-timeline v-if="conversations.length">
          <el-timeline-item
            v-for="conv in conversations"
            :key="conv.conversationId"
            :timestamp="formatDate(conv.createdAt)"
            :type="conv.status === 'failed' ? 'danger' : 'success'"
          >
            <el-card class="conversation-card">
              <template #header>
                <div class="conversation-header">
                  <el-tag type="success" size="small">{{ conv.toolName }}</el-tag>
                  <el-tag v-if="conv.model" type="info" size="small" style="margin-left: 10px">
                    {{ conv.model }}
                  </el-tag>
                  <el-tag v-if="conv.tokensUsed" type="warning" size="small" style="margin-left: 10px">
                    {{ conv.tokensUsed }} tokens
                  </el-tag>
                  <el-tag v-if="conv.status === 'failed'" type="danger" size="small" style="margin-left: 10px">
                    失败
                  </el-tag>
                  <div style="flex: 1"></div>
                  <el-button
                    type="primary"
                    size="small"
                    @click="reuseConversation(conv)"
                  >
                    复用
                  </el-button>
                </div>
              </template>
              
              <div class="conversation-content">
                <div class="prompt-section">
                  <div class="section-title">📝 提示词:</div>
                  <div class="prompt-text">{{ conv.prompt }}</div>
                </div>
                
                <div v-if="conv.response" class="response-section">
                  <div class="section-title">🤖 回复:</div>
                  <div class="response-text">{{ conv.response }}</div>
                </div>
                
                <div v-if="conv.errorMessage" class="error-section">
                  <div class="section-title">❌ 错误:</div>
                  <div class="error-text">{{ conv.errorMessage }}</div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <!-- 空状态 -->
        <el-empty v-else description="暂无对话历史" />

        <!-- 加载更多 -->
        <div v-if="hasMore" style="text-align: center; margin-top: 20px">
          <el-button @click="loadMore" :loading="loading">加载更多</el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getTools } from '@/api/tools'
import { getConversationHistory, getConversationStats } from '@/api/tools'
import type { ToolConfig, Conversation, ConversationStats } from '@/api/tools'
import { useRouter } from 'vue-router'

const router = useRouter()
const conversations = ref<Conversation[]>([])
const stats = ref<ConversationStats | null>(null)
const availableTools = ref<ToolConfig[]>([])
const selectedTool = ref<string>('')
const loading = ref(false)
const offset = ref(0)
const limit = ref(20)
const hasMore = ref(true)

onMounted(async () => {
  await loadTools()
  await loadStats()
  await loadConversations()
})

const loadTools = async () => {
  try {
    const response = await getTools()
    availableTools.value = response.data || []
  } catch (error) {
    console.error('Failed to load tools:', error)
  }
}

const loadStats = async () => {
  try {
    const result = await getConversationStats()
    if (result.success) {
      stats.value = result.data
    } else {
      console.error('Failed to load stats:', result.error)
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadConversations = async () => {
  loading.value = true
  try {
    offset.value = 0
    const result = await getConversationHistory({
      toolId: selectedTool.value || undefined,
      limit: limit.value,
      offset: offset.value
    })
    
    if (result.success) {
      conversations.value = result.data || []
      hasMore.value = conversations.value.length >= limit.value
      offset.value = conversations.value.length
    } else {
      console.error('Failed to load conversations:', result.error)
      ElMessage.error('加载对话历史失败: ' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
    ElMessage.error('加载对话历史失败')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  loading.value = true
  try {
    const result = await getConversationHistory({
      toolId: selectedTool.value || undefined,
      limit: limit.value,
      offset: offset.value
    })
    
    if (result.success) {
      const newConversations = result.data || []
      conversations.value.push(...newConversations)
      hasMore.value = newConversations.length >= limit.value
      offset.value += newConversations.length
    } else {
      console.error('Failed to load more conversations:', result.error)
      ElMessage.error('加载更多失败: ' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('Failed to load more conversations:', error)
    ElMessage.error('加载更多失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const reuseConversation = (conv: Conversation) => {
  router.push({
    name: 'ToolDetail',
    params: { id: conv.toolId },
    query: { prompt: conv.prompt }
  })
}

const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有对话历史吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里可以添加清空历史的 API 调用
    ElMessage.warning('清空功能需要额外实现，暂时不可用')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.conversation-history {
  padding: 20px;
}

.el-header {
  display: flex;
  align-items: center;
  padding: 0;
  margin-bottom: 20px;
}

.el-header h1 {
  margin: 0 0 0 20px;
  font-size: 24px;
  font-weight: 600;
}

.stat-card {
  text-align: center;
  padding: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.conversation-card {
  margin-bottom: 10px;
}

.conversation-header {
  display: flex;
  align-items: center;
}

.conversation-content {
  font-size: 14px;
  line-height: 1.6;
}

.section-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  margin-top: 15px;
}

.section-title:first-child {
  margin-top: 0;
}

.prompt-text {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  color: #303133;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.response-text {
  background-color: #ecf5ff;
  padding: 12px;
  border-radius: 4px;
  color: #303133;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.error-text {
  background-color: #fef0f0;
  padding: 12px;
  border-radius: 4px;
  color: #f56c6c;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.el-timeline {
  padding-left: 20px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 25px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}
</style>
