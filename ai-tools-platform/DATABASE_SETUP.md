# 数据库配置和使用说明

## 📊 数据库功能介绍

已成功为 AI Tools Platform 添加 PostgreSQL 数据库支持，用于存储对话历史记录。

### 支持的功能

✅ **对话历史存储**
- 自动保存每次对话的提示词和回复
- 记录使用的模型、Token 数量、温度参数
- 保存错误信息和状态

✅ **历史记录查询**
- 查看所有对话历史
- 按工具筛选对话
- 加载更多历史记录

✅ **统计分析**
- 总对话数统计
- Token 使用量统计
- 今日对话统计
- 工具使用频率统计

## 🗄️ 数据库 Schema

### 表结构

1. **conversation_history** - 对话历史表
   - `id` - 主键
   - `conversation_id` - 对话唯一标识
   - `tool_id` - 工具ID
   - `tool_name` - 工具名称
   - `prompt` - 用户提示词
   - `response` - AI回复内容
   - `model` - 使用的模型
   - `temperature` - 温度参数
   - `tokens_used` - Token使用量
   - `status` - 状态 (completed/failed)
   - `error_message` - 错误信息
   - `metadata` - 元数据 (JSONB)
   - `created_at` - 创建时间
   - `updated_at` - 更新时间

2. **tool_usage_stats** - 工具使用统计表
3. **user_preferences** - 用户偏好设置表

## 🚀 快速开始

### 1. 确保 PostgreSQL 已启动

```bash
brew services list | grep postgres
```

如果没有运行，启动它：
```bash
brew services start postgresql@14
```

### 2. 初始化数据库

```bash
cd ai-tools-platform/backend
npm run init-db
```

这个命令会：
- 创建数据库 `ai_tools_platform`
- 创建所有必要的表
- 创建索引和触发器

### 3. 配置数据库连接

检查 `.env` 文件中的数据库配置：

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_tools_platform
DB_USER=xiaoyao
DB_PASSWORD=
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000
```

### 4. 重启后端服务

如果后端服务已经在运行，重启它以加载数据库连接：

```bash
# 停止服务
Ctrl + C

# 重新启动
npm run dev
```

## 💻 使用指南

### 查看对话历史

1. 打开浏览器访问 http://localhost:3000
2. 点击顶部导航栏的 **"历史记录"**
3. 查看所有对话历史

### 功能说明

- **筛选工具**：按工具类型筛选对话
- **复用对话**：点击对话右上角的"复用"按钮，跳转到对应工具并填充提示词
- **加载更多**：滚动到底部加载更多历史记录
- **统计信息**：顶部显示总对话数、Token数、今日对话等统计

### 自动保存

所有对话会自动保存到数据库，无需手动操作。

## 🔧 数据库管理

### 手动创建数据库

如果 `npm run init-db` 失败，可以手动创建：

```bash
# 创建数据库
createdb ai_tools_platform

# 执行schema
psql -d ai_tools_platform -f database/schema.sql
```

### 查看数据

```bash
# 连接数据库
psql -d ai_tools_platform

# 查看对话历史
SELECT * FROM conversation_history ORDER BY created_at DESC LIMIT 10;

# 查看统计
SELECT 
  COUNT(*) as total_conversations,
  SUM(tokens_used) as total_tokens,
  COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_conversations
FROM conversation_history;
```

### 备份数据

```bash
pg_dump ai_tools_platform > backup_$(date +%Y%m%d).sql
```

### 清空历史记录

```bash
psql -d ai_tools_platform -c "TRUNCATE conversation_history;"
```

## 🔍 故障排查

### 数据库连接失败

**错误信息**：`Database connection error`

**解决方案**：
1. 检查 PostgreSQL 是否运行：`brew services list`
2. 检查 `.env` 配置是否正确
3. 检查数据库是否存在：`psql -l | grep ai_tools_platform`
4. 检查用户权限

### 表不存在

**错误信息**：`relation "conversation_history" does not exist`

**解决方案**：
```bash
npm run init-db
```

### 权限问题

**错误信息**：`permission denied for schema public`

**解决方案**：
```bash
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ai_tools_platform TO xiaoyao;"
```

## 📈 性能优化

### 索引

已创建的索引：
- `conversation_history(conversation_id)` - 按对话ID查询
- `conversation_history(tool_id)` - 按工具筛选
- `conversation_history(created_at DESC)` - 按时间排序
- `conversation_history(status)` - 按状态筛选

### 连接池

默认配置：
- 最大连接数：20
- 空闲超时：30秒
- 连接超时：5秒

可根据需要调整 `.env` 中的参数。

## 🔄 数据迁移

未来如果需要迁移数据，可以使用：

```bash
# 导出
pg_dump ai_tools_platform > migration.sql

# 导入到新数据库
psql -d new_database -f migration.sql
```

## 📚 API 接口

### 获取对话历史
```
GET /api/tools/history?toolId=custom-openai&limit=50&offset=0
```

### 获取统计信息
```
GET /api/tools/history/stats
```

### 执行工具（自动保存）
```
POST /api/tools/:id/execute
Header: X-Conversation-Id: conv_123456
Body: { input: { prompt: "你好" } }
```

## 🎉 完成！

现在你可以开始使用带有对话历史记录功能的 AI Tools Platform 了！

所有对话将自动保存，你可以随时查看、筛选和复用历史记录。
