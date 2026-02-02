<template>
  <div class="tool-detail-kimi">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-button" v-if="isMobile">
      <el-button 
        :icon="showSidebar ? Fold : Expand" 
        circle 
        @click="toggleSidebar"
        size="large"
      />
    </div>

    <!-- 左侧边栏 -->
    <div class="left-sidebar" :class="{ 'mobile-open': showSidebar && isMobile, 'mobile-hidden': !showSidebar && isMobile }">
      <!-- API 信息卡片 -->
      <div class="api-info-card">
        <div class="api-header">
          <div class="api-icon">🤖</div>
          <div class="api-title">
            <div class="api-name">{{ tool?.name || 'AI Assistant' }}</div>
            <div class="api-provider">{{ tool?.apiProvider || 'vveai.com' }}</div>
          </div>
        </div>
        <div class="api-config">
          <div class="config-item">
            <span class="config-label">基础URL:</span>
            <span class="config-value">{{ tool?.apiBaseURL || 'https://api.vveai.com/v1' }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">默认模型:</span>
            <span class="config-value">{{ tool?.configuredModel || 'gpt-3.5-turbo' }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">状态:</span>
            <el-tag :type="tool?.isConfigured ? 'success' : 'danger'" size="small">
              {{ tool?.isConfigured ? '已配置' : '未配置' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="history-section">
        <div class="history-header">
          <h3>历史对话</h3>
          <el-button type="text" size="small" @click="loadConversationHistory" :loading="historyLoading">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        <div class="history-list" v-if="conversationHistory.length">
          <div
            v-for="conv in conversationHistory"
            :key="conv.conversationId"
            class="history-item"
            :class="{ active: currentConversationId === conv.conversationId }"
          >
            <div class="history-item-content" @click="loadConversation(conv.conversationId)">
              <div class="history-item-title">
                {{ conv.prompt.substring(0, 30) }}{{ conv.prompt.length > 30 ? '...' : '' }}
              </div>
              <div class="history-item-meta">
                <span class="history-date">{{ formatDate(conv.createdAt) }}</span>
                <el-tag v-if="conv.model" size="small" type="info">{{ conv.model }}</el-tag>
              </div>
            </div>
            <el-button
              type="text"
              size="small"
              class="history-delete-btn"
              @click.stop="handleDeleteConversation(conv.conversationId)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <el-empty v-else description="暂无历史记录" :image-size="60" />
      </div>

      <!-- 设置选项 -->
      <div class="settings-section">
        <h3>设置</h3>
        <div class="setting-item">
          <label>模型选择</label>
          <el-select
            v-model="inputForm.model"
            placeholder="选择模型"
            size="small"
            style="width: 100%"
            :loading="modelsLoading"
            filterable
            clearable
            :filter-method="filterModels"
            no-match-text="未找到匹配的模型"
            :reserve-keyword="false"
          >
            <el-option
              v-for="model in filteredModels"
              :key="model.id"
              :label="model.id"
              :value="model.id"
            >
              <div class="model-option">
                <div class="model-id">{{ model.id }}</div>
                <div class="model-meta">
                  <el-tag size="small" type="info" v-if="model.owned_by">
                    {{ model.owned_by }}
                  </el-tag>
                </div>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 图像生成专用参数 -->
        <div v-if="tool && tool.category === 'image-generation'" class="image-settings">
          <div class="setting-item">
            <label>图片尺寸</label>
            <el-select
              v-model="inputForm.size"
              placeholder="选择尺寸"
              size="small"
              style="width: 100%"
              clearable
            >
              <el-option-group label="基础尺寸">
                <el-option label="1024x1024 (1:1)" value="1024x1024" />
                <el-option label="832x1248 (2:3)" value="832x1248" />
                <el-option label="1248x832 (3:2)" value="1248x832" />
                <el-option label="864x1184 (3:4)" value="864x1184" />
                <el-option label="1184x864 (4:3)" value="1184x864" />
                <el-option label="896x1152 (4:5)" value="896x1152" />
                <el-option label="1152x896 (5:4)" value="1152x896" />
                <el-option label="768x1344 (9:16)" value="768x1344" />
                <el-option label="1344x768 (16:9)" value="1344x768" />
                <el-option label="1536x672 (21:9)" value="1536x672" />
              </el-option-group>
              <el-option-group label="2K 高清 (Pro模型)">
                <el-option label="2048x2048 (1:1)" value="2048x2048" />
                <el-option label="1696x2528 (2:3)" value="1696x2528" />
                <el-option label="2528x1696 (3:2)" value="2528x1696" />
                <el-option label="1792x2400 (3:4)" value="1792x2400" />
                <el-option label="2400x1792 (4:3)" value="2400x1792" />
                <el-option label="1856x2304 (4:5)" value="1856x2304" />
                <el-option label="2304x1856 (5:4)" value="2304x1856" />
                <el-option label="1536x2752 (9:16)" value="1536x2752" />
                <el-option label="2752x1536 (16:9)" value="2752x1536" />
                <el-option label="3168x1344 (21:9)" value="3168x1344" />
              </el-option-group>
              <el-option-group label="4K 超清 (Pro模型)">
                <el-option label="4096x4096 (1:1)" value="4096x4096" />
                <el-option label="3392x5056 (2:3)" value="3392x5056" />
                <el-option label="5056x3392 (3:2)" value="5056x3392" />
                <el-option label="3584x4800 (3:4)" value="3584x4800" />
                <el-option label="4800x3584 (4:3)" value="4800x3584" />
                <el-option label="3712x4608 (4:5)" value="3712x4608" />
                <el-option label="4608x3712 (5:4)" value="4608x3712" />
                <el-option label="3072x5504 (9:16)" value="3072x5504" />
                <el-option label="5504x3072 (16:9)" value="5504x3072" />
                <el-option label="6336x2688 (21:9)" value="6336x2688" />
              </el-option-group>
              <el-option-group label="宽高比 (Pro模型)">
                <el-option label="1:1" value="1:1" />
                <el-option label="2:3" value="2:3" />
                <el-option label="3:2" value="3:2" />
                <el-option label="3:4" value="3:4" />
                <el-option label="4:3" value="4:3" />
                <el-option label="4:5" value="4:5" />
                <el-option label="5:4" value="5:4" />
                <el-option label="9:16" value="9:16" />
                <el-option label="16:9" value="16:9" />
                <el-option label="21:9" value="21:9" />
              </el-option-group>
            </el-select>
          </div>

          <div class="setting-item">
            <label>返回格式</label>
            <el-radio-group v-model="inputForm.response_format" size="small">
              <el-radio-button value="b64_json">Base64 (稳定)</el-radio-button>
              <el-radio-button value="url">URL (快)</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 非图像生成工具显示温度参数 -->
        <div v-else class="setting-item">
          <label>随机性 (Temperature)</label>
          <el-slider
            v-model="inputForm.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            size="small"
            :format-tooltip="(val) => val.toFixed(1)"
          />
        </div>
      </div>
    </div>

    <!-- 移动端遮罩层 -->
    <div 
      class="mobile-overlay" 
      v-if="isMobile && showSidebar" 
      @click="toggleSidebar"
    ></div>

    <!-- 右侧对话区域 -->
    <div class="right-chat-area">
      <!-- 对话历史 -->
      <div class="chat-messages" ref="chatMessagesRef">
        <div
          v-for="(message, index) in chatMessages"
          :key="index"
          class="message-wrapper"
          :class="message.role"
        >
          <div class="message-avatar">
            {{ message.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{ message.role === 'user' ? '你' : 'AI助手' }}</span>
              <span v-if="message.model" class="message-model">{{ message.model }}</span>
              <span v-if="message.tokensUsed" class="message-tokens">{{ message.tokensUsed }} tokens</span>
            </div>
            <div class="message-text" v-html="renderMarkdown(message.content)"></div>
            <div v-if="message.errorMessage" class="message-error">
              <el-alert :title="message.errorMessage" type="error" :closable="false" />
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="chatMessages.length === 0" class="empty-chat">
          <div class="empty-icon">🤖</div>
          <h2>你好，我是AI助手</h2>
          <p>有什么可以帮助你的吗？</p>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <!-- 文件上传组件 -->
        <FileUpload
          v-if="tool && (tool.id === 'custom-openai' || tool.id === 'gemini-image')"
          :conversationId="currentConversationId"
          apiBaseUrl="/api"
          @fileUploaded="onFileUploaded"
          @fileRemoved="onFileRemoved"
          class="file-upload-comp"
        />
        
        <div class="input-toolbar" v-if="tool">
          <el-tag size="small" type="info">{{ tool.name }}</el-tag>
          <el-tag v-if="inputForm.model" size="small" type="success">{{ inputForm.model }}</el-tag>
          <span class="temperature-display">温度: {{ inputForm.temperature.toFixed(1) }}</span>
        </div>
        <div class="input-container">
          <el-input
            v-model="inputForm.prompt"
            type="textarea"
            :rows="3"
            placeholder="输入你的问题..."
            resize="none"
            @keydown.enter.exact.prevent="executeTool"
          />
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!inputForm.prompt.trim() && uploadedFiles.length === 0"
            @click="executeTool"
            class="send-button"
          >
            <el-icon><Position /></el-icon>
          </el-button>
        </div>
        <div class="input-tips">
          <el-text size="small" type="info">
            按 Enter 发送，Shift + Enter 换行
          </el-text>
        </div>
      </div>

      <!-- 图片预览对话框 -->
      <el-dialog
        v-model="imagePreviewVisible"
        title="图片预览"
        width="95%"
        top="2vh"
        :destroy-on-close="true"
        class="image-preview-dialog"
        :show-close="true"
      >
        <div class="image-preview-container" @click="handlePreviewClick">
          <img :src="previewImageUrl" alt="预览图片" class="preview-image" :style="{ transform: `scale(${imageZoomLevel})` }" />
        </div>
        <template #footer>
          <el-button @click="imagePreviewVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadImage">下载图片</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Position, Refresh, Fold, Expand, Delete } from '@element-plus/icons-vue'
import { getTools, executeTool as execTool, getModels, getConversationHistory, getConversationStats, deleteConversation as deleteConv } from '@/api/tools'
import type { ToolConfig, ModelInfo, Conversation } from '@/api/tools'
import FileUpload from '@/components/FileUpload.vue'
import type { UploadedFile } from '@/components/FileUpload.vue'
import { marked } from 'marked'

const route = useRoute()
const tool = ref<ToolConfig | null>(null)
const models = ref<ModelInfo[]>([])
const modelsLoading = ref(false)
const loading = ref(false)
const historyLoading = ref(false)
const showHistory = ref(false)
const conversationHistory = ref<Conversation[]>([])
const chatMessagesRef = ref<HTMLElement>()
const currentConversationId = ref<string>(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
const isMobile = ref(window.innerWidth <= 768)
const showSidebar = ref(false)

// 模型搜索
const modelSearchKeyword = ref('')

// 过滤后的模型列表
const filteredModels = computed(() => {
  if (!modelSearchKeyword.value) {
    return models.value
  }
  
  const keyword = modelSearchKeyword.value.toLowerCase()
  return models.value.filter(model => {
    return model.id.toLowerCase().includes(keyword) ||
           (model.owned_by && model.owned_by.toLowerCase().includes(keyword))
  })
})

const inputForm = ref({
  prompt: '',
  model: 'gemini-3-flash-preview-search',
  temperature: 0.7,
  size: '',
  aspect_ratio: '',
  response_format: 'b64_json'
})

const chatMessages = ref<Array<{
  role: 'user' | 'assistant'
  content: string
  model?: string
  tokensUsed?: number
  errorMessage?: string
}>>([])

const uploadedFiles = ref<UploadedFile[]>([])

// 图片预览
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

onMounted(async () => {
  const response = await getTools()
  const tools = response.data || []
  tool.value = tools.find((t: ToolConfig) => t.id === route.params.id) || null
  
  if (tool.value && (tool.value.id === 'custom-openai' || tool.value.id === 'gemini-image')) {
    await loadModels()
  }

  // 加载历史记录
  await loadConversationHistory()

  // 如果有查询参数prompt，自动执行
  if (route.query.prompt) {
    inputForm.value.prompt = route.query.prompt as string
    await executeTool()
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showSidebar.value = false
  }
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const loadModels = async () => {
  if (!tool.value) return

  modelsLoading.value = true
  try {
    const result = await getModels(tool.value.id)
    if (result.success) {
      models.value = result.data || []
      if (models.value.length > 0) {
        // 对于 Gemini 图像生成工具，默认选择 nano-banana 模型
        if (tool.value.id === 'gemini-image') {
          const nanoBananaModel = models.value.find(m => m.id.includes('nano-banana'))
          if (nanoBananaModel) {
            inputForm.value.model = nanoBananaModel.id
          } else {
            inputForm.value.model = models.value[0].id
          }
        } else if (tool.value.id === 'custom-openai') {
          // 对于 Custom OpenAI 工具，默认选择 gemini-3-flash-preview-search
          const defaultModel = models.value.find(m => m.id === 'gemini-3-flash-preview-search')
          if (defaultModel) {
            inputForm.value.model = defaultModel.id
          } else {
            inputForm.value.model = models.value[0].id
          }
        } else {
          // 其他工具选择第一个模型
          inputForm.value.model = models.value[0].id
        }
      }
    }
  } catch (error) {
    console.error('Failed to load models:', error)
  } finally {
    modelsLoading.value = false
  }
}

// 模型过滤方法
const filterModels = (keyword: string) => {
  modelSearchKeyword.value = keyword
}

const loadConversationHistory = async () => {
  if (!tool.value) return

  historyLoading.value = true
  try {
    const result = await getConversationHistory({
      toolId: tool.value.id,
      limit: 20,
      offset: 0
    })

    if (result.success) {
      conversationHistory.value = result.data || []
    }
  } catch (error) {
    console.error('Failed to load conversation history:', error)
  } finally {
    historyLoading.value = false
  }
}

const handleDeleteConversation = async (conversationId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条对话记录吗？',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await deleteConv(conversationId)
    if (result.success) {
      ElMessage.success('删除成功')
      // 刷新历史记录
      await loadConversationHistory()
      // 如果删除的是当前对话，清空对话
      if (currentConversationId.value === conversationId) {
        chatMessages.value = []
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete conversation:', error)
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
}

const executeTool = async () => {
  if (!tool.value) return
  
  const prompt = inputForm.value.prompt.trim()
  
  // 检查是否有内容（文字或文件）
  if (!prompt && uploadedFiles.value.length === 0) {
    ElMessage.warning('请输入问题或上传文件')
    return
  }
  
  // 构建消息内容（包含文本和文件）
  let messageContent = prompt
  if (uploadedFiles.value.length > 0) {
    // 如果有文件，添加文件说明
    const fileInfo = uploadedFiles.value.map(f => `[文件: ${f.originalName}]`).join(' ')
    messageContent = prompt ? `${prompt}\n\n${fileInfo}` : fileInfo
  }
  
  // 添加用户消息到对话
  chatMessages.value.push({
    role: 'user',
    content: messageContent
  })
  
  // 清空输入框
  inputForm.value.prompt = ''
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  loading.value = true
  try {
    const executeParams: any = { 
      prompt,
      files: uploadedFiles.value  // 传递文件信息给后端
    }
    
    // 添加基本参数
    if (inputForm.value.model) {
      executeParams.model = inputForm.value.model
    }
    
    // 添加通用参数
    if (inputForm.value.temperature !== undefined) {
      executeParams.temperature = inputForm.value.temperature
    }
    
    // 添加图像生成专用参数
    if (tool.value.category === 'image-generation') {
      if (inputForm.value.size) {
        executeParams.size = inputForm.value.size
      }
      if (inputForm.value.aspect_ratio) {
        executeParams.aspect_ratio = inputForm.value.aspect_ratio
      }
      if (inputForm.value.response_format) {
        executeParams.response_format = inputForm.value.response_format
      }
    }
    
    const result = await execTool(tool.value.id, executeParams, currentConversationId.value)
    
    // 添加AI回复到对话
    chatMessages.value.push({
      role: 'assistant',
      content: result.success ? (result.data?.text || '') : '',
      model: inputForm.value.model,
      tokensUsed: result.data?.usage?.total_tokens,
      errorMessage: result.error
    })
    
    // 清空上传的文件
    uploadedFiles.value = []
    
    // 生成新的conversationId
    currentConversationId.value = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 刷新历史记录
    await loadConversationHistory()
  } catch (error) {
    console.error('Execution failed:', error)
    ElMessage.error('执行失败: ' + (error.message || '未知错误'))
    
    chatMessages.value.push({
      role: 'assistant',
      content: '',
      errorMessage: error.message || '执行失败'
    })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const loadConversation = async (conversationId: string) => {
  // 这里可以实现加载指定对话的功能
  currentConversationId.value = conversationId
  
  // 清空当前对话
  chatMessages.value = []
  
  // 找到对应的对话记录
  const conversation = conversationHistory.value.find(c => c.conversationId === conversationId)
  if (conversation) {
    // 添加用户问题
    chatMessages.value.push({
      role: 'user',
      content: conversation.prompt
    })
    
    // 添加AI回复
    if (conversation.response) {
      chatMessages.value.push({
        role: 'assistant',
        content: conversation.response,
        model: conversation.model,
        tokensUsed: conversation.tokensUsed
      })
    }
    
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

// 文件上传事件处理
const onFileUploaded = (file: UploadedFile) => {
  uploadedFiles.value.push(file)
  console.log('文件上传成功:', file)
}

const onFileRemoved = (fileId: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.fileId !== fileId)
  console.log('文件删除:', fileId)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 渲染 Markdown 内容（支持图片）
const renderMarkdown = (content: string) => {
  if (!content) return ''
  
  try {
    // 配置 marked 选项
    marked.setOptions({
      breaks: true,  // 支持换行
      gfm: true      // GitHub 风格 Markdown
    })
    
    const rendered = marked(content)
    
    // 渲染后为图片添加点击事件
    nextTick(() => {
      attachImageClickHandlers()
    })
    
    return rendered
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return content
  }
}

// 为所有图片添加点击事件
const attachImageClickHandlers = () => {
  const images = document.querySelectorAll('.message-text img')
  images.forEach(img => {
    img.addEventListener('click', (e: any) => {
      const imageUrl = e.target.src
      previewImage(imageUrl)
    })
  })
}

// 预览图片
const previewImage = (imageUrl: string) => {
  previewImageUrl.value = imageUrl
  imageZoomLevel.value = 1
  imagePreviewVisible.value = true
}

// 图片缩放状态
const imageZoomLevel = ref(1)

// 点击预览图片进行放大/缩小
const handlePreviewClick = () => {
  if (imageZoomLevel.value === 1) {
    imageZoomLevel.value = 2
  } else if (imageZoomLevel.value === 2) {
    imageZoomLevel.value = 3
  } else {
    imageZoomLevel.value = 1
  }
}

// 下载图片
const downloadImage = () => {
  if (!previewImageUrl.value) return
  
  const link = document.createElement('a')
  link.href = previewImageUrl.value
  
  // 尝试从 URL 或 content 中提取文件名
  let filename = `generated-image-${Date.now()}.png`
  if (previewImageUrl.value.startsWith('data:')) {
    filename = `generated-image-${Date.now()}.png`
  } else {
    try {
      const url = new URL(previewImageUrl.value)
      const pathname = url.pathname
      const match = pathname.match(/\/([^\/]+\.(png|jpg|jpeg|webp))/i)
      if (match) {
        filename = match[1]
      }
    } catch (e) {
      // URL 解析失败，使用默认文件名
    }
  }
  
  link.download = filename
  link.click()
}

// 监听消息变化，自动滚动
watch(chatMessages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
.tool-detail-kimi {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 左侧边栏 */
.left-sidebar {
  width: 300px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.api-info-card {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.api-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.api-icon {
  font-size: 24px;
  margin-right: 12px;
}

.api-title {
  flex: 1;
}

.api-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.api-provider {
  font-size: 12px;
  color: #909399;
}

.api-config {
  font-size: 12px;
  color: #606266;
}

.config-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.config-label {
  font-weight: 500;
}

.config-value {
  color: #909399;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.history-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f5f7fa;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item:hover {
  background-color: #e6f2ff;
  border-color: #409eff;
}

.history-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.history-item-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-delete-btn {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
  color: #909399;
}

.history-item:hover .history-delete-btn {
  opacity: 1;
}

.history-delete-btn:hover {
  color: #f56c6c;
}

.history-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.history-date {
  color: #909399;
}

.settings-section {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.settings-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

/* 右侧对话区域 */
.right-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.chat-messages {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #fafafa;
}

.message-wrapper {
  display: flex;
  margin-bottom: 30px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 12px;
  flex-shrink: 0;
}

.message-wrapper.assistant .message-avatar {
  background-color: #409eff;
}

.message-wrapper.user .message-avatar {
  background-color: #67c23a;
}

.message-content {
  max-width: 70%;
}

.message-wrapper.user .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
}

.message-wrapper.user .message-header {
  justify-content: flex-end;
}

.message-role {
  font-weight: 500;
}

.message-model,
.message-tokens {
  background-color: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.message-text {
  padding: 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  text-align: left;
}

.message-text :deep(img) {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: block;
}

.message-text :deep(img:hover) {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.message-text :deep(p) {
  margin: 8px 0;
}

.message-text :deep(pre) {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-text :deep(code) {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.message-text :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.message-wrapper.assistant .message-text {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  color: #303133;
}

.message-wrapper.user .message-text {
  background-color: #409eff;
  color: #ffffff;
}

.message-error {
  margin-top: 10px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-chat h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 500;
  color: #606266;
}

.empty-chat p {
  margin: 0;
  font-size: 14px;
}

.chat-input-area {
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
}

.input-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
}

.temperature-display {
  color: #909399;
  font-size: 11px;
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-container :deep(.el-textarea__inner) {
  font-size: 15px;
  line-height: 1.5;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.input-container :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.send-button {
  height: auto;
  padding: 12px 20px;
  border-radius: 8px;
  flex-shrink: 0;
}

.input-tips {
  margin-top: 8px;
  text-align: center;
}

/* 响应式设计 */

/* 移动端菜单按钮 */
.mobile-menu-button {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  display: none;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

/* 平板端 */
@media (max-width: 1024px) {
  .left-sidebar {
    width: 280px;
  }
  
  .message-content {
    max-width: 80%;
  }
}

/* 移动端 */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: block;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .left-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 280px;
  }
  
  .left-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .left-sidebar.mobile-hidden {
    transform: translateX(-100%);
  }
  
  .right-chat-area {
    margin-left: 0;
  }
  
  .chat-messages {
    padding: 20px 15px;
  }
  
  .message-wrapper {
    margin-bottom: 20px;
  }
  
  .message-avatar {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .message-text {
    padding: 12px;
    font-size: 14px;
  }
  
  .chat-input-area {
    padding: 15px;
  }
  
  .input-container :deep(.el-textarea__inner) {
    font-size: 14px;
    padding: 10px;
  }
  
  .input-toolbar {
    font-size: 11px;
  }
  
  .input-tips {
    font-size: 11px;
  }
}

/* 小屏幕手机 */
@media (max-width: 480px) {
  .left-sidebar {
    width: 100%;
    max-width: 320px;
  }
  
  .message-content {
    max-width: 90%;
  }
  
  .message-avatar {
    width: 28px;
    height: 28px;
    font-size: 14px;
    margin: 0 8px;
  }
  
  .message-text {
    padding: 10px;
    font-size: 13px;
  }
  
  .message-header {
    font-size: 10px;
  }
  
  .chat-messages {
    padding: 15px 10px;
  }
  
  .chat-input-area {
    padding: 10px;
  }
  
  .send-button {
    padding: 10px 16px;
  }
}

/* FileUpload 组件样式 */
.file-upload-comp {
  margin-bottom: 10px;
}

.file-upload-comp :deep(.file-upload) {
  width: 100%;
}

.file-upload-comp :deep(.upload-area) {
  width: 100%;
}

.file-upload-comp :deep(.el-upload-dragger) {
  padding: 12px;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
}

.file-upload-comp :deep(.upload-icon) {
  font-size: 32px;
  margin-bottom: 8px;
}

.file-upload-comp :deep(.upload-main) {
  font-size: 14px;
  margin-bottom: 4px;
}

.file-upload-comp :deep(.upload-hint) {
  font-size: 11px;
}

.file-upload-comp :deep(.file-preview) {
  margin-top: 10px;
}

.file-upload-comp :deep(.file-item) {
  padding: 8px 10px;
  margin-bottom: 6px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-upload-comp :deep(.file-thumbnail) {
  width: 32px;
  height: 32px;
}

.file-upload-comp :deep(.file-icon) {
  font-size: 20px;
}

.file-upload-comp :deep(.file-name) {
  font-size: 12px;
}

.file-upload-comp :deep(.file-size) {
  font-size: 10px;
}

/* 模型选项样式 */
.model-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.model-id {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
}

.model-meta {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* 选择器下拉样式 */
.el-select-dropdown__item {
  height: auto;
  padding: 8px 12px;
}

/* 图像设置样式 */
.image-settings {
  border-top: 1px solid #e4e7ed;
  padding-top: 15px;
  margin-top: 15px;
}

.image-settings .setting-item {
  margin-bottom: 15px;
}

.image-settings :deep(.el-radio-group) {
  width: 100%;
}

.image-settings :deep(.el-radio-button) {
  flex: 1;
}

.image-settings :deep(.el-radio-button__inner) {
  padding: 8px 12px;
  font-size: 12px;
}

/* 图片预览样式 */
.image-preview-dialog :deep(.el-dialog) {
  max-height: 90vh;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

.image-preview-dialog :deep(.el-dialog__header) {
  flex-shrink: 0;
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(90vh - 140px);
}

.image-preview-dialog :deep(.el-dialog__footer) {
  flex-shrink: 0;
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  cursor: zoom-in;
  display: block;
}
</style>
