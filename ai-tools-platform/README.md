# AI Tools Platform

一个用于串联多个AI工具的全栈应用平台。

## 项目结构

```
ai-tools-platform/
├── frontend/          # Vue 3 前端应用
│   ├── src/
│   │   ├── assets/       # 静态资源
│   │   ├── components/    # 组件
│   │   │   ├── common/    # 通用组件
│   │   │   └── tools/     # AI工具相关组件
│   │   ├── views/         # 页面视图
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # 状态管理
│   │   ├── api/           # API接口
│   │   ├── types/         # TypeScript类型定义
│   │   └── utils/         # 工具函数
│   └── public/            # 公共资源
├── backend/           # Node.js 后端应用
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   └── utils/         # 工具函数
│   └── uploads/           # 上传文件目录
└── shared/            # 前后端共享代码
    ├── types/             # 共享类型定义
    └── constants/         # 共享常量
```

## 技术栈

### 前端
- Vue 3
- TypeScript
- Vite
- Pinia (状态管理)
- Vue Router
- Element Plus / Ant Design Vue (UI组件库)

### 后端
- Node.js
- Express
- TypeScript
- AI SDKs (OpenAI, Anthropic, 等)

## 快速开始

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
npm run dev
```

## 功能特性

- 🔌 多AI工具集成接口
  - OpenAI GPT (官方)
  - 第三方OpenAI兼容API (支持GPT/Claude/Gemini等)
- 🔄 工具链式调用
- 📊 结果可视化
- 🎨 响应式设计
- 🔐 用户认证（可选）
- 📝 操作日志记录
