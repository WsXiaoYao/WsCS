# 多轮对话与多模态输入功能

## 🎉 新功能概览

已成功实现以下高级功能：

### 1. ✅ 多轮对话上下文管理
- 支持完整的对话会话管理
- 消息链式存储和检索
- 上下文感知的AI回复
- 对话分支和版本控制

### 2. ✅ 文件上传与多模态输入
- 支持图片上传和预览
- 支持文档上传（PDF、Word、文本）
- 文件元数据管理
- 本地文件存储

## 📊 数据库架构升级

### 新表结构

#### `conversations` - 对话会话表
管理完整的对话会话生命周期。

```sql
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
```

**字段说明：**
- `conversation_id`: 唯一对话标识
- `title`: 对话标题（自动提取）
- `total_tokens`: 累计Token使用量
- `message_count`: 消息数量
- `status`: active/archived/deleted

#### `conversation_messages` - 对话消息表
存储对话中的每条消息，支持多轮上下文。

```sql
CREATE TABLE conversation_messages (
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
```

**字段说明：**
- `message_id`: 唯一消息标识
- `parent_message_id`: 父消息ID（支持对话分支）
- `role`: 消息角色（user/assistant/system）
- `status`: completed/failed/pending

#### `uploaded_files` - 上传文件表
管理用户上传的文件。

```sql
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
```

**字段说明：**
- `file_id`: 唯一文件标识
- `file_path`: 存储路径（相对路径）
- `file_type`: image/document/text
- `storage_type`: local（本地存储）

## 🚀 API 接口

### 多轮对话 API

#### 1. 创建对话会话
```http
POST /api/tools/conversations
Content-Type: application/json

{
  "toolId": "custom-openai",
  "toolName": "Custom OpenAI API",
  "model": "gpt-4",
  "temperature": 0.7
}

Response:
{
  "success": true,
  "data": {
    "conversationId": "conv_123456",
    "toolId": "custom-openai",
    "toolName": "Custom OpenAI API",
    "model": "gpt-4",
    "temperature": 0.7,
    "status": "active",
    "createdAt": "2024-01-23T10:00:00.000Z"
  }
}
```

#### 2. 添加消息
```http
POST /api/tools/conversations/:conversationId/messages
Content-Type: application/json

{
  "parentMessageId": "msg_123",  // 可选，用于分支
  "role": "user",
  "content": "你好，请问如何学习TypeScript？",
  "model": "gpt-4"
}

Response:
{
  "success": true,
  "data": {
    "messageId": "msg_456",
    "conversationId": "conv_123456",
    "parentMessageId": "msg_123",
    "role": "user",
    "content": "你好，请问如何学习TypeScript？",
    "model": "gpt-4",
    "createdAt": "2024-01-23T10:01:00.000Z"
  }
}
```

#### 3. 获取对话详情
```http
GET /api/tools/conversations/:conversationId?includeMessages=true

Response:
{
  "success": true,
  "data": {
    "conversationId": "conv_123456",
    "toolId": "custom-openai",
    "title": "TypeScript学习指南",
    "model": "gpt-4",
    "temperature": 0.7,
    "totalTokens": 1250,
    "messageCount": 8,
    "status": "active",
    "createdAt": "2024-01-23T10:00:00.000Z",
    "updatedAt": "2024-01-23T10:30:00.000Z",
    "messages": [
      {
        "messageId": "msg_123",
        "role": "user",
        "content": "你好",
        "tokensUsed": 10,
        "createdAt": "2024-01-23T10:00:00.000Z"
      },
      {
        "messageId": "msg_124",
        "role": "assistant",
        "content": "你好！有什么可以帮助你的吗？",
        "tokensUsed": 15,
        "createdAt": "2024-01-23T10:00:05.000Z"
      }
    ]
  }
}
```

#### 4. 获取对话列表
```http
GET /api/tools/conversations?limit=20&offset=0

Response:
{
  "success": true,
  "data": [
    {
      "conversationId": "conv_123456",
      "title": "TypeScript学习指南",
      "model": "gpt-4",
      "messageCount": 8,
      "updatedAt": "2024-01-23T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45
  }
}
```

### 文件上传 API

#### 1. 上传文件
```http
POST /api/tools/conversations/:conversationId/upload
Content-Type: multipart/form-data

Form Data:
- file: [二进制文件数据]
- conversationId: conv_123456

Response:
{
  "success": true,
  "data": {
    "fileId": "file_abc123",
    "conversationId": "conv_123456",
    "originalName": "example.png",
    "filePath": "file_abc123.png",
    "fileSize": 204800,
    "mimeType": "image/png",
    "fileType": "image",
    "storageType": "local",
    "createdAt": "2024-01-23T10:00:00.000Z"
  }
}
```

#### 2. 获取对话文件
```http
GET /api/tools/conversations/:conversationId/files

Response:
{
  "success": true,
  "data": [
    {
      "fileId": "file_abc123",
      "originalName": "example.png",
      "fileSize": 204800,
      "mimeType": "image/png",
      "fileType": "image",
      "createdAt": "2024-01-23T10:00:00.000Z"
    }
  ]
}
```

