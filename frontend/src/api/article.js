import request from './request.js';

/**
 * 文章相关的 API 接口
 */

// 获取所有文章(可选分类筛选)
export function getArticles(categoryId = null) {
  return request({
    url: '/articles',
    method: 'get',
    params: categoryId ? { categoryId } : {},
  });
}

// 创建文章
export function createArticle(data) {
  return request({
    url: '/articles',
    method: 'post',
    data,
  });
}

// 更新文章
export function updateArticle(id, data) {
  return request({
    url: `/articles/${id}`,
    method: 'put',
    data,
  });
}

// 删除文章
export function deleteArticle(id) {
  return request({
    url: `/articles/${id}`,
    method: 'delete',
  });
}
