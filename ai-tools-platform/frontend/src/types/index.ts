export interface Tool {
  id: string
  name: string
  description: string
  category: string
  icon?: string
  inputSchema?: Record<string, any>
  outputSchema?: Record<string, any>
}

export interface ToolExecution {
  toolId: string
  input: any
  output?: any
  error?: string
  timestamp: Date
}

export interface ChainNode {
  id: string
  toolId: string
  config: Record<string, any>
  dependencies?: string[]
}

export interface ToolChain {
  id: string
  name: string
  description: string
  nodes: ChainNode[]
}
