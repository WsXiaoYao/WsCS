import { BaseTool } from './baseTool.js'
import { CustomOpenAITool } from './customOpenaiService.js'
import { GeminiImageService } from './geminiImageService.js'

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map()

  constructor() {
    // 注册默认工具
    this.register(new CustomOpenAITool())
    this.register(new GeminiImageService())
  }

  register(tool: BaseTool): void {
    this.tools.set(tool.id, tool)
  }

  getTool(id: string): BaseTool | undefined {
    return this.tools.get(id)
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values())
  }

  async executeTool(id: string, input: any): Promise<any> {
    const tool = this.getTool(id)
    if (!tool) {
      throw new Error(`Tool not found: ${id}`)
    }
    return await tool.execute(input)
  }

  async executeChain(tools: Array<{ id: string; input?: any }>): Promise<any[]> {
    const results: any[] = []
    const context: any = {}

    for (const step of tools) {
      const toolInput = { ...step.input, context }
      const result = await this.executeTool(step.id, toolInput)
      results.push(result)

      if (result.success && result.data) {
        Object.assign(context, result.data)
      }
    }

    return results
  }
}

export const toolRegistry = new ToolRegistry()
