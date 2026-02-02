# API 更新日志

记录 API 的更新历史。

## v1.0.0 (2025-01-22)

### 初始版本发布

#### 新增功能

- ✅ **工具管理 API**
  - `GET /api/tools` - 获取可用工具列表
  - `POST /api/tools/:id/execute` - 执行单个工具
  - `POST /api/tools/chain` - 执行工具链

- ✅ **文件上传 API**
  - `POST /api/upload` - 上传文件

- ✅ **系统状态 API**
  - `GET /health` - 健康检查

#### 集成工具

- **OpenAI GPT** (`openai`)
  - 文本生成
  - 对话
  - 翻译
  - 文本优化

#### 技术特性

- TypeScript 类型安全
- Express.js 框架
- CORS 跨域支持
- 文件上传 (Multer)
- 错误处理中间件

### 使用示例

#### 执行单个工具

```javascript
POST /api/tools/openai/execute
{
  "input": {
    "prompt": "Hello, how are you?",
    "model": "gpt-3.5-turbo"
  }
}
```

#### 执行工具链

```javascript
POST /api/tools/chain
{
  "tools": [
    {
      "id": "openai",
      "input": {
        "prompt": "将以下内容翻译成英文：你好，世界"
      }
    },
    {
      "id": "openai",
      "input": {
        "prompt": "将以下英文改写成更专业的商务用语"
      }
    }
  ]
}
```

## 待实现功能

### v1.1.0 (计划中)

- [ ] **Claude AI 集成** - 支持 Anthropic Claude
- [ ] **图像生成工具** - DALL-E 或 Stable Diffusion
- [ ] **音频处理工具** - Whisper 语音识别
- [ ] **用户认证系统** - JWT 认证
- [ ] **请求限流** - 防止 API 滥用

### v1.2.0 (计划中)

- [ ] **工具执行历史** - 记录和查询历史记录
- [ ] **工具收藏** - 收藏常用工具
- [ ] **批量文件处理** - 批量上传和处理
- [ ] **WebSocket 支持** - 实时结果推送
- [ ] **工具模板** - 保存常用配置

## 开发指南

### 添加新工具

1. 在 `backend/src/services/` 创建工具类
2. 继承 `BaseTool` 抽象类
3. 在 `ToolRegistry` 中注册
4. 更新文档

### API 规范

- 所有响应必须包含 `success` 字段
- 错误响应必须包含 `error` 字段
- HTTP 状态码遵循 RESTful 规范
- 使用适当的 HTTP 方法 (GET, POST)

### 测试

API 测试可以使用以下工具：

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Hoppscotch](https://hoppscotch.io/)

## 反馈与建议

如有问题或建议，请：

1. 查看详细的 API 文档
2. 参考示例代码
3. 检查服务器日志
4. 提交 Issue
