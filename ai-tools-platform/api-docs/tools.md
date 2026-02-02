# 工具管理 API

## 获取工具列表

获取所有可用的 AI 工具信息。

### 请求

```
GET /api/tools
```

### 请求参数

无

### 响应

**成功 (200)**

```json
{
  "success": true,
  "data": [
    {
      "id": "openai",
      "name": "OpenAI GPT",
      "description": "使用OpenAI GPT模型进行文本生成、对话等任务",
      "type": "text-generation"
    },
    {
      "id": "claude",
      "name": "Claude",
      "description": "使用 Anthropic Claude 模型",
      "type": "text-generation"
    }
  ]
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 工具唯一标识 |
| name | string | 工具名称 |
| description | string | 工具描述 |
| type | string | 工具类型（text-generation, image-generation等）|

## 执行单个工具

执行指定的 AI 工具。

### 请求

```
POST /api/tools/:id/execute
```

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 工具ID |

### 请求体

```json
{
  "input": {
    // 工具特定的输入参数
  }
}
```

### 响应

**成功 (200)**

```json
{
  "success": true,
  "data": {
    // 工具执行结果
  }
}
```

**错误响应**

```json
{
  "success": false,
  "error": "Tool not found: invalid-id"
}
```

## 执行工具链

按顺序执行多个工具，支持结果传递。

### 请求

```
POST /api/tools/chain
```

### 请求体

```json
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
        "prompt": "将以下英文改写成更专业的商务用语：{{context.text}}",
        "context": {
          "text": "Hello, world"
        }
      }
    }
  ]
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tools | array | 是 | 工具执行链 |
| tools[].id | string | 是 | 工具ID |
| tools[].input | object | 否 | 工具输入参数 |

### 响应

**成功 (200)**

```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "data": {
        "text": "Hello, world",
        "usage": {...}
      }
    },
    {
      "success": true,
      "data": {
        "text": "Greetings, esteemed colleagues",
        "usage": {...}
      }
    }
  ]
}
```

**执行流程**

1. 按顺序执行 tools 数组中的工具
2. 每个工具的执行结果会合并到 context 中
3. 后续工具可以使用 context 中的数据
4. 返回所有工具的执行结果

**错误响应**

```json
{
  "success": false,
  "error": "Tools array is required"
}
```

## 具体工具使用示例

### OpenAI GPT

**工具ID**: `openai`

**输入参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| prompt | string | 是 | - | 输入文本 |
| model | string | 否 | gpt-3.5-turbo | 模型名称 |
| temperature | number | 否 | 0.7 | 随机性 (0-2) |

**请求示例**

```json
{
  "input": {
    "prompt": "请介绍一下人工智能",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "text": "人工智能（AI）是计算机科学的一个分支...",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 150,
      "total_tokens": 160
    }
  }
}
```

### Claude

**工具ID**: `claude`

**输入参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| prompt | string | 是 | - | 输入文本 |
| model | string | 否 | claude-3-sonnet-20240229 | 模型名称 |
| max_tokens | number | 否 | 1024 | 最大输出长度 |

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 工具不存在 |
| 500 | 工具执行失败 |
