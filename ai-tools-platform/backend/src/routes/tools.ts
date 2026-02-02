import { Router } from 'express'
import { getTools, executeTool, executeChain, getModels } from '../controllers/toolsController.js'
import { getConversationHistory, getConversationStats, deleteConversation } from '../controllers/historyController.js'
import {
  createConversation,
  addMessage,
  getConversation,
  getConversationMessages,
  getConversations,
  uploadFile,
  getConversationFiles,
  deleteFile,
  uploadMiddleware
} from '../controllers/conversationController.js'

const router = Router()

// 工具相关路由
router.get('/', getTools)
router.get('/models', getModels)
router.post('/:id/execute', executeTool)
router.post('/chain', executeChain)

// 历史记录（兼容旧版本）
router.get('/history', getConversationHistory)
router.get('/history/stats', getConversationStats)
router.delete('/history/:conversationId', deleteConversation)

// 多轮对话新API
router.post('/conversations', createConversation)
router.get('/conversations', getConversations)
router.get('/conversations/:conversationId', getConversation)
router.get('/conversations/:conversationId/messages', getConversationMessages)
router.post('/conversations/:conversationId/messages', addMessage)

// 文件上传
router.post('/conversations/:conversationId/upload', uploadMiddleware, uploadFile)
router.get('/conversations/:conversationId/files', getConversationFiles)
router.delete('/files/:fileId', deleteFile)

export default router
