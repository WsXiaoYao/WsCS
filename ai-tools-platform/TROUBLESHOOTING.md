# 故障排查 - 工具列表不显示

## 🔍 问题诊断

您能看到AI工具箱页面，但没有显示工具列表。这通常是后端API问题。

## ✅ 快速修复步骤

### 步骤1: 检查后端是否运行

打开新终端，执行：
```bash
cd /Users/xiaoyao/vuetest/ai-tools-platform/backend
lsof -ti:5000
```

**如果有输出**（显示PID），说明后端在运行，跳到步骤3

**如果没有输出**，执行步骤2

### 步骤2: 启动后端

```bash
cd /Users/xiaoyao/vuetest/ai-tools-platform/backend
npm run dev
```

观察输出，应该看到：
```
✅ Custom OpenAI API client initialized
🚀 Server running on port 5000
```

### 步骤3: 测试API

打开新终端，执行：
```bash
curl http://localhost:5000/health
```

**预期结果**：
```json
{"status":"ok","timestamp":"2025-01-22T..."}
```

如果看到这个，说明后端正常。然后测试工具列表：
```bash
curl http://localhost:5000/api/tools
```

**预期结果**：
```json
{"success":true,"data":[{"id":"openai","name":"OpenAI GPT",...},{...}]}
```

### 步骤4: 检查浏览器控制台

1. 打开浏览器，访问 http://localhost:3000/tools
2. 按 **F12** 打开开发者工具
3. 切换到 **Console** 标签
4. 查看是否有红色错误

**常见错误**：
- `Failed to load resource: net::ERR_CONNECTION_REFUSED` → 后端没启动
- `CORS error` → 后端配置问题
- `404 Not Found` → API路由错误

### 步骤5: 检查网络请求

1. 在开发者工具中切换到 **Network** 标签
2. 刷新页面
3. 查看是否有到 `http://localhost:5000/api/tools` 的请求
4. 检查请求状态：
   - **200 OK** → 正常
   - **404/500** → 后端错误
   - **failed** → 后端没启动或端口被占用

## 🔧 常见问题及解决

### 问题1: 端口被占用

**症状**：后端启动失败，提示 `EADDRINUSE`

**解决**：
```bash
# 找到占用5000端口的进程
lsof -ti:5000

# 杀死进程（将PID替换为实际数字）
kill -9 PID

# 重新启动后端
cd backend && npm run dev
```

### 问题2: CORS错误

**症状**：浏览器控制台显示 CORS policy 错误

**解决**：
检查 `backend/.env` 中的配置：
```env
CORS_ORIGIN=http://localhost:3000
```

如果修改了前端端口，需要同步修改这里

### 问题3: API返回空数据

**症状**：API返回 `{"success":true,"data":[]}`

**解决**：
检查后端日志，看是否有错误。通常是因为：
- 环境变量配置错误
- API密钥无效
- 工具注册失败

## 🎯 终极解决方案

如果以上步骤都无法解决，使用测试脚本：

```bash
cd /Users/xiaoyao/vuetest/ai-tools-platform
./test-tools-api.sh
```

这个脚本会：
1. 清理端口
2. 启动后端
3. 测试API
4. 显示结果

## 📞 如果还是不行

请提供以下信息：

1. **后端日志**：
   ```bash
   cd /Users/xiaoyao/vuetest/ai-tools-platform/backend
   cat backend.log
   ```

2. **API测试结果**：
   ```bash
   curl -v http://localhost:5000/api/tools
   ```

3. **浏览器控制台截图**：F12 → Console标签

4. **网络请求截图**：F12 → Network标签

## ✅ 成功标志

当一切正常时，你应该看到：

### 后端日志
```
✅ Custom OpenAI API client initialized
🚀 Server running on port 5000
```

### API测试
```bash
$ curl http://localhost:5000/api/tools

{"success":true,"data":[
  {"id":"openai","name":"OpenAI GPT","description":"...","type":"text-generation","category":"text-generation"},
  {"id":"custom-openai","name":"Custom OpenAI API","description":"...","type":"text-generation","category":"text-generation","isConfigured":true,"configuredModel":"gpt-3.5-turbo","baseURL":"[CONFIGURED]"}
]}
```

### 前端页面
- AI工具箱页面显示2个工具卡片
- 点击卡片可以进入工具详情页
- 输入问题后能得到AI回复

---

**现在请尝试步骤1-3，看看后端是否正常运行！**
