import { Request, Response } from 'express'
import { conversationServiceV2 } from '../services/conversationServiceV2.js'
import { fileUploadService } from '../services/fileUploadService.js'
import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { toolId, toolName, model, temperature } = req.body

    if (!toolId || !toolName) {
      return res.status(400).json({
        success: false,
        error: 'toolId and toolName are required'
      })
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const conversation = await conversationServiceV2.createConversationSession({
      conversationId,
      toolId,
      toolName,
      model,
      temperature,
      status: 'active'
    })

    res.json({
      success: true,
      data: conversation
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, parentMessageId, role, content, model } = req.body

    if (!conversationId || !role || !content) {
      return res.status(400).json({
        success: false,
        error: 'conversationId, role, and content are required'
      })
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const message = await conversationServiceV2.addMessage({
      messageId,
      conversationId,
      parentMessageId,
      role,
      content,
      model,
      status: 'completed'
    })

    res.json({
      success: true,
      data: message
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params
    const { includeMessages = 'true' } = req.query

    const conversation = await conversationServiceV2.getConversationSession(conversationId)

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    const response: any = {
      success: true,
      data: conversation
    }

    if (includeMessages === 'true') {
      const messages = await conversationServiceV2.getConversationMessages(conversationId)
      response.data.messages = messages
    }

    res.json(response)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const messages = await conversationServiceV2.getConversationMessages(
      conversationId,
      parseInt(limit as string),
      parseInt(offset as string)
    )

    res.json({
      success: true,
      data: messages,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: messages.length
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query

    const conversations = await conversationServiceV2.getConversationHistory(
      parseInt(limit as string),
      parseInt(offset as string)
    )

    res.json({
      success: true,
      data: conversations,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: conversations.length
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'conversationId is required'
      })
    }

    const result = await fileUploadService.uploadFile(req.file, conversationId, {
      uploadedBy: 'user',
      uploadTime: new Date().toISOString()
    })

    if (!result.success) {
      return res.status(400).json(result)
    }

    res.json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getConversationFiles = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params

    const files = await fileUploadService.getFilesByConversation(conversationId)

    res.json({
      success: true,
      data: files
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params

    const success = await fileUploadService.deleteFile(fileId)

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }

    res.json({
      success: true,
      data: { fileId }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Multer 中间件
export const uploadMiddleware = upload.single('file')
