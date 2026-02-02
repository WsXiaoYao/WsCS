import { Request, Response } from 'express'
import { toolRegistry } from '../services/toolRegistry.js'
import OpenAI from 'openai'
import { config } from '../config/index.js'
import { conversationService } from '../services/conversationService.js'

export const getTools = async (req: Request, res: Response) => {
  try {
    const tools = toolRegistry.getAllTools()
    res.json({
      success: true,
      data: tools.map(tool => tool.getConfig())
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getModels = async (req: Request, res: Response) => {
  try {
    const { toolId } = req.query
    
    // 处理 Gemini Image 工具的模型列表
    if (toolId === 'gemini-image') {
      const models = [
        { id: 'nano-banana', object: 'model', created: Date.now(), owned_by: 'Gemini' },
        { id: 'nano-banana-pro', object: 'model', created: Date.now(), owned_by: 'Gemini' },
        { id: 'nano-banana-pro-2k', object: 'model', created: Date.now(), owned_by: 'Gemini' },
        { id: 'nano-banana-pro-4k', object: 'model', created: Date.now(), owned_by: 'Gemini' },
        { id: 'gemini-3-pro-image-preview', object: 'model', created: Date.now(), owned_by: 'Gemini' },
        { id: 'gemini-2.5-flash-image', object: 'model', created: Date.now(), owned_by: 'Gemini' }
      ]
      
      return res.json({
        success: true,
        data: models
      })
    }
    
    // 处理 Custom OpenAI 工具的模型列表
    if (toolId === 'custom-openai') {
      if (!config.customOpenAiApiKey || !config.customOpenAiBaseURLs || config.customOpenAiBaseURLs.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Custom OpenAI API not configured'
        })
      }

      const client = new OpenAI({
        apiKey: config.customOpenAiApiKey,
        baseURL: config.customOpenAiBaseURLs[0]
      })

      const response = await client.models.list()
      
      const models = response.data.map((model: any) => ({
        id: model.id,
        object: model.object,
        created: model.created,
        owned_by: model.owned_by
      }))

      return res.json({
        success: true,
        data: models
      })
    }
    
    // 其他工具不支持模型列表
    return res.status(400).json({
      success: false,
      error: 'This tool does not support model listing'
    })
  } catch (error: any) {
    console.error('Failed to fetch models:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch models'
    })
  }
}

export const executeTool = async (req: Request, res: Response) => {
  const { id } = req.params
  const { input } = req.body
  const conversationId = req.headers['x-conversation-id'] as string || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const tool = toolRegistry.getTool(id)
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      })
    }

    const result = await toolRegistry.executeTool(id, input)
    
    // 保存对话历史
    try {
      await conversationService.saveConversation({
        conversationId,
        toolId: id,
        toolName: tool.name,
        prompt: input.prompt || input.text || JSON.stringify(input),
        response: result.success ? result.data?.text || JSON.stringify(result.data) : undefined,
        model: input.model || result.data?.model,
        temperature: input.temperature,
        tokensUsed: result.data?.usage?.total_tokens,
        status: result.success ? 'completed' : 'failed',
        errorMessage: result.error,
        metadata: {
          toolConfig: tool.getConfig(),
          input,
          output: result
        }
      })
    } catch (dbError) {
      console.error('Failed to save conversation history:', dbError)
      // 不阻止返回结果给前端
    }
    
    res.json({
      success: result.success,
      data: result.data,
      error: result.error,
      conversationId
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const executeChain = async (req: Request, res: Response) => {
  try {
    const { tools } = req.body

    if (!Array.isArray(tools) || tools.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tools array is required'
      })
    }

    const results = await toolRegistry.executeChain(tools)

    res.json({
      success: true,
      data: results
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
