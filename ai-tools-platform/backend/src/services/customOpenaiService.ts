import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { BaseTool, ToolInput, ToolOutput } from './baseTool.js'
import { config } from '../config/index.js'
import { APIFailoverManager } from '../utils/apiFailover.js'

export class CustomOpenAITool extends BaseTool {
  readonly id = 'custom-openai'
  readonly name = 'Custom OpenAI API'
  readonly description = '第三方OpenAI兼容API，支持多种AI模型（GPT、Claude、Gemini等），支持自动故障切换'
  readonly category = 'text-generation'

  private failoverManager: APIFailoverManager | null = null

  constructor() {
    super()
    
    if (!config.customOpenAiApiKey || !config.customOpenAiBaseURLs || config.customOpenAiBaseURLs.length === 0) {
      console.warn('Custom OpenAI API not configured (missing API key or Base URLs)')
      return
    }

    try {
      this.failoverManager = new APIFailoverManager(config.customOpenAiBaseURLs)
      console.log(`✅ Custom OpenAI API client initialized with ${config.customOpenAiBaseURLs.length} endpoints`)
      console.log('   Endpoints:', config.customOpenAiBaseURLs.join(', '))
    } catch (error: any) {
      console.error('❌ Failed to initialize Custom OpenAI API client:', error.message)
      this.failoverManager = null
    }
  }

  async execute(input: ToolInput): Promise<ToolOutput> {
    // 检查配置
    if (!config.customOpenAiApiKey || !this.failoverManager) {
      return {
        success: false,
        error: 'Custom OpenAI API not configured. Please set CUSTOM_OPENAI_API_KEY and CUSTOM_OPENAI_BASE_URLS in backend/.env'
      }
    }

    try {
      const { 
        prompt, 
        messages,
        files = [],
        model = config.customOpenAiModel || 'gpt-3.5-turbo', 
        temperature = 0.7,
        max_tokens = 1000,
        ...otherParams 
      } = input

      // 构建消息数组
      let chatMessages: ChatCompletionMessageParam[] = []
      
      if (messages && Array.isArray(messages)) {
        // 使用提供的消息历史
        chatMessages = messages as ChatCompletionMessageParam[]
      } else {
        // 构建包含文本和文件的新消息
        const content: any[] = []
        
        // 添加文本内容
        if (prompt) {
          content.push({
            type: 'text',
            text: prompt
          })
        }
        
        // 处理上传的文件
        if (files && Array.isArray(files)) {
          for (const file of files) {
            if (file.fileType === 'image') {
              // 图片文件：使用Vision API格式
              // 构建文件URL（需要通过后端API访问）
              const baseUrl = process.env.NODE_ENV === 'development' 
                ? `http://localhost:${process.env.PORT || 5001}` 
                : ''
              const fileUrl = `${baseUrl}/api/tools/files/${file.fileId}`
              
              content.push({
                type: 'image_url',
                image_url: {
                  url: fileUrl,
                  detail: 'auto'
                }
              })
            } else {
              // 文档/文本文件：添加文件信息作为文本
              content.push({
                type: 'text',
                text: `[文件: ${file.originalName} (${formatFileSize(file.fileSize)})]`
              })
            }
          }
        }
        
        if (content.length > 0) {
          chatMessages = [{
            role: 'user',
            content: content as any
          }]
        } else {
          return {
            success: false,
            error: 'Prompt or files are required'
          }
        }
      }

      // 使用故障切换管理器执行请求
      const completion = await this.failoverManager.createOpenAIClient(
        config.customOpenAiApiKey,
        async (client) => {
          return await client.chat.completions.create({
            model,
            messages: chatMessages,
            temperature,
            max_tokens,
            ...otherParams
          })
        }
      )

      return {
        success: true,
        data: {
          text: completion.choices[0]?.message?.content || '',
          usage: completion.usage,
          model: completion.model,
          messages: [...chatMessages, { role: 'assistant', content: completion.choices[0]?.message?.content || '' }]
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Custom OpenAI API error'
      }
    }
  }

  getConfig(): any {
    const baseConfig = super.getConfig()
    const endpointStatus = this.failoverManager?.getEndpointStatus() || []
    
    return {
      ...baseConfig,
      category: this.category,
      type: this.category,
      apiProvider: 'vveai.com (with failover)',
      apiBaseURLs: config.customOpenAiBaseURLs || [],
      configuredModel: config.customOpenAiModel || 'gpt-3.5-turbo',
      isConfigured: !!(config.customOpenAiApiKey && config.customOpenAiBaseURLs && config.customOpenAiBaseURLs.length > 0),
      supportsFileUpload: true,
      endpointStatus: endpointStatus.map(e => ({
        url: e.url,
        isHealthy: e.isHealthy,
        failureCount: e.failureCount
      }))
    }
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
