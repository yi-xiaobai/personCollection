import express from 'express';
import githubService from '../services/githubService.js';

const router = express.Router();

/**
 * 获取所有文章
 * GET /api/articles?categoryId=xxx (可选的分类筛选)
 */
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const articles = await githubService.getArticles(categoryId);
    
    res.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章失败',
      error: error.message,
    });
  }
});

/**
 * 创建新文章
 * POST /api/articles
 * Body: { title: string, url: string, description?: string, categoryId: string }
 */
router.post('/', async (req, res) => {
  try {
    const { title, url, description, categoryId } = req.body;
    
    // 验证必填字段
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: '文章标题不能为空',
      });
    }

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: '文章链接不能为空',
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: '请选择文章分类',
      });
    }

    // 简单的 URL 格式验证
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: '请输入有效的 URL 地址',
      });
    }

    const article = await githubService.createArticle({
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() || '',
      categoryId,
    });

    res.status(201).json({
      success: true,
      data: article,
      message: '文章添加成功',
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '创建文章失败',
    });
  }
});

/**
 * 更新文章
 * PUT /api/articles/:id
 * Body: { title?: string, url?: string, description?: string, categoryId?: string }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description, categoryId } = req.body;

    // 构建更新对象
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (url !== undefined) {
      // 验证 URL 格式
      try {
        new URL(url);
        updates.url = url.trim();
      } catch {
        return res.status(400).json({
          success: false,
          message: '请输入有效的 URL 地址',
        });
      }
    }
    if (description !== undefined) updates.description = description.trim();
    if (categoryId !== undefined) updates.categoryId = categoryId;

    // 验证是否有更新内容
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的内容',
      });
    }

    const article = await githubService.updateArticle(id, updates);

    res.json({
      success: true,
      data: article,
      message: '文章更新成功',
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    const status = error.message === '文章不存在' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || '更新文章失败',
    });
  }
});

/**
 * 删除文章
 * DELETE /api/articles/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await githubService.deleteArticle(id);

    res.json({
      success: true,
      message: '文章删除成功',
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    const status = error.message === '文章不存在' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || '删除文章失败',
    });
  }
});

export default router;
