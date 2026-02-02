# API 文档

本文档包含 AI Tools Platform 的所有 API 接口说明。

## 📁 文档结构

```
api-docs/
├── README.md              # 本文档
├── authentication.md      # 认证接口
├── tools.md               # AI工具接口
├── uploads.md             # 文件上传接口
├── examples/              # 示例代码
│   ├── javascript.md
│   ├── python.md
│   └── curl.md
└── changelog.md           # API更新日志
```

## 🔌 基础信息

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **响应格式**: 所有响应均为 JSON 格式

## 📚 API 概览

### 1. 工具管理
- `GET /tools` - 获取可用工具列表
- `POST /tools/:id/execute` - 执行单个工具
- `POST /tools/chain` - 执行工具链

### 2. 文件上传
- `POST /upload` - 上传文件

### 3. 系统状态
- `GET /health` - 健康检查

## 📝 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {}
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 🔧 状态码

- **200**: 请求成功
- **400**: 请求参数错误
- **404**: 资源未找到
- **500**: 服务器错误

## 📖 快速开始

### cURL 示例

```bash
# 获取工具列表
curl http://localhost:5000/api/tools

# 执行工具
curl -X POST http://localhost:5000/api/tools/openai/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "Hello"}}'
```

### JavaScript/Axios 示例

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// 获取工具列表
const tools = await api.get('/tools')

// 执行工具
const result = await api.post('/tools/openai/execute', {
  input: {
    prompt: 'Hello'
  }
})
```

## 📌 更新日志

查看 [changelog.md](./changelog.md) 了解 API 的更新历史。
