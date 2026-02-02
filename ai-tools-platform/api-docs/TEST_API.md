# API 配置测试

## 测试 vveai.com API 配置

### 方法1: 使用curl命令测试

```bash
curl -X POST https://api.vveai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-rgEisRrS39KBYKwe09D707F6258148D8A7E0E866D2E6E633" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello, 请介绍一下自己"}]
  }'
```

### 方法2: 使用我们的工具测试

后端服务启动后，可以通过以下方式测试：

#### 使用前端界面

1. 打开浏览器: http://localhost:3000
2. 点击 "AI 工具箱"
3. 找到并点击 "Custom OpenAI API"
4. 在输入框中输入: `Hello, 请介绍一下自己`
5. 点击 "执行" 按钮
6. 查看返回结果

#### 使用API测试

```bash
# 执行单个工具测试
curl -X POST http://localhost:5000/api/tools/custom-openai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "你好，请介绍一下自己",
      "model": "gpt-3.5-turbo",
      "temperature": 0.7
    }
  }'
```

### 预期结果

如果配置正确，应该返回类似以下内容：

```json
{
  "success": true,
  "data": {
    "text": "你好！我是一个AI助手...",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 150,
      "total_tokens": 160
    },
    "model": "gpt-3.5-turbo"
  }
}
```

## 支持的模型

根据 vveai.com 的支持情况，您可以尝试以下模型：

- `gpt-3.5-turbo`
- `gpt-4`
- `gpt-4-turbo`

在请求中指定模型：

```json
{
  "input": {
    "prompt": "你的问题",
    "model": "gpt-4"
  }
}
```

## 故障排查

如果测试失败，请检查：

1. **后端服务是否正常运行**
   ```bash
   curl http://localhost:5000/health
   # 应该返回: {"status":"ok",...}
   ```

2. **环境变量是否正确加载**
   查看后端启动日志，应该能看到:
   ```
   ✅ Custom OpenAI API client initialized
   ```

3. **API密钥是否有效**
   使用curl直接测试:
   ```bash
   curl -X POST https://api.vveai.com/v1/chat/completions \
     -H "Authorization: Bearer sk-rgEisRrS39KBYKwe09D707F6258148D8A7E0E866D2E6E633" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}]}'
   ```

4. **检查后端日志**
   查看后端终端是否有错误信息

## 测试工具链

测试多个工具串联使用：

```bash
curl -X POST http://localhost:5000/api/tools/chain \
  -H "Content-Type: application/json" \
  -d '{
    "tools": [
      {
        "id": "custom-openai",
        "input": {
          "prompt": "将以下内容翻译成英文：人工智能改变未来",
          "model": "gpt-3.5-turbo"
        }
      },
      {
        "id": "custom-openai",
        "input": {
          "prompt": "将以下英文改写成更专业的商务用语",
          "model": "gpt-3.5-turbo"
        }
      }
    ]
  }'
```

## 成功标志

当配置正确且API可用时：

1. ✅ 后端启动日志显示 "Custom OpenAI API client initialized"
2. ✅ 前端工具列表显示 "Custom OpenAI API"
3. ✅ 执行工具返回正常的AI回复
4. ✅ API响应包含 `success: true` 和 `data.text`

## 下一步

配置成功后，您可以：

1. **探索不同模型**: 尝试不同的 model 参数
2. **调整参数**: 调整 temperature, max_tokens 等
3. **构建工具链**: 将多个AI步骤串联
4. **添加更多工具**: 参考文档添加新的AI工具

## 需要帮助？

如果测试遇到问题：

1. 查看 [故障排查指南](./third-party-integration.md#故障排查)
2. 检查后端控制台错误信息
3. 直接访问 https://api.vveai.com 查看服务状态
4. 确认API密钥是否有效且余额充足
