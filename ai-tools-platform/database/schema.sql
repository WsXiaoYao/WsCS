-- AI Tools Platform 数据库 schema
-- 创建数据库
CREATE DATABASE ai_tools_platform;

-- 切换到新数据库
\c ai_tools_platform;

-- 创建对话会话表（管理对话会话）
CREATE TABLE conversations (
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

-- 创建对话消息表（存储多轮对话的每条消息）
CREATE TABLE conversation_messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
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

-- 创建文件上传表（存储上传的文件信息）
CREATE TABLE uploaded_files (
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

-- 创建工具使用统计表
CREATE TABLE tool_usage_stats (
    id SERIAL PRIMARY KEY,
    tool_id VARCHAR(100) NOT NULL,
    tool_name VARCHAR(255) NOT NULL,
    total_calls BIGINT DEFAULT 0,
    total_tokens BIGINT DEFAULT 0,
    success_calls BIGINT DEFAULT 0,
    error_calls BIGINT DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tool_id)
);

-- 创建用户偏好设置表（可选，后续扩展）
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    default_model VARCHAR(100),
    default_temperature FLOAT DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'zh-CN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX idx_conversations_tool_id ON conversations(tool_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_status ON conversations(status);

CREATE INDEX idx_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_messages_message_id ON conversation_messages(message_id);
CREATE INDEX idx_messages_role ON conversation_messages(role);
CREATE INDEX idx_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX idx_messages_parent_id ON conversation_messages(parent_message_id);

CREATE INDEX idx_files_conversation_id ON uploaded_files(conversation_id);
CREATE INDEX idx_files_file_type ON uploaded_files(file_type);
CREATE INDEX idx_files_created_at ON uploaded_files(created_at DESC);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表添加更新时间触发器
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON conversation_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON uploaded_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_usage_stats_updated_at BEFORE UPDATE ON tool_usage_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
