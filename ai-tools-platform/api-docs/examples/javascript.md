# JavaScript/TypeScript 示例

本文档提供使用 JavaScript/TypeScript 调用 API 的示例。

## 基础配置

### 使用 Axios

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    throw error
  }
)
```

### 使用 Fetch API

```javascript
const API_BASE_URL = 'http://localhost:5000/api'

const fetchApi = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
```

## 获取工具列表

### Axios 版本

```javascript
const getTools = async () => {
  try {
    const response = await api.get('/tools')
    console.log('可用工具:', response.data)
    return response.data
  } catch (error) {
    console.error('获取工具列表失败:', error)
    throw error
  }
}

// 使用示例
getTools().then(tools => {
  console.log(`找到 ${tools.length} 个工具`)
})
```

### Fetch 版本

```javascript
const getTools = async () => {
  try {
    const data = await fetchApi('/tools')
    console.log('可用工具:', data.data)
    return data.data
  } catch (error) {
    console.error('获取工具列表失败:', error)
    throw error
  }
}
```

## 执行工具

### Axios 版本

```javascript
const executeTool = async (toolId, input) => {
  try {
    const response = await api.post(`/tools/${toolId}/execute`, { input })
    console.log('执行结果:', response.data)
    return response.data
  } catch (error) {
    console.error('工具执行失败:', error)
    throw error
  }
}

// OpenAI 示例
executeTool('openai', {
  prompt: '请介绍一下人工智能',
  model: 'gpt-3.5-turbo',
  temperature: 0.7
}).then(result => {
  console.log('AI回复:', result.data.text)
})
```

### Fetch 版本

```javascript
const executeTool = async (toolId, input) => {
  try {
    const data = await fetchApi(`/tools/${toolId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input })
    })
    console.log('执行结果:', data.data)
    return data.data
  } catch (error) {
    console.error('工具执行失败:', error)
    throw error
  }
}
```

## 执行工具链

### Axios 版本

```javascript
const executeToolChain = async (tools) => {
  try {
    const response = await api.post('/tools/chain', { tools })
    console.log('工具链执行结果:', response.data)
    return response.data
  } catch (error) {
    console.error('工具链执行失败:', error)
    throw error
  }
}

// 使用示例：翻译并优化文本
executeToolChain([
  {
    id: 'openai',
    input: {
      prompt: '将以下内容翻译成英文：你好，世界'
    }
  },
  {
    id: 'openai',
    input: {
      prompt: '将以下英文改写成更专业的商务用语'
    }
  }
]).then(results => {
  const firstResult = results.data[0]
  const secondResult = results.data[1]
  console.log('翻译结果:', firstResult.data.text)
  console.log('优化结果:', secondResult.data.text)
})
```

## 上传文件

### Axios 版本

```javascript
const uploadFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('文件上传成功:', response.data)
    return response.data
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

// 使用示例：从文件输入上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file).then(result => {
      console.log('文件URL:', result.data.url)
    })
  }
}
```

### Fetch 版本

```javascript
const uploadFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('文件上传成功:', data.data)
    return data.data
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}
```

## 完整工具类

```javascript
class AiToolsApi {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.api.interceptors.response.use(
      response => response.data,
      error => {
        console.error('API Error:', error)
        throw error
      }
    )
  }

  // 获取工具列表
  async getTools() {
    const response = await this.api.get('/tools')
    return response.data
  }

  // 执行工具
  async executeTool(toolId, input) {
    const response = await this.api.post(`/tools/${toolId}/execute`, { input })
    return response.data
  }

  // 执行工具链
  async executeChain(tools) {
    const response = await this.api.post('/tools/chain', { tools })
    return response.data
  }

  // 上传文件
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }

  // 健康检查
  async healthCheck() {
    const response = await this.api.get('/health')
    return response.data
  }
}

// 使用示例
const aiTools = new AiToolsApi()

// 获取工具列表
const tools = await aiTools.getTools()
console.log('可用工具:', tools)

// 执行 OpenAI
const result = await aiTools.executeTool('openai', {
  prompt: '请写一首关于春天的诗',
  model: 'gpt-3.5-turbo',
  temperature: 0.8
})
console.log('AI回复:', result.text)

// 执行工具链
const chainResults = await aiTools.executeChain([
  {
    id: 'openai',
    input: {
      prompt: '生成 5 个关于科技产品的创意名称'
    }
  },
  {
    id: 'openai',
    input: {
      prompt: '从以下名称中选择最好的一个，并解释原因'
    }
  }
])
console.log('工具链结果:', chainResults)
```

## 错误处理

```javascript
const handleApiError = (error) => {
  if (error.response) {
    // 服务器返回错误响应
    console.error('Response error:', error.response.data)
    console.error('Status:', error.response.status)
  } else if (error.request) {
    // 请求发送失败
    console.error('Request error:', error.request)
  } else {
    // 其他错误
    console.error('Error:', error.message)
  }
}

// 使用 try-catch 包装
const safeExecute = async (apiCall) => {
  try {
    return await apiCall()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

// 使用示例
const result = await safeExecute(() => executeTool('openai', {
  prompt: 'Hello'
}))
```

## 在 Vue 3 中使用

```javascript
// composables/useAiTools.js
import { ref } from 'vue'
import { AiToolsApi } from '@/api/aiTools'

export function useAiTools() {
  const api = new AiToolsApi()
  const loading = ref(false)
  const error = ref(null)

  const executeTool = async (toolId, input) => {
    loading.value = true
    error.value = null

    try {
      const result = await api.executeTool(toolId, input)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    executeTool,
    getTools: api.getTools.bind(api),
    executeChain: api.executeChain.bind(api),
    uploadFile: api.uploadFile.bind(api)
  }
}

// 在组件中使用
import { useAiTools } from '@/composables/useAiTools'

export default {
  setup() {
    const { executeTool, loading, error } = useAiTools()
    const prompt = ref('')
    const result = ref('')

    const handleSubmit = async () => {
      try {
        const response = await executeTool('openai', {
          prompt: prompt.value
        })
        result.value = response.data.text
      } catch (err) {
        console.error('执行失败:', err)
      }
    }

    return {
      prompt,
      result,
      loading,
      error,
      handleSubmit
    }
  }
}
```
