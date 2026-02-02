#!/bin/bash

# AI Tools Platform 启动脚本

echo "🚀 启动 AI Tools Platform..."

# 检查依赖
echo "📦 检查依赖..."

if [ ! -d "frontend/node_modules" ]; then
    echo "安装前端依赖..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "安装后端依赖..."
    cd backend && npm install && cd ..
fi

# 启动服务
echo "启动后端服务 (端口 5000)..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "启动前端服务 (端口 3000)..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务启动成功!"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待两个进程
wait $BACKEND_PID $FRONTEND_PID
