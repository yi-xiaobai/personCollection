import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 通过 Vite 代理转发到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 如果响应成功
    if (res.success) {
      return res;
    }
    
    // 如果响应失败,显示错误信息
    ElMessage.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 处理不同的错误状态
    let message = '网络错误,请稍后重试';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = error.response.data.message || '请求参数错误';
          break;
        case 404:
          message = error.response.data.message || '请求的资源不存在';
          break;
        case 500:
          message = error.response.data.message || '服务器错误';
          break;
        default:
          message = error.response.data.message || '请求失败';
      }
    } else if (error.request) {
      message = '网络连接失败,请检查网络';
    }
    
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default request;
