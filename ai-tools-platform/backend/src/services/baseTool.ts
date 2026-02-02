export interface ToolConfig {
  id: string
  name: string
  description: string
  type: string
  config?: Record<string, any>
}

export interface ToolInput {
  [key: string]: any
}

export interface ToolOutput {
  success: boolean
  data?: any
  error?: string
}

export abstract class BaseTool {
  abstract readonly id: string
  abstract readonly name: string
  abstract readonly description: string
  abstract readonly category: string

  abstract execute(input: ToolInput): Promise<ToolOutput>

  getConfig(): ToolConfig {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.category
    }
  }
}
