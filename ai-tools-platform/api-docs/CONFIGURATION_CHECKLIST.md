# 第三方API接入配置清单

在接入第三方OpenAI兼容API之前，请准备以下信息：

## ✅ 必需信息

### 1. API密钥 (API Key)
- **名称**: `CUSTOM_OPENAI_API_KEY`
- **格式**: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **获取方式**: 在您的API提供商控制台生成
- **示例**: `sk-1234567890abcdef1234567890abcdef`

### 2. API地址 (Base URL)
- **名称**: `CUSTOM_OPENAI_BASE_URL`
- **格式**: `https://api.example.com/v1`
- **注意**: 必须包含 `/v1` 后缀
- **示例**: `https://api.openai.com/v1`

## 📋 可选信息

### 3. 默认模型 (Model)
- **名称**: `CUSTOM_OPENAI_MODEL`
- **默认值**: `gpt-3.5-turbo`
- **支持的值**: 取决于您的API提供商
  - OpenAI: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo`
  - Claude: `claude-3-sonnet-20240229`, `claude-3-opus-20240229`
  - Gemini: `gemini-pro`

## 📋 配置模板

请复制以下内容并填写您的信息：

```bash
# 第三方OpenAI兼容API配置
# 复制到 backend/.env 文件

CUSTOM_OPENAI_API_KEY=sk-你的API密钥
CUSTOM_OPENAI_BASE_URL=https://api.你的提供商.com/v1
CUSTOM_OPENAI_MODEL=gpt-3.5-turbo  # 可选，根据支持的模型修改
```

## 🔍 如何获取这些信息

### 步骤1: 登录控制台
1. 访问您的API提供商网站
2. 登录您的账号
3. 进入"控制台"或"Dashboard"

### 步骤2: 获取API密钥
1. 找到"API Keys"或"密钥管理"
2. 点击"创建新密钥"或"Generate New Key"
3. 复制生成的密钥（格式：`sk-...`）

### 步骤3: 获取API地址
1. 找到"API文档"或"开发文档"
2. 查找"Base URL"或"API地址"
3. 复制完整的URL（必须包含 `https://` 和 `/v1`）

### 步骤4: 确认支持模型（可选）
1. 查看文档中的"支持的模型"
2. 记录您想使用的模型名称
3. 填写到 `CUSTOM_OPENAI_MODEL`

## 📖 常见问题

### Q: 我不知道我的API提供商是否支持OpenAI格式？
**A**: 查看文档是否包含以下关键词：
- "兼容OpenAI"
- "OpenAI format"
- "/v1/chat/completions"

### Q: 我的API密钥格式不对？
**A**: 正确的格式：
- ✅ `sk-1234567890abcdef1234567890abcdef`
- ❌ `1234567890abcdef`（缺少 `sk-` 前缀）
- ❌ `sk_1234567890abcdef`（使用下划线而不是连字符）

### Q: 我的API地址应该是什么格式？
**A**: 正确的格式：
- ✅ `https://api.example.com/v1`
- ❌ `api.example.com`（缺少协议）
- ❌ `https://api.example.com`（缺少 `/v1`）

### Q: 如何测试API是否可用？
**A**: 使用curl命令测试：

```bash
curl -X POST https://你的API地址/v1/chat/completions \
  -H "Authorization: Bearer sk-你的密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## 🚀 配置完成后

1. 将配置添加到 `backend/.env`
2. 重启后端服务：`cd backend && npm run dev`
3. 打开前端：http://localhost:3000
4. 选择 "Custom OpenAI API" 工具
5. 开始测试！

## 📞 需要帮助？

如果配置过程中遇到问题：

1. 检查 [third-party-integration.md](./third-party-integration.md) 故障排查部分
2. 联系您的API提供商技术支持
3. 查看 `backend/src/services/customOpenaiService.ts` 源码
4. 提交Issue到本项目

## ✅ 配置完成检查清单

- [ ] 已获取API密钥
- [ ] 已获取API地址
- [ ] 已确认支持OpenAI格式
- [ ] 已填写 `backend/.env` 文件
- [ ] 已重启后端服务
- [ ] 控制台显示 "✅ Custom OpenAI API client initialized"
- [ ] 前端工具列表显示 "Custom OpenAI API"
