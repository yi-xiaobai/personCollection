import request from './request.js';

/**
 * 分类相关的 API 接口
 */

// 获取所有分类
export function getCategories() {
  return request({
    url: '/categories',
    method: 'get',
  });
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data,
  });
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data,
  });
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete',
  });
}
