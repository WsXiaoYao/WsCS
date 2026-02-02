import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { BaseTool, ToolInput, ToolOutput } from './baseTool.js'
import { config } from '../config/index.js'
import { APIFailoverManager } from '../utils/apiFailover.js'
import OpenAI from 'openai'

export class GeminiImageService extends BaseTool {
  readonly id = 'gemini-image'
  readonly name = 'Gemini 图像生成'
  readonly description = '基于 Gemini 的图像生成工具，支持文生图、图生图和图片编辑，支持自动故障切换'
  readonly category = 'image-generation'

  private failoverManager: APIFailoverManager | null = null

  // 尺寸映射表
  private readonly sizeMap: Record<string, { k: string; aspectRatio: string }> = {
    '1024x1024': { k: '', aspectRatio: '1:1' },
    '2048x2048': { k: '2k', aspectRatio: '1:1' },
    '4096x4096': { k: '4k', aspectRatio: '1:1' },
    '832x1248':  { k: '', aspectRatio: '2:3' },
    '848x1264':  { k: '', aspectRatio: '2:3' },
    '1696x2528': { k: '2k', aspectRatio: '2:3' },
    '3392x5056': { k: '4k', aspectRatio: '2:3' },
    '1248x832':  { k: '', aspectRatio: '3:2' },
    '1264x848':  { k: '', aspectRatio: '3:2' },
    '2528x1696': { k: '2k', aspectRatio: '3:2' },
    '5056x3392': { k: '4k', aspectRatio: '3:2' },
    '864x1184':  { k: '', aspectRatio: '3:4' },
    '896x1200':  { k: '', aspectRatio: '3:4' },
    '1792x2400': { k: '2k', aspectRatio: '3:4' },
    '3584x4800': { k: '4k', aspectRatio: '3:4' },
    '1184x864':  { k: '', aspectRatio: '4:3' },
    '1200x896':  { k: '', aspectRatio: '4:3' },
    '2400x1792': { k: '2k', aspectRatio: '4:3' },
    '4800x3584': { k: '4k', aspectRatio: '4:3' },
    '896x1152':  { k: '', aspectRatio: '4:5' },
    '928x1152':  { k: '', aspectRatio: '4:5' },
    '1856x2304': { k: '2k', aspectRatio: '4:5' },
    '3712x4608': { k: '4k', aspectRatio: '4:5' },
    '1152x896':  { k: '', aspectRatio: '5:4' },
    '1152x928':  { k: '', aspectRatio: '5:4' },
    '2304x1856': { k: '2k', aspectRatio: '5:4' },
    '4608x3712': { k: '4k', aspectRatio: '5:4' },
    '768x1344':  { k: '', aspectRatio: '9:16' },
    '768x1376':  { k: '', aspectRatio: '9:16' },
    '1536x2752': { k: '2k', aspectRatio: '9:16' },
    '3072x5504': { k: '4k', aspectRatio: '9:16' },
    '1344x768':  { k: '', aspectRatio: '16:9' },
    '1376x768':  { k: '', aspectRatio: '16:9' },
    '2752x1536': { k: '2k', aspectRatio: '16:9' },
    '5504x3072': { k: '4k', aspectRatio: '16:9' },
    '1536x672':  { k: '', aspectRatio: '21:9' },
    '1584x672':  { k: '', aspectRatio: '21:9' },
    '3168x1344': { k: '2k', aspectRatio: '21:9' },
    '6336x2688': { k: '4k', aspectRatio: '21:9' },
  }

  constructor() {
    super()
    
    if (!config.geminiImageApiKey || !config.geminiImageBaseURLs || config.geminiImageBaseURLs.length === 0) {
      console.warn('Gemini Image API not configured (missing API key or Base URLs)')
      return
    }

    try {
      this.failoverManager = new APIFailoverManager(config.geminiImageBaseURLs)
      console.log(`✅ Gemini Image API client initialized with ${config.geminiImageBaseURLs.length} endpoints`)
      console.log('   Endpoints:', config.geminiImageBaseURLs.join(', '))
    } catch (error: any) {
      console.error('❌ Failed to initialize Gemini Image API client:', error.message)
      this.failoverManager = null
    }
  }

