#!/bin/bash

echo "🚀 测试AI工具API..."

# 停止占用5000端口的进程
echo "🧹 清理端口..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
sleep 2

# 启动后端
echo "📡 启动后端服务..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "后端PID: $BACKEND_PID"

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 测试API
echo "🧪 测试API..."
echo "测试1: 健康检查"
curl -s http://localhost:5000/health || echo "健康检查失败"

echo ""
echo "测试2: 获取工具列表"
curl -s http://localhost:5000/api/tools || echo "获取工具列表失败"

echo ""
echo "📋 后端日志:"
tail -20 ../backend.log

echo ""
echo "✅ 测试完成！如果看到工具列表，说明API正常工作"
echo ""
echo "📌 保持后端运行，不要关闭此终端"
echo "🌐 前端访问: http://localhost:3000"
echo "🛠️  然后点击'AI工具箱'查看工具列表"

wait $BACKEND_PID
