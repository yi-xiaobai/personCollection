const githubService = require('../backend/services/githubService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const articleId = pathParts[2];
    
    if (articleId) {
      return await handleSingleArticle(req, res, articleId);
    } else {
      return await handleArticleCollection(req, res);
    }
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

async function handleArticleCollection(req, res) {
  switch (req.method) {
    case 'GET':
      return await handleGetAllArticles(req, res);
    case 'POST':
      return await handleCreateArticle(req, res);
    default:
      return res.status(405).json({ 
        error: '方法不允许',
        message: `不支持的HTTP方法: ${req.method}` 
      });
  }
}

async function handleSingleArticle(req, res, id) {
  switch (req.method) {
    case 'PUT':
      return await handleUpdateArticle(req, res, id);
    case 'DELETE':
      return await handleDeleteArticle(req, res, id);
    default:
      return res.status(405).json({ 
        error: '方法不允许',
        message: `不支持的HTTP方法: ${req.method}` 
      });
  }
}

async function handleGetAllArticles(req, res) {
  const articles = await githubService.getAllArticles();
  const { categoryId } = req.query;
  
  let filteredArticles = articles;
  if (categoryId) {
    filteredArticles = articles.filter(a => a.categoryId === categoryId);
  }
  
  res.status(200).json({
    success: true,
    data: filteredArticles
  });
}

async function handleCreateArticle(req, res) {
  const { title, url, description, categoryId } = req.body;
  
  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: '文章标题不能为空'
    });
  }
  
  if (!url || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: '文章链接不能为空'
    });
  }
  
  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: '请选择文章分类'
    });
  }
  
  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      success: false,
      message: '请输入有效的 URL 地址'
    });
  }
  
  const newArticle = await githubService.addArticle({
    title: title.trim(),
    url: url.trim(),
    description: description?.trim() || '',
    categoryId
  });
  
  res.status(201).json({
    success: true,
    data: newArticle,
    message: '文章添加成功'
  });
}

async function handleUpdateArticle(req, res, id) {
  const { title, url, description, categoryId } = req.body;
  
  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (url !== undefined) {
    try {
      new URL(url);
      updates.url = url.trim();
    } catch {
      return res.status(400).json({
        success: false,
        message: '请输入有效的 URL 地址'
      });
    }
  }
  if (description !== undefined) updates.description = description.trim();
  if (categoryId !== undefined) updates.categoryId = categoryId;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: '没有要更新的内容'
    });
  }
  
  const article = await githubService.updateArticle(id, updates);
  
  res.status(200).json({
    success: true,
    data: article,
    message: '文章更新成功'
  });
}

async function handleDeleteArticle(req, res, id) {
  await githubService.deleteArticle(id);
  
  res.status(200).json({
    success: true,
    message: '文章删除成功'
  });
}
