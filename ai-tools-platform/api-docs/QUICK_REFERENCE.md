# 第三方API接入 - 快速参考

## 📝 需要提供的信息

接入您的第三方OpenAI兼容API，**只需提供2个必需信息**：

### ✅ 必需信息（必须提供）

| 信息名称 | 环境变量 | 格式示例 | 从哪里获取 |
|---------|---------|---------|-----------|
| **API密钥** | `CUSTOM_OPENAI_API_KEY` | `sk-1234567890abcdef...` | API提供商控制台 |
| **API地址** | `CUSTOM_OPENAI_BASE_URL` | `https://api.example.com/v1` | API提供商文档 |

### 📌 可选信息（建议使用默认值）

| 信息名称 | 环境变量 | 默认值 | 说明 |
|---------|---------|-------|------|
| **默认模型** | `CUSTOM_OPENAI_MODEL` | `gpt-3.5-turbo` | 可留空，在请求时指定 |

---

## 🎯 配置示例

### 配置前准备

您需要从API提供商获取：
1. **API密钥** - 通常以 `sk-` 开头的一串字符
2. **API地址** - 类似 `https://api.xxx.com/v1` 的URL

### 配置步骤（2分钟完成）

**第1步**：编辑配置文件
```bash
cd /Users/xiaoyao/vuetest/ai-tools-platform/backend
```

**第2步**：创建或编辑 `.env` 文件
```bash
cp .env.example .env  # 如果还没有.env文件
```

**第3步**：添加您的配置（将xxx替换为您的实际值）
```bash
# 在 .env 文件末尾添加：
CUSTOM_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CUSTOM_OPENAI_BASE_URL=https://api.your-provider.com/v1
```

**第4步**：重启服务
```bash
npm run dev
```

---

## 🔍 如何找到这些信息

### 获取API密钥

1. 登录您的API提供商网站
2. 进入"控制台"或"Dashboard"
3. 找到"API Keys"或"密钥管理"
4. 点击"创建新密钥"
5. 复制生成的密钥（格式：`sk-...`）

### 获取API地址

1. 在控制台找到"API文档"或"开发文档"
2. 查找"Base URL"、"API地址"或"接口地址"
3. 复制完整的URL（必须包含`https://`和`/v1`）

---

## ❓ 常见问题

**Q: 我的API提供商支持哪些模型？**
A: 查看提供商文档中的"模型列表"或"Models"部分

**Q: 如何测试API是否可用？**
A: 使用curl命令（见下方）

**Q: 配置后不工作怎么办？**
A: 检查控制台是否有错误信息，或查看[故障排查](./third-party-integration.md)

---

## 🔧 快速测试命令

配置完成后，使用curl测试API连接：

```bash
curl -X POST https://YOUR_API_URL/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**替换**：
- `YOUR_API_URL` → 您的API地址
- `sk-YOUR_KEY` → 您的API密钥

如果返回JSON响应，说明API配置正确！

---

## 📚 详细文档

如需了解更多：
- [完整集成指南](./third-party-integration.md)
- [配置清单](./CONFIGURATION_CHECKLIST.md)
- [故障排查](./third-party-integration.md#故障排查)

---

## ✅ 检查清单

接入前请确认：

- [ ] 已从API提供商获取密钥
- [ ] 已获取API地址（包含/v1）
- [ ] API支持OpenAI格式（/v1/chat/completions）
- [ ] 已在backend/.env中添加配置
- [ ] 已重启后端服务

配置完成！🎉
