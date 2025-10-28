# 文章链接收藏管理系统

一个简约优雅的文章链接管理系统,帮助你收藏和整理看到的好文章。

## 📋 项目简介

这是一个基于 Vue3 + Node.js 的文章链接管理系统,数据通过 GitHub API 存储在 GitHub 仓库中。系统采用蓝白配色,界面简约大气。

## ✨ 主要功能

### 文章分类管理
- **新增分类**: 创建新的文章分类(如技术、设计、产品等)
- **编辑分类**: 修改分类名称和描述
- **删除分类**: 删除不需要的分类(会提示是否删在该分类下的文章)

### 文章链接管理
- **添加文章**: 保存文章标题、链接、描述和所属分类
- **编辑文章**: 修改文章信息
- **删除文章**: 移除不需要的文章链接
- **搜索文章**: 快速查找文章
- **分类筛选**: 按分类查看文章

## 🛠️ 技术栈

### 前端
- **Vue 3**: 渐进式 JavaScript 框架
- **Element Plus**: 基于 Vue 3 的组件库
- **Axios**: HTTP 请求库
- **Vue Router**: 路由管理

### 后端
- **Node.js**: JavaScript 运行环境
- **Express**: Web 应用框架
- **Octokit**: GitHub API 客户端
- **CORS**: 跨域资源共享

### 数据存储
- **GitHub API**: 数据存储在 GitHub 仓库的 JSON 文件中

## 📦 项目结构

```
personCollection/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   ├── views/           # 页面视图
│   │   ├── api/             # API 接口
│   │   ├── router/          # 路由配置
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 入口文件
│   └── index.html           # HTML 入口
│
├── backend/                  # 后端代码
│   └── src/
│       ├── routes/          # 路由
│       ├── services/        # 业务逻辑
│       ├── config/          # 配置文件
│       └── app.js           # 应用入口
│
├── package.json             # 项目依赖配置
├── vite.config.js           # Vite 配置
├── .env.example             # 环境变量示例
├── .gitignore               # Git 忽略文件
└── README.md                # 项目说明文档
```

## 🚀 快速开始

### 前置要求
- Node.js >= 16.0.0
- npm 或 yarn
- GitHub 账号和 Personal Access Token

### 1. 配置 GitHub Token

1. 登录 GitHub,进入 Settings > Developer settings > Personal access tokens
2. 点击 "Generate new token (classic)"
3. 勾选以下权限:
   - `repo` (完整的仓库访问权限)
4. 生成并复制 token

### 2. 安装依赖

```bash
# 在项目根目录安装所有依赖
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件,填入你的配置:
# GITHUB_TOKEN=你的GitHub Token
# GITHUB_OWNER=你的GitHub用户名
# GITHUB_REPO=存储数据的仓库名
# PORT=3000
```

### 4. 启动项目

**方式一：同时启动前后端（推荐）**
```bash
npm run dev
```

**方式二：分别启动**
```bash
# 终端1 - 启动后端
npm run dev:backend

# 终端2 - 启动前端
npm run dev:frontend
```

访问 `http://localhost:5173` 即可使用系统。

## 📝 使用说明

### 首次使用
1. 系统会自动在你的 GitHub 仓库中创建 `data.json` 文件用于存储数据
2. 首先创建一些文章分类
3. 然后在对应分类下添加文章链接

### 数据格式
数据以 JSON 格式存储在 GitHub 仓库中:
```json
{
  "categories": [
    {
      "id": "1",
      "name": "技术文章",
      "description": "技术相关的文章",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "articles": [
    {
      "id": "1",
      "title": "Vue 3 最佳实践",
      "url": "https://example.com",
      "description": "Vue 3 开发指南",
      "categoryId": "1",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🎨 设计特点

- **蓝白配色**: 主色调采用清爽的蓝色和白色
- **简约界面**: 去除冗余元素,突出核心功能
- **响应式设计**: 适配不同屏幕尺寸
- **流畅交互**: 优雅的动画和过渡效果

## 🔧 API 接口

### 分类管理
- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 文章管理
- `GET /api/articles` - 获取所有文章
- `GET /api/articles?categoryId=xxx` - 按分类获取文章
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

## 🤝 注意事项

1. **GitHub Token 安全**: 不要将 token 提交到代码仓库
2. **API 限制**: GitHub API 有请求频率限制,注意控制请求频率
3. **数据备份**: 建议定期备份 GitHub 仓库
4. **仓库权限**: 确保 token 有足够的权限访问目标仓库

## 📄 项目特点

- **统一管理**: 前后端代码在同一项目中,配置文件统一管理
- **一键启动**: 使用 `npm run dev` 同时启动前后端服务
- **简洁结构**: 清晰的目录结构,易于维护和扩展
- **蓝白配色**: 简约大气的界面设计
- **云端存储**: 数据存储在 GitHub,安全可靠

## 💡 未来计划

- [ ] 添加文章标签功能
- [ ] 支持文章导入导出
- [ ] 添加文章阅读状态标记
- [ ] 支持文章笔记功能
- [ ] 优化搜索功能(支持全文搜索)

## 📧 问题反馈

如果在使用过程中遇到问题,请检查:
1. GitHub Token 是否正确配置
2. 网络连接是否正常
3. Node.js 版本是否符合要求
4. 依赖包是否正确安装

---

**祝你使用愉快! 📚✨**
