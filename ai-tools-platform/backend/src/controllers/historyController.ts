import { Request, Response } from 'express'
import { conversationService } from '../services/conversationService.js'

export const getConversationHistory = async (req: Request, res: Response) => {
  try {
    const { toolId, limit = 50, offset = 0 } = req.query

    const conversations = toolId
      ? await conversationService.getConversationsByTool(toolId as string, parseInt(limit as string), parseInt(offset as string))
      : await conversationService.getConversations(parseInt(limit as string), parseInt(offset as string))

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

export const getConversationStats = async (req: Request, res: Response) => {
  try {
    const stats = await conversationService.getStats()
    res.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      })
    }

    const deleted = await conversationService.deleteConversation(conversationId)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