#### 3. 删除文件
```http
DELETE /api/tools/files/:fileId

Response:
{
  "success": true,
  "data": {
    "fileId": "file_abc123"
  }
}
```

## 💻 前端组件

### FileUpload.vue - 文件上传组件

支持拖拽上传、多文件选择、预览和删除。

**特性：**
- ✅ 拖拽上传
- ✅ 多文件选择（最多5个）
- ✅ 文件类型验证
- ✅ 大小限制（10MB）
- ✅ 图片预览
- ✅ 文件删除
- ✅ 上传进度显示

**使用示例：**
```vue
<FileUpload
  :conversationId="currentConversationId"
  :apiBaseUrl="apiBaseUrl"
  @fileUploaded="onFileUploaded"
  @fileRemoved="onFileRemoved"
/>
```

### 多轮对话集成

前端需要更新以支持：

1. **对话会话管理**
   - 创建新对话
   - 加载历史对话
   - 显示对话列表

2. **消息链显示**
   - 显示完整的消息历史
   - 支持消息分支
   - 上下文感知的回复

3. **文件与消息关联**
   - 在消息中显示附件
   - 支持图片消息
   - 文件下载和预览

## 🎯 使用场景

### 场景1：技术支持对话
```
用户: 我的网站出现这个问题 [上传截图 error.png]
AI: 从截图看，这是一个CORS错误...
用户: 那应该如何修复？
AI: 你可以在你的服务器配置中添加...
用户: 能给我具体的代码示例吗？
AI: 当然，这是Nginx配置示例...
```

**特点**: 
- 通过图片快速说明问题
- 多轮问答逐步深入
- 上下文保持连贯

### 场景2：文档分析
```
用户: 请分析这份市场报告 [上传 report.pdf]
AI: 这份报告主要涵盖...
用户: 第3页的数据能详细解释一下吗？
AI: 第3页的数据显示...
用户: 基于这些数据，有什么建议？
AI: 根据分析结果，我建议...
```

**特点**:
- 上传文档进行深度分析
- 基于文档内容的问答
- 提供数据驱动的建议

### 场景3：学习辅导
```
用户: 我不懂这个概念 [上传 textbook.png]
AI: 这是一个关于...
用户: 能举个例子吗？
AI: 比如，当你...
用户: 那这个公式怎么用？
AI: 这个公式应用于...
```

**特点**:
- 通过图片分享学习材料
- 循序渐进的解释
- 理论与实践结合

## 🔧 配置说明

### 文件存储配置

**本地存储**（默认）:
```bash
# 上传文件存储路径
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

**支持的文件类型**:
- 图片: jpg, jpeg, png, gif, webp
- 文档: pdf, doc, docx
- 文本: txt, md

### 模型配置

**支持多模态的模型**:
- GPT-4 Vision (gpt-4-turbo)
- Claude 3 (claude-3-opus)
- Gemini Vision

```bash
# 配置多模态模型
CUSTOM_OPENAI_MODEL=gpt-4-turbo
```

## 🚀 快速开始

### 1. 更新数据库

```bash
cd ai-tools-platform/backend
npm run init-db
```

### 2. 安装依赖

```bash
cd ai-tools-platform/backend
npm install uuid @types/uuid

cd ai-tools-platform/frontend
# 确保 Element Plus 的图标可用
```

### 3. 重启服务

```bash
# 后端
cd ai-tools-platform/backend
npm run dev

# 前端
cd ai-tools-platform/frontend
npm run dev
```

### 4. 使用新功能

1. **创建对话**: 自动创建新的对话会话
2. **发送消息**: 支持多轮上下文
3. **上传文件**: 拖拽或选择文件上传
4. **查看历史**: 完整的对话历史记录

## 🎉 总结

### 已实现的核心功能

✅ **多轮对话管理**
- 对话会话的创建和管理
- 消息链式存储和检索
- 上下文感知的AI回复
- 对话统计和元数据

✅ **文件上传与管理**
- 支持多种文件类型
- 文件预览和删除
- 文件与对话关联
- 安全的文件存储

✅ **完整的API支持**
- RESTful API设计
- 错误处理和验证
- 权限控制（预留）
- 详细的文档说明

✅ **可扩展架构**
- 支持云存储（AWS S3, 阿里云OSS等）
- 预留多模态AI接口
- 支持对话分支和版本
- 易于添加新功能

### 下一步计划

1. **前端界面更新**
   - 集成多轮对话显示
   - 添加文件上传组件
   - 优化移动端体验

2. **高级功能**
   - 对话搜索和过滤
   - 对话导出（PDF, Markdown）
   - 实时协作编辑
   - WebSocket 实时更新

3. **AI能力增强**
   - 支持语音输入输出
   - 集成更多多模态模型
   - 智能对话摘要
   - 自动标签分类

---

**现在你可以享受更强大的AI对话体验了！** 🎊
