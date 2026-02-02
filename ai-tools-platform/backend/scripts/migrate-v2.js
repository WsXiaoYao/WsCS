#!/usr/bin/env node

/**
 * 数据库迁移脚本 - 升级到v2版本
 * 添加多轮对话和文件上传支持
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'

console.log('🚀 Starting database migration to v2...')

try {
  // 检查数据库是否存在
  try {
    execSync('psql -l | grep ai_tools_platform', { stdio: 'pipe' })
    console.log('✅ Database exists')
  } catch {
    console.error('❌ Database ai_tools_platform does not exist')
    console.log('💡 Please run: npm run init-db')
    process.exit(1)
  }

  // 执行迁移SQL
  console.log('📊 Executing migration SQL...')
  
  const migrationSQL = `
-- 创建对话会话表（如果不存在）
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL UNIQUE,
    tool_id VARCHAR(100) NOT NULL,
    tool_name VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    model VARCHAR(100),
    temperature FLOAT DEFAULT 0.7,
    total_tokens INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建对话消息表（如果不存在）
CREATE TABLE IF NOT EXISTS conversation_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    parent_message_id VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model VARCHAR(100),
    tokens_used INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建文件上传表（如果不存在）
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    file_id VARCHAR(255) NOT NULL UNIQUE,
    conversation_id VARCHAR(255) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(200) NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('image', 'document', 'text')),
    storage_type VARCHAR(50) DEFAULT 'local',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tool_id ON conversations(tool_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON conversation_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON conversation_messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON conversation_messages(parent_message_id);

CREATE INDEX IF NOT EXISTS idx_files_conversation_id ON uploaded_files(conversation_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON uploaded_files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON uploaded_files(created_at DESC);

-- 创建更新时间的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表添加更新时间触发器（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
        CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_messages_updated_at') THEN
        CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON conversation_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_files_updated_at') THEN
        CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON uploaded_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 迁移旧数据（可选）
-- 将现有的 conversation_history 数据迁移到新表
INSERT INTO conversations (conversation_id, tool_id, tool_name, model, temperature, total_tokens, message_count, status, created_at, updated_at)
SELECT 
    conversation_id,
    tool_id,
    tool_name,
    model,
    temperature,
    tokens_used,
    1 as message_count,
    status,
    created_at,
    updated_at
FROM conversation_history 
WHERE NOT EXISTS (
    SELECT 1 FROM conversations WHERE conversations.conversation_id = conversation_history.conversation_id
);

-- 将旧的消息数据迁移到新表
INSERT INTO conversation_messages (message_id, conversation_id, role, content, model, tokens_used, status, error_message, metadata, created_at)
SELECT 
    'msg_' || EXTRACT(EPOCH FROM created_at) || '_' || id as message_id,
    conversation_id,
    'user' as role,
    prompt as content,
    model,
    tokens_used,
    status,
    error_message,
    metadata,
    created_at
FROM conversation_history
WHERE NOT EXISTS (
    SELECT 1 FROM conversation_messages WHERE conversation_messages.conversation_id = conversation_history.conversation_id
);

-- 为assistant回复创建消息（如果有的话）
INSERT INTO conversation_messages (message_id, conversation_id, role, content, model, tokens_used, status, created_at)
SELECT 
    'msg_' || EXTRACT(EPOCH FROM created_at) || '_' || id || '_resp' as message_id,
    conversation_id,
    'assistant' as role,
    response as content,
    model,
    tokens_used,
    status,
    created_at
FROM conversation_history
WHERE response IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM conversation_messages WHERE conversation_messages.conversation_id = conversation_history.conversation_id AND role = 'assistant'
  );

-- 更新会话的消息计数
UPDATE conversations 
SET message_count = (SELECT COUNT(*) FROM conversation_messages WHERE conversation_messages.conversation_id = conversations.conversation_id);
`

  execSync(`psql -d ai_tools_platform -c "${migrationSQL}"`, { stdio: 'inherit' })
  
  console.log('✅ Migration completed successfully!')
  console.log('\n📋 Changes applied:')
  console.log('   - Created conversations table')
  console.log('   - Created conversation_messages table')
  console.log('   - Created uploaded_files table')
  console.log('   - Created indexes and triggers')
  console.log('   - Migrated existing data (optional)')
  
  console.log('\n🚀 Next steps:')
  console.log('   1. Restart backend: npm run dev')
  console.log('   2. Test new API endpoints')
  console.log('   3. Update frontend to use new features')
  
} catch (error) {
  console.error('\n❌ Migration failed:')
  console.error(error.message)
  console.error('\n🔧 Troubleshooting:')
  console.error('   1. Ensure PostgreSQL is running')
  console.error('   2. Check database connection')
  console.error('   3. Verify user permissions')
  console.error('   4. Check if tables already exist')
  process.exit(1)
}
