import api from './index'

export interface ToolConfig {
  id: string
  name: string
  description: string
  type: string
  category: string
  isConfigured?: boolean
  apiProvider?: string
  apiBaseURL?: string
  configuredModel?: string
  status?: 'active' | 'inactive' | 'configuring'
  config?: Record<string, any>
}

export interface ToolChainRequest {
  tools: ToolConfig[]
  input: any
}

export interface ToolChainResponse {
  success: boolean
  data: any
  error?: string
}

export interface ModelInfo {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface ModelsResponse {
  success: boolean
  data: ModelInfo[]
  error?: string
}

export interface Conversation {
  id: number
  conversationId: string
  toolId: string
  toolName: string
  prompt: string
  response?: string
  model?: string
  temperature?: number
  tokensUsed?: number
  status: 'completed' | 'failed'
  errorMessage?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ConversationStats {
  totalConversations: number
  totalTokens: number
  todayConversations: number
  toolStats: Array<{ toolId: string; toolName: string; count: number }>
}

export interface ConversationHistoryResponse {
  success: boolean
  data: Conversation[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
  error?: string
}

export interface ConversationStatsResponse {
  success: boolean
  data: ConversationStats
  error?: string
}

// 获取可用工具列表
export const getTools = () => {
  return api.get<ToolConfig[]>('/tools')
}

// 获取模型列表
export const getModels = (toolId: string) => {
  return api.get<ModelsResponse>(`/tools/models?toolId=${toolId}`)
}

// 获取对话历史
export const getConversationHistory = (params?: {
  toolId?: string
  limit?: number
  offset?: number
}) => {
  return api.get<ConversationHistoryResponse>('/tools/history', { params })
}

// 获取对话统计
export const getConversationStats = () => {
  return api.get<ConversationStatsResponse>('/tools/history/stats')
}

// 删除对话
export const deleteConversation = (conversationId: string) => {
  return api.delete(`/tools/history/${conversationId}`)
}

// 执行单个工具
export const executeTool = (toolId: string, input: any, conversationId?: string) => {
  return api.post(`/tools/${toolId}/execute`, { input }, {
    headers: conversationId ? { 'X-Conversation-Id': conversationId } : {}
  })
}

// 执行工具链
export const executeToolChain = (request: ToolChainRequest) => {
  return api.post<ToolChainResponse>('/tools/chain', request)
}

// 上传文件
export const uploadFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
