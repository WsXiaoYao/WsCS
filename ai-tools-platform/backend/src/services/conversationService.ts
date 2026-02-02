import { db } from '../database/index.js'

export interface Conversation {
  id?: number
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
  createdAt?: Date
  updatedAt?: Date
}

export class ConversationService {
  async saveConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const query = `
      INSERT INTO conversation_history 
      (conversation_id, tool_id, tool_name, prompt, response, model, temperature, tokens_used, status, error_message, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, created_at as "createdAt", updated_at as "updatedAt"
    `
    
    const values = [
      conversation.conversationId,
      conversation.toolId,
      conversation.toolName,
      conversation.prompt,
      conversation.response || null,
      conversation.model || null,
      conversation.temperature || null,
      conversation.tokensUsed || null,
      conversation.status,
      conversation.errorMessage || null,
      conversation.metadata ? JSON.stringify(conversation.metadata) : null
    ]

    const result = await db.query(query, values)
    return {
      ...conversation,
      id: result.rows[0].id,
      createdAt: result.rows[0].createdAt,
      updatedAt: result.rows[0].updatedAt
    }
  }

  async getConversations(limit: number = 50, offset: number = 0): Promise<Conversation[]> {
    const query = `
      SELECT 
        id,
        conversation_id as "conversationId",
        tool_id as "toolId",
        tool_name as "toolName",
        prompt,
        response,
        model,
        temperature,
        tokens_used as "tokensUsed",
        status,
        error_message as "errorMessage",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversation_history
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `
    
    const result = await db.query(query, [limit, offset])
    return result.rows.map(row => ({
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : undefined
    }))
  }

  async getConversationsByTool(toolId: string, limit: number = 50, offset: number = 0): Promise<Conversation[]> {
    const query = `
      SELECT 
        id,
        conversation_id as "conversationId",
        tool_id as "toolId",
        tool_name as "toolName",
        prompt,
        response,
        model,
        temperature,
        tokens_used as "tokensUsed",
        status,
        error_message as "errorMessage",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversation_history
      WHERE tool_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `
    
    const result = await db.query(query, [toolId, limit, offset])
    return result.rows.map(row => ({
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : undefined
    }))
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const query = `
      SELECT 
        id,
        conversation_id as "conversationId",
        tool_id as "toolId",
        tool_name as "toolName",
        prompt,
        response,
        model,
        temperature,
        tokens_used as "tokensUsed",
        status,
        error_message as "errorMessage",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversation_history
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    const result = await db.query(query, [conversationId])
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : undefined
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    const query = `DELETE FROM conversation_history WHERE conversation_id = $1`
    const result = await db.query(query, [conversationId])
    return result.rowCount ? result.rowCount > 0 : false
  }

  async getStats(): Promise<{
    totalConversations: number
    totalTokens: number
    todayConversations: number
    toolStats: Array<{ toolId: string; toolName: string; count: number }>
  }> {
    const client = await db.getClient()
    try {
      const totalQuery = `SELECT COUNT(*) as count FROM conversation_history`
      const totalResult = await client.query(totalQuery)
      
      const tokensQuery = `SELECT COALESCE(SUM(tokens_used), 0) as total FROM conversation_history`
      const tokensResult = await client.query(tokensQuery)
      
      const todayQuery = `
        SELECT COUNT(*) as count 
        FROM conversation_history 
        WHERE DATE(created_at) = CURRENT_DATE
      `
      const todayResult = await client.query(todayQuery)
      
      const toolStatsQuery = `
        SELECT tool_id as "toolId", tool_name as "toolName", COUNT(*) as count
        FROM conversation_history
        GROUP BY tool_id, tool_name
        ORDER BY count DESC
      `
      const toolStatsResult = await client.query(toolStatsQuery)
      
      return {
        totalConversations: parseInt(totalResult.rows[0].count),
        totalTokens: parseInt(tokensResult.rows[0].total),
        todayConversations: parseInt(todayResult.rows[0].count),
        toolStats: toolStatsResult.rows
      }
    } finally {
      client.release()
    }
  }
}

export const conversationService = new ConversationService()
