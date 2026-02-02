# 第三方OpenAI兼容API集成指南

## 概述

我们已经为您集成了第三方OpenAI兼容API支持。该API完全兼容OpenAI接口协议，支持GPT、Claude、Gemini等多种模型。

## 需要提供的信息

### 必需信息

1. **API密钥 (API Key)**
   - 格式：`sk-xxx`
   - 获取方式：在您的API提供商控制台获取
   - 环境变量：`CUSTOM_OPENAI_API_KEY`

2. **API地址 (Base URL)**
   - 格式：`https://api.example.com/v1`
   - 获取方式：在您的API提供商控制台查看
   - 环境变量：`CUSTOM_OPENAI_BASE_URL`
   - ⚠️ **注意**：必须包含 `/v1` 后缀

### 可选信息

3. **默认模型 (Model)**
   - 格式：`gpt-3.5-turbo` 或其他模型名称
   - 环境变量：`CUSTOM_OPENAI_MODEL`
   - 默认值：`gpt-3.5-turbo`

## 配置步骤

### 1. 获取配置信息

登录您的API提供商控制台，获取：
- API Key
- API Base URL

### 2. 配置环境变量

编辑 `backend/.env` 文件，添加以下内容：

```env
# 第三方OpenAI兼容API配置
CUSTOM_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CUSTOM_OPENAI_BASE_URL=https://api.your-provider.com/v1
CUSTOM_OPENAI_MODEL=gpt-3.5-turbo  # 可选
```

### 3. 重启后端服务

```bash
cd backend
npm run dev
```

### 4. 验证配置

启动后，在控制台应该能看到：
```
✅ Custom OpenAI API client initialized
```

## 支持的模型

根据API文档，支持的模型包括：

### OpenAI模型
- `gpt-3.5-turbo`
- `gpt-4`
- `gpt-4-turbo`

### Claude模型（如果支持）
- `claude-3-sonnet-20240229`
- `claude-3-opus-20240229`
- `claude-3-haiku-20240307`

### Gemini模型（如果支持）
- `gemini-pro`
- `gemini-pro-vision`

## 使用方式

### 在工具列表中查看

启动应用后，访问工具列表页面，应该能看到：

- **Custom OpenAI API**
- 状态：显示是否已配置
- 支持的模型：显示配置的模型

### API调用示例

#### 执行单个工具

```javascript
POST /api/tools/custom-openai/execute
{
  "input": {
    "prompt": "你好，请介绍一下自己",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

#### 执行工具链

```javascript
POST /api/tools/chain
{
  "tools": [
    {
      "id": "custom-openai",
      "input": {
        "prompt": "将以下内容翻译成英文：人工智能是未来",
        "model": "gpt-3.5-turbo"
      }
    },
    {
      "id": "custom-openai",
      "input": {
        "prompt": "将以下英文改写成更专业的商务用语",
        "model": "gpt-4"
      }
    }
  ]
}
```

### 前端界面使用

1. 打开应用：http://localhost:3000
2. 点击 "AI 工具箱"
3. 选择 "Custom OpenAI API"
4. 输入提示词和参数
5. 点击执行

## 故障排查

### 问题："Custom OpenAI API not configured"

**原因**：环境变量未配置

**解决**：检查 `backend/.env` 文件中是否包含：
```env
CUSTOM_OPENAI_API_KEY=your_key_here
CUSTOM_OPENAI_BASE_URL=https://api.example.com/v1
```

### 问题："Invalid API key"

**原因**：API密钥无效

**解决**：
1. 确认密钥格式正确（以 `sk-` 开头）
2. 检查密钥是否过期
3. 在提供商控制台重新生成密钥

### 问题："Invalid base URL"

**原因**：API地址格式错误

**解决**：
1. 确认URL包含 `https://`
2. 确认URL以 `/v1` 结尾
3. 示例：`https://api.openai.com/v1`

### 问题："Model not found"

**原因**：指定的模型不支持

**解决**：
1. 检查 `CUSTOM_OPENAI_MODEL` 是否设置正确
2. 联系API提供商确认支持的模型列表
3. 在请求中指定 `model` 参数使用支持的模型

### 如何验证API可用性

使用curl测试：

```bash
curl -X POST https://your-api-url/v1/chat/completions \
  -H "Authorization: Bearer sk-your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## 高级配置

### 使用不同的模型

在请求中指定模型：

```javascript
{
  "input": {
    "prompt": "你的问题",
    "model": "claude-3-sonnet-20240229"  // 使用Claude模型
  }
}
```

### 调整生成参数

```javascript
{
  "input": {
    "prompt": "你的问题",
    "temperature": 0.9,      // 随机性 (0-2)
    "max_tokens": 2000,      // 最大输出长度
    "top_p": 0.95,           // 核心采样
    "frequency_penalty": 0.5 // 重复惩罚
  }
}
```

## 安全建议

1. **不要提交API密钥到Git**
   - `.env` 文件已添加到 `.gitignore`
   - 使用 `.env.example` 作为模板

2. **定期更换API密钥**
   - 在API提供商控制台重新生成
   - 更新 `.env` 文件

3. **限制访问**
   - 在生产环境中添加认证中间件
   - 限制IP访问（如需要）

## 费用说明

API调用费用取决于：
- 使用的模型
- 输入token数量
- 输出token数量

请查看您的API提供商的价格文档了解详情。

## 支持

如有问题：
1. 检查本指南的故障排查部分
2. 查看服务器日志
3. 联系API提供商技术支持
4. 提交Issue到本项目

## 更新日志

- 2025-01-22: 初始集成完成
  - 支持第三方OpenAI兼容API
  - 支持多种模型（GPT、Claude、Gemini）
  - 添加配置验证和错误处理
