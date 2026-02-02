import { db } from '../database/index.js'

export interface ConversationSession {
  id?: number
  conversationId: string
  toolId: string
  toolName: string
  title?: string
  model?: string
  temperature?: number
  totalTokens?: number
  messageCount?: number
  status: 'active' | 'archived' | 'deleted'
  createdAt?: Date
  updatedAt?: Date
}

export interface ConversationMessage {
  id?: number
  messageId: string
  conversationId: string
  parentMessageId?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokensUsed?: number
  status: 'completed' | 'failed' | 'pending'
  errorMessage?: string
  metadata?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

export class ConversationServiceV2 {
  async createConversationSession(
    conversationData: Omit<ConversationSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ConversationSession> {
    const query = `
      INSERT INTO conversations 
      (conversation_id, tool_id, tool_name, title, model, temperature, total_tokens, message_count, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at as "createdAt", updated_at as "updatedAt"
    `

    const values = [
      conversationData.conversationId,
      conversationData.toolId,
      conversationData.toolName,
      conversationData.title || null,
      conversationData.model || null,
      conversationData.temperature || 0.7,
      conversationData.totalTokens || 0,
      conversationData.messageCount || 0,
      conversationData.status
    ]

    const result = await db.query(query, values)
    return {
      ...conversationData,
      id: result.rows[0].id,
      createdAt: result.rows[0].createdAt,
      updatedAt: result.rows[0].updatedAt
    }
  }

  async addMessage(
    messageData: Omit<ConversationMessage, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ConversationMessage> {
    const query = `
      INSERT INTO conversation_messages 
      (message_id, conversation_id, parent_message_id, role, content, model, tokens_used, status, error_message, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at as "createdAt", updated_at as "updatedAt"
    `

    const values = [
      messageData.messageId,
      messageData.conversationId,
      messageData.parentMessageId || null,
      messageData.role,
      messageData.content,
      messageData.model || null,
      messageData.tokensUsed || null,
      messageData.status,
      messageData.errorMessage || null,
      messageData.metadata ? JSON.stringify(messageData.metadata) : null
    ]

    const result = await db.query(query, values)
    
    // 更新会话的token计数和消息数
    if (messageData.tokensUsed) {
      await this.updateConversationStats(messageData.conversationId, messageData.tokensUsed)
    }

    return {
      ...messageData,
      id: result.rows[0].id,
      createdAt: result.rows[0].createdAt,
      updatedAt: result.rows[0].updatedAt
    }
  }

  async updateConversationStats(conversationId: string, tokensToAdd: number): Promise<void> {
    const query = `
      UPDATE conversations 
      SET 
        total_tokens = total_tokens + $1,
        message_count = message_count + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $2
    `
    await db.query(query, [tokensToAdd, conversationId])
  }

  async getConversationSession(conversationId: string): Promise<ConversationSession | null> {
    const query = `
      SELECT 
        id,
        conversation_id as "conversationId",
        tool_id as "toolId",
        tool_name as "toolName",
        title,
        model,
        temperature,
        total_tokens as "totalTokens",
        message_count as "messageCount",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversations
      WHERE conversation_id = $1
    `

    const result = await db.query(query, [conversationId])
    if (result.rows.length === 0) return null

    return result.rows[0]
  }

  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ConversationMessage[]> {
    const query = `
      SELECT 
        id,
        message_id as "messageId",
        conversation_id as "conversationId",
        parent_message_id as "parentMessageId",
        role,
        content,
        model,
        tokens_used as "tokensUsed",
        status,
        error_message as "errorMessage",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversation_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `

    const result = await db.query(query, [conversationId, limit, offset])
    return result.rows.map(row => ({
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : undefined
    }))
  }

  async getConversationHistory(limit: number = 20, offset: number = 0): Promise<ConversationSession[]> {
    const query = `
      SELECT 
        id,
        conversation_id as "conversationId",
        tool_id as "toolId",
        tool_name as "toolName",
        title,
        model,
        temperature,
        total_tokens as "totalTokens",
        message_count as "messageCount",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM conversations
      ORDER BY updated_at DESC
      LIMIT $1 OFFSET $2
    `

    const result = await db.query(query, [limit, offset])
    return result.rows
  }

  async getMessagesForContext(conversationId: string, maxMessages: number = 10): Promise<ConversationMessage[]> {
    // 获取最近的 N 条消息作为上下文
    const query = `
      SELECT 
        id,
        message_id as "messageId",
        conversation_id as "conversationId",
        parent_message_id as "parentMessageId",
        role,
        content,
        model,
        tokens_used as "tokensUsed",
        status,
        error_message as "errorMessage",
        metadata,
        created_at as "createdAt"
      FROM conversation_messages
      WHERE conversation_id = $1 AND status = 'completed'
      ORDER BY created_at DESC
      LIMIT $2
    `

    const result = await db.query(query, [conversationId, maxMessages])
    const messages = result.rows.map(row => ({
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : undefined
    }))

    // 返回按时间正序排列的消息
    return messages.reverse()
  }

  async updateMessage(
    messageId: string,
    updates: Partial<Pick<ConversationMessage, 'status' | 'tokensUsed' | 'errorMessage'>>
  ): Promise<void> {
    const setClauses: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }
    if (updates.tokensUsed !== undefined) {
      setClauses.push(`tokens_used = $${paramIndex++}`)
      values.push(updates.tokensUsed)
    }
    if (updates.errorMessage !== undefined) {
      setClauses.push(`error_message = $${paramIndex++}`)
      values.push(updates.errorMessage)
    }

    if (setClauses.length === 0) return

    values.push(messageId)
    const query = `
      UPDATE conversation_messages 
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE message_id = $${paramIndex}
    `

    await db.query(query, values)
  }

  async getStats(): Promise<{
    totalConversations: number
    totalTokens: number
    todayConversations: number
    activeConversations: number
  }> {
    const client = await db.getClient()
    try {
      const totalQuery = `SELECT COUNT(*) as count FROM conversations`
      const totalResult = await client.query(totalQuery)

      const tokensQuery = `SELECT COALESCE(SUM(total_tokens), 0) as total FROM conversations`
      const tokensResult = await client.query(tokensQuery)

      const todayQuery = `
        SELECT COUNT(*) as count 
        FROM conversations 
        WHERE DATE(created_at) = CURRENT_DATE
      `
      const todayResult = await client.query(todayQuery)

      const activeQuery = `SELECT COUNT(*) as count FROM conversations WHERE status = 'active'`
      const activeResult = await client.query(activeQuery)

      return {
        totalConversations: parseInt(totalResult.rows[0].count),
        totalTokens: parseInt(tokensResult.rows[0].total),
        todayConversations: parseInt(todayResult.rows[0].count),
        activeConversations: parseInt(activeResult.rows[0].count)
      }
    } finally {
      client.release()
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    const client = await db.getClient()
    try {
      // 删除相关消息
      await client.query('DELETE FROM conversation_messages WHERE conversation_id = $1', [conversationId])

      // 删除会话
      const result = await client.query('DELETE FROM conversations WHERE conversation_id = $1', [conversationId])

      return result.rowCount ? result.rowCount > 0 : false
    } finally {
      client.release()
    }
  }
}

export const conversationServiceV2 = new ConversationServiceV2()
