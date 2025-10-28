import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { validateConfig } from './config/github.js';
import categoriesRouter from './routes/categories.js';
import articlesRouter from './routes/articles.js';

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 5174;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析 JSON 请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

// API 路由
app.use('/api/categories', categoriesRouter);
app.use('/api/articles', articlesRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.path,
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 启动服务器
async function startServer() {
  try {
    // 验证配置
    console.log('正在验证配置...');
    validateConfig();
    console.log('✓ 配置验证通过');

    // 启动服务器
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('  文章链接收藏管理系统 - 后端服务');
      console.log('========================================');
      console.log(`✓ 服务已启动: http://localhost:${PORT}`);
      console.log(`✓ 健康检查: http://localhost:${PORT}/health`);
      console.log(`✓ API 地址: http://localhost:${PORT}/api`);
      console.log('========================================\n');
      console.log('按 Ctrl+C 停止服务\n');
    });
  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.error('\n请检查:');
    console.error('1. .env 文件是否存在');
    console.error('2. GitHub Token 是否正确配置');
    console.error('3. GitHub 用户名和仓库名是否正确\n');
    process.exit(1);
  }
}

// 启动应用
startServer();

export default app;
