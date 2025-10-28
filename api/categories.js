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
    const categoryId = pathParts[2];
    
    if (categoryId) {
      return await handleSingleCategory(req, res, categoryId);
    } else {
      return await handleCategoryCollection(req, res);
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

async function handleCategoryCollection(req, res) {
  switch (req.method) {
    case 'GET':
      return await handleGetAllCategories(req, res);
    case 'POST':
      return await handleCreateCategory(req, res);
    default:
      return res.status(405).json({ 
        error: '方法不允许',
        message: `不支持的HTTP方法: ${req.method}` 
      });
  }
}

async function handleSingleCategory(req, res, id) {
  switch (req.method) {
    case 'PUT':
      return await handleUpdateCategory(req, res, id);
    case 'DELETE':
      return await handleDeleteCategory(req, res, id);
    default:
      return res.status(405).json({ 
        error: '方法不允许',
        message: `不支持的HTTP方法: ${req.method}` 
      });
  }
}

async function handleGetAllCategories(req, res) {
  const categories = await githubService.getAllCategories();
  
  res.status(200).json({
    success: true,
    data: categories
  });
}

async function handleCreateCategory(req, res) {
  const { name, description } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: '分类名称不能为空'
    });
  }
  
  const newCategory = await githubService.addCategory({
    name: name.trim(),
    description: description?.trim() || ''
  });
  
  res.status(201).json({
    success: true,
    data: newCategory,
    message: '分类创建成功'
  });
}

async function handleUpdateCategory(req, res, id) {
  const { name, description } = req.body;
  
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: '没有要更新的内容'
    });
  }
  
  const category = await githubService.updateCategory(id, updates);
  
  res.status(200).json({
    success: true,
    data: category,
    message: '分类更新成功'
  });
}

async function handleDeleteCategory(req, res, id) {
  await githubService.deleteCategory(id);
  
  res.status(200).json({
    success: true,
    message: '分类删除成功(该分类下的文章也已删除)'
  });
}
