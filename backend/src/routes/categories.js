import express from 'express';
import githubService from '../services/githubService.js';

const router = express.Router();

/**
 * 获取所有分类
 * GET /api/categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await githubService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message,
    });
  }
});

/**
 * 创建新分类
 * POST /api/categories
 * Body: { name: string, description?: string }
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // 验证必填字段
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空',
      });
    }

    const category = await githubService.createCategory({
      name: name.trim(),
      description: description?.trim() || '',
    });

    res.status(201).json({
      success: true,
      data: category,
      message: '分类创建成功',
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message,
    });
  }
});

/**
 * 更新分类
 * PUT /api/categories/:id
 * Body: { name?: string, description?: string }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // 构建更新对象
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();

    // 验证是否有更新内容
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的内容',
      });
    }

    const category = await githubService.updateCategory(id, updates);

    res.json({
      success: true,
      data: category,
      message: '分类更新成功',
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    const status = error.message === '分类不存在' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || '更新分类失败',
    });
  }
});

/**
 * 删除分类
 * DELETE /api/categories/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await githubService.deleteCategory(id);

    res.json({
      success: true,
      message: '分类删除成功(该分类下的文章也已删除)',
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    const status = error.message === '分类不存在' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || '删除分类失败',
    });
  }
});

export default router;