  async execute(input: ToolInput): Promise<ToolOutput> {
    // 检查配置
    if (!config.geminiImageApiKey || !this.failoverManager) {
      return {
        success: false,
        error: 'Gemini Image API not configured. Please set GEMINI_IMAGE_API_KEY and GEMINI_IMAGE_BASE_URLS in backend/.env'
      }
    }

    try {
      const { 
        prompt, 
        messages,
        files = [],
        model = config.geminiImageModel || 'nano-banana', 
        temperature = 0.7,
        max_tokens = 1000,
        stream = false,
        size,
        aspect_ratio,
        response_format = 'b64_json',
        ...otherParams 
      } = input

      // 判断是否为图片生成请求（有prompt但无files）
      const isImageGeneration = prompt && (!files || files.length === 0)
      
      // 判断是否为图片编辑请求（有files）
      const isImageEdit = files && files.length > 0

      // 图片生成
      if (isImageGeneration) {
        return await this.generateImage(prompt!, model, size, aspect_ratio, response_format)
      }

      // 图片编辑
      if (isImageEdit) {
        return await this.editImage(prompt, files, model, size, aspect_ratio, response_format)
      }

      // 聊天对话模式（用于图像分析和理解）
      return await this.chat(prompt, messages, files, model, temperature, max_tokens, stream)
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Gemini Image API error'
      }
    }
  }

  /**
   * 图片生成
   */
  private async generateImage(
    prompt: string,
    model: string,
    size?: string,
    aspect_ratio?: string,
    response_format: string = 'b64_json'
  ): Promise<ToolOutput> {
    const requestParams: any = {
      model,
      prompt,
      response_format
    }

    // 处理尺寸参数
    if (size) {
      // 直接传入的尺寸或比例
      requestParams.size = size
    } else if (aspect_ratio) {
      // 只传入比例
      requestParams.size = aspect_ratio
    }

    // 对于pro模型，如果有aspect_ratio参数，优先使用
    if (aspect_ratio && this.isProModel(model)) {
      requestParams.aspect_ratio = aspect_ratio
    }

    const response = await this.failoverManager!.createOpenAIClient(
      config.geminiImageApiKey,
      async (client) => {
        return await (client as any).images.generate(requestParams)
      }
    )

    // 处理响应
    const images: string[] = []
    const imageMarkdowns: string[] = []

    for (const item of response.data) {
      if (item.b64_json) {
        // Base64 格式
        const dataUrl = `data:image/png;base64,${item.b64_json}`
        images.push(dataUrl)
        imageMarkdowns.push(`![生成的图片](${dataUrl})`)
      } else if (item.url) {
        // URL 格式
        images.push(item.url!)
        imageMarkdowns.push(`![生成的图片](${item.url})`)
      }
    }

    const markdownContent = `${prompt}\n\n${imageMarkdowns.join('\n\n')}`

    return {
      success: true,
      data: {
        text: markdownContent,
        content: markdownContent,
        usage: response.usage,
        model: model,
        images
      }
    }
  }

  /**
   * 图片编辑
   */
  private async editImage(
    prompt: string | undefined,
    files: any[],
    model: string,
    size?: string,
    aspect_ratio?: string,
    response_format: string = 'url'
  ): Promise<ToolOutput> {
    if (!prompt) {
      return {
        success: false,
        error: '编辑图片需要提供 prompt（编辑描述）'
      }
    }

    // 过滤出图片文件
    const imageFiles = files.filter(f => f.fileType === 'image')
    if (imageFiles.length === 0) {
      return {
        success: false,
        error: '编辑图片需要上传至少一张图片'
      }
    }

    // 获取第一个图片文件
    const imageFile = imageFiles[0]
    const filePath = `/Users/xiaoyao/vuetest/ai-tools-platform/backend/uploads/${imageFile.fileId}`

    // 读取文件
    const fs = await import('fs')
    const formData = await import('form-data')
    const FormData = formData.default

    const form = new FormData()
    form.append('model', model)
    form.append('prompt', prompt)
    form.append('response_format', response_format)
    
    // 添加图片
    form.append('image', fs.createReadStream(filePath))

    // 添加尺寸参数
    if (size) {
      form.append('size', size)
    } else if (aspect_ratio && this.isProModel(model)) {
      form.append('aspect_ratio', aspect_ratio)
    }

    // 获取可用端点
    const endpoint = this.failoverManager!.getNextEndpoint()
    
    // 使用 axios 发送 multipart 请求
    const axios = await import('axios')
    const response = await axios.default.post(
      `${endpoint.url}/v1/images/edits`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${config.geminiImageApiKey}`
        }
      }
    )

    // 处理响应
    const images: string[] = []
    const imageMarkdowns: string[] = []

    for (const item of response.data.data) {
      if (item.url) {
        images.push(item.url)
        imageMarkdowns.push(`![编辑后的图片](${item.url})`)
      }
    }

    const markdownContent = `${prompt}\n\n${imageMarkdowns.join('\n\n')}`

    return {
      success: true,
      data: {
        text: markdownContent,
        content: markdownContent,
        usage: response.data.usage,
        model: model,
        images
      }
    }
  }

  /**
   * 聊天对话（图像理解）
   */
  private async chat(
    prompt: string | undefined,
    messages: any,
    files: any[],
    model: string,
    temperature: number,
    max_tokens: number,
    stream: boolean
  ): Promise<ToolOutput> {
    // 构建消息数组
    let chatMessages: ChatCompletionMessageParam[] = []
    
    if (messages && Array.isArray(messages)) {
      chatMessages = messages as ChatCompletionMessageParam[]
    } else {
      const content: any[] = []
      
      if (prompt) {
        content.push({
          type: 'text',
          text: prompt
        })
      }
      
      // 处理上传的文件（图片）
      if (files && Array.isArray(files)) {
        for (const file of files) {
          if (file.fileType === 'image') {
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
          error: 'Prompt or image files are required'
        }
      }
    }

    const completion = await this.failoverManager!.createOpenAIClient(
      config.geminiImageApiKey,
      async (client) => {
        return await client.chat.completions.create({
          model,
          messages: chatMessages,
          temperature,
          max_tokens,
          stream
        })
      }
    )

    if (stream) {
      return {
        success: true,
        data: {
          stream: completion,
          model: completion.model,
          messages: chatMessages
        }
      }
    }

    const responseMessage = completion.choices[0]?.message
    
    return {
      success: true,
      data: {
        text: responseMessage?.content || '',
        content: responseMessage?.content,
        usage: completion.usage,
        model: completion.model,
        messages: [...chatMessages, { 
          role: 'assistant', 
          content: responseMessage?.content || '' 
        }]
      }
    }
  }

  /**
   * 判断是否为 Pro 模型
   */
  private isProModel(model: string): boolean {
    return model.includes('pro') || model === 'gemini-3-pro-image-preview'
  }

  getConfig(): any {
    const baseConfig = super.getConfig()
    const endpointStatus = this.failoverManager?.getEndpointStatus() || []
    
    return {
      ...baseConfig,
      category: this.category,
      type: this.category,
      apiProvider: 'Gemini (with failover)',
      apiBaseURLs: config.geminiImageBaseURLs || [],
      configuredModel: config.geminiImageModel || 'nano-banana',
      isConfigured: !!(config.geminiImageApiKey && config.geminiImageBaseURLs && config.geminiImageBaseURLs.length > 0),
      supportsFileUpload: true,
      supportedModels: [
        'nano-banana',
        'nano-banana-pro',
        'nano-banana-pro-2k',
        'nano-banana-pro-4k',
        'gemini-3-pro-image-preview',
        'gemini-2.5-flash-image'
      ],
      endpointStatus: endpointStatus.map(e => ({
        url: e.url,
        isHealthy: e.isHealthy,
        failureCount: e.failureCount
      }))
    }
  }
}