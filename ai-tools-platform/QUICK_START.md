# 快速启动指南

## 方式一：使用启动脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

## 方式二：分别启动

### 1. 安装后端依赖

```bash
cd backend
npm install
```

如果安装失败（遇到 anthropic 包问题），修改 `backend/package.json`：
```json
"anthropic": "^0.18.0"  // 改为
"@anthropic-ai/sdk": "^0.18.0"
```

### 2. 配置环境变量

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，填入你的 API Keys（可选，不配置也能启动）
```

### 3. 启动后端服务

```bash
cd backend
npm run dev
```

后端将运行在：http://localhost:5000

### 4. 启动前端服务

打开新的终端窗口：

```bash
cd frontend
npm install  # 首次需要安装
npm run dev
```

前端将运行在：http://localhost:3000

## 访问应用

打开浏览器访问：http://localhost:3000

## 常见问题

### 后端启动失败：`tsx: command not found`

这是因为依赖未安装完成。请确保运行：
```bash
cd backend
npm install
```

### 端口被占用

如果端口被占用，可以修改配置：

- 前端端口：修改 `frontend/vite.config.ts` 中的 `port: 3000`
- 后端端口：修改 `backend/.env` 中的 `PORT=5000`

### 跨域问题

确保 `backend/.env` 中的 `CORS_ORIGIN` 与前端地址一致。

## 开发模式

前端支持热重载，修改代码后自动刷新。
后端使用 `tsx watch`，修改代码后自动重启。
