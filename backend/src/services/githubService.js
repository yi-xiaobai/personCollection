import { Octokit } from '@octokit/rest';
import { githubConfig } from '../config/github.js';

// 创建 GitHub API 客户端
const octokit = new Octokit({
  auth: githubConfig.token,
});

/**
 * GitHub 数据服务类
 * 负责与 GitHub API 交互,实现数据的读取和写入
 */
class GitHubService {
  constructor() {
    this.owner = githubConfig.owner;
    this.repo = githubConfig.repo;
    this.path = githubConfig.dataPath;
  }

  /**
   * 从 GitHub 读取数据文件
   * @returns {Promise<Object>} 返回解析后的 JSON 数据
   */
  async getData() {
    try {
      // 尝试获取文件内容
      const { data } = await octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.path,
      });

      // 解码 Base64 内容
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return {
        data: JSON.parse(content),
        sha: data.sha, // 保存 SHA 用于后续更新
      };
    } catch (error) {
      // 如果文件不存在(404错误),创建初始数据
      if (error.status === 404) {
        console.log('数据文件不存在,创建初始数据...');
        const initialData = {
          categories: [],
          articles: [],
        };
        await this.saveData(initialData);
        return {
          data: initialData,
          sha: null,
        };
      }
      throw error;
    }
  }

  /**
   * 保存数据到 GitHub
   * @param {Object} data - 要保存的数据对象
   * @param {string} sha - 文件的 SHA 值(更新时需要)
   * @returns {Promise<Object>} 返回保存后的数据和新的 SHA
   */
  async saveData(data, sha = null) {
    try {
      // 将数据转换为格式化的 JSON 字符串
      const content = JSON.stringify(data, null, 2);
      // 编码为 Base64
      const encodedContent = Buffer.from(content).toString('base64');

      const params = {
        owner: this.owner,
        repo: this.repo,
        path: this.path,
        message: `更新数据 - ${new Date().toISOString()}`,
        content: encodedContent,
      };

      // 如果有 SHA,说明是更新操作
      if (sha) {
        params.sha = sha;
      }

      // 创建或更新文件
      const response = await octokit.repos.createOrUpdateFileContents(params);

      return {
        data,
        sha: response.data.content.sha,
      };
    } catch (error) {
      console.error('保存数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取所有分类
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    const { data } = await this.getData();
    return data.categories || [];
  }

  /**
   * 创建新分类
   * @param {Object} category - 分类对象 {name, description}
   * @returns {Promise<Object>} 创建的分类
   */
  async createCategory(category) {
    const { data, sha } = await this.getData();
    
    // 生成唯一 ID
    const newCategory = {
      id: Date.now().toString(),
      name: category.name,
      description: category.description || '',
      createdAt: new Date().toISOString(),
    };

    data.categories.push(newCategory);
    await this.saveData(data, sha);
    
    return newCategory;
  }

  /**
   * 更新分类
   * @param {string} id - 分类 ID
   * @param {Object} updates - 要更新的字段
   * @returns {Promise<Object>} 更新后的分类
   */
  async updateCategory(id, updates) {
    const { data, sha } = await this.getData();
    
    const index = data.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('分类不存在');
    }

    // 更新分类信息
    data.categories[index] = {
      ...data.categories[index],
      ...updates,
      id, // 确保 ID 不被修改
      updatedAt: new Date().toISOString(),
    };

    await this.saveData(data, sha);
    return data.categories[index];
  }

  /**
   * 删除分类
   * @param {string} id - 分类 ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteCategory(id) {
    const { data, sha } = await this.getData();
    
    const index = data.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('分类不存在');
    }

    // 删除分类
    data.categories.splice(index, 1);
    
    // 同时删除该分类下的所有文章
    data.articles = data.articles.filter(a => a.categoryId !== id);

    await this.saveData(data, sha);
    return true;
  }

  /**
   * 获取所有文章
   * @param {string} categoryId - 可选的分类 ID,用于筛选
   * @returns {Promise<Array>} 文章列表
   */
  async getArticles(categoryId = null) {
    const { data } = await this.getData();
    let articles = data.articles || [];
    
    // 如果指定了分类 ID,进行筛选
    if (categoryId) {
      articles = articles.filter(a => a.categoryId === categoryId);
    }
    
    return articles;
  }

  /**
   * 创建新文章
   * @param {Object} article - 文章对象 {title, url, description, categoryId}
   * @returns {Promise<Object>} 创建的文章
   */
  async createArticle(article) {
    const { data, sha } = await this.getData();
    
    // 验证分类是否存在
    const categoryExists = data.categories.some(c => c.id === article.categoryId);
    if (!categoryExists) {
      throw new Error('指定的分类不存在');
    }

    // 生成唯一 ID
    const newArticle = {
      id: Date.now().toString(),
      title: article.title,
      url: article.url,
      description: article.description || '',
      categoryId: article.categoryId,
      createdAt: new Date().toISOString(),
    };

    data.articles.push(newArticle);
    await this.saveData(data, sha);
    
    return newArticle;
  }

  /**
   * 更新文章
   * @param {string} id - 文章 ID
   * @param {Object} updates - 要更新的字段
   * @returns {Promise<Object>} 更新后的文章
   */
  async updateArticle(id, updates) {
    const { data, sha } = await this.getData();
    
    const index = data.articles.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('文章不存在');
    }

    // 如果更新了分类,验证新分类是否存在
    if (updates.categoryId) {
      const categoryExists = data.categories.some(c => c.id === updates.categoryId);
      if (!categoryExists) {
        throw new Error('指定的分类不存在');
      }
    }

    // 更新文章信息
    data.articles[index] = {
      ...data.articles[index],
      ...updates,
      id, // 确保 ID 不被修改
      updatedAt: new Date().toISOString(),
    };

    await this.saveData(data, sha);
    return data.articles[index];
  }

  /**
   * 删除文章
   * @param {string} id - 文章 ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteArticle(id) {
    const { data, sha } = await this.getData();
    
    const index = data.articles.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('文章不存在');
    }

    // 删除文章
    data.articles.splice(index, 1);
    await this.saveData(data, sha);
    
    return true;
  }
}

// 导出服务实例
export default new GitHubService();
