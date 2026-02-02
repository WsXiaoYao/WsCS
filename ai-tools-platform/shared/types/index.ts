// 前后端共享的类型定义

export interface Tool {
  id: string
  name: string
  description: string
  type: string
  category: string
}

export interface ToolInput {
  [key: string]: any
}

export interface ToolOutput {
  success: boolean
  data?: any
  error?: string
}

export interface ToolChainStep {
  id: string
  input?: ToolInput
}

export interface ChainExecutionResult {
  success: boolean
  data: ToolOutput[]
  error?: string
}
