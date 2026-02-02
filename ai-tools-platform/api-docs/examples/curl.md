# cURL 示例

本文档提供使用 cURL 调用 API 的示例。

## 获取工具列表

```bash
curl -X GET http://localhost:5000/api/tools
```

## 执行 OpenAI 工具

```bash
curl -X POST http://localhost:5000/api/tools/openai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "请介绍一下人工智能",
      "model": "gpt-3.5-turbo",
      "temperature": 0.7
    }
  }'
```

## 执行工具链

```bash
curl -X POST http://localhost:5000/api/tools/chain \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## 上传文件

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/your/document.pdf"
```

## 健康检查

```bash
curl -X GET http://localhost:5000/health
```

## 使用环境变量

可以将 API URL 保存为环境变量：

```bash
export API_URL=http://localhost:5000/api

curl -X GET $API_URL/tools
curl -X POST $API_URL/tools/openai/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "Hello"}}'
```

## 保存响应到文件

```bash
# 保存 JSON 响应
curl -X POST http://localhost:5000/api/tools/openai/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "Hello"}}' \
  -o response.json

# 保存上传的文件
curl -X GET http://localhost:5000/uploads/filename.txt -o downloaded.txt
```

## 美化 JSON 输出

```bash
# 使用 jq（需要先安装 jq）
curl -X GET http://localhost:5000/api/tools | jq

# 或者使用 Python
curl -X GET http://localhost:5000/api/tools | python3 -m json.tool
```

## 调试模式

```bash
# 显示请求详情
curl -v -X POST http://localhost:5000/api/tools/openai/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "Hello"}}'

# 显示响应头
curl -i -X GET http://localhost:5000/api/tools
```

## 错误处理

```bash
# 检查 HTTP 状态码
curl -w "%{http_code}" -o /dev/null -s http://localhost:5000/api/tools

# 完整错误信息
curl -X POST http://localhost:5000/api/tools/invalid/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {}}'
```
