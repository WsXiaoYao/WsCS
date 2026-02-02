# 文件上传 API

## 上传文件

上传文件到服务器，返回文件信息。

### 请求

```
POST /api/upload
```

### 请求格式

Content-Type: `multipart/form-data`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 要上传的文件 |

### 请求示例

**使用 FormData (JavaScript)**

```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])

fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
})
```

**使用 cURL**

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/your/file.txt"
```

### 响应

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "filename": "1703165421234-56789.txt",
    "originalname": "myfile.txt",
    "size": 1024,
    "mimetype": "text/plain",
    "url": "/uploads/1703165421234-56789.txt"
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| filename | string | 服务器保存的文件名 |
| originalname | string | 原始文件名 |
| size | number | 文件大小（字节） |
| mimetype | string | MIME 类型 |
| url | string | 访问文件的 URL |

**错误响应**

```json
{
  "success": false,
  "error": "No file uploaded"
}
```

### 访问上传的文件

上传后的文件可以通过以下 URL 访问：

```
http://localhost:5000/uploads/{filename}
```

例如：

```
http://localhost:5000/uploads/1703165421234-56789.txt
```

### 文件大小限制

默认最大文件大小：10MB

可以在 `backend/.env` 中配置：

```env
MAX_FILE_SIZE=10485760  # 10MB = 10 * 1024 * 1024
```

### 支持的文件类型

服务器支持上传所有类型的文件，但前端可以根据需求限制文件类型：

**前端限制示例**

```html
<input type="file" accept=".txt,.pdf,.jpg,.png" />
```

### 存储位置

上传的文件存储在 `backend/uploads/` 目录下。

### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 未选择文件 |
| 413 | 文件大小超过限制 |
| 500 | 服务器错误 |
