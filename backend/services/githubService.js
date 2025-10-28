const axios = require('axios');

class GitHubService {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.branch = process.env.GITHUB_BRANCH || 'master';
    this.dataFile = 'data/articles.json';
    
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Article-Collection-System'
      }
    });
  }

  async getFileContent() {
    try {
      const response = await this.api.get(
        `/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`,
        { params: { ref: this.branch } }
      );
      
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      return {
        data: JSON.parse(content),
        sha: response.data.sha
      };
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('数据文件不存在，将创建新文件');
        return { 
          data: { categories: [], articles: [] }, 
          sha: null 
        };
      }
      console.error('获取GitHub文件失败:', error.message);
      throw new Error('获取数据失败');
    }
  }

  async updateFileContent(data, message = '更新数据') {
    try {
      const currentFile = await this.getFileContent();
      const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
      
      const payload = {
        message,
        content,
        branch: this.branch
      };
      
      if (currentFile.sha) {
        payload.sha = currentFile.sha;
      }
      
      const response = await this.api.put(
        `/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`,
        payload
      );
      
      console.log(`GitHub文件更新成功: ${message}`);
      return response.data;
    } catch (error) {
      console.error('更新GitHub文件失败:', error.message);
      throw new Error('保存数据失败');
    }
  }

  async getAllCategories() {
    const result = await this.getFileContent();
    return result.data.categories || [];
  }

  async getAllArticles() {
    const result = await this.getFileContent();
    return result.data.articles || [];
  }

  async addCategory(categoryData) {
    const { data } = await this.getFileContent();
    const newCategory = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    data.categories.push(newCategory);
    await this.updateFileContent(data, `添加分类: ${newCategory.name}`);
    return newCategory;
  }

  async updateCategory(id, categoryData) {
    const { data } = await this.getFileContent();
    const index = data.categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('分类不存在');
    }
    
    data.categories[index] = {
      ...data.categories[index],
      ...categoryData,
      id,
      updatedAt: new Date().toISOString()
    };
    
    await this.updateFileContent(data, `更新分类: ${data.categories[index].name}`);
    return data.categories[index];
  }

  async deleteCategory(id) {
    const { data } = await this.getFileContent();
    const index = data.categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('分类不存在');
    }
    
    const deletedCategory = data.categories.splice(index, 1)[0];
    data.articles = data.articles.filter(a => a.categoryId !== id);
    
    await this.updateFileContent(data, `删除分类: ${deletedCategory.name}`);
    return deletedCategory;
  }

  async addArticle(articleData) {
    const { data } = await this.getFileContent();
    
    const categoryExists = data.categories.some(c => c.id === articleData.categoryId);
    if (!categoryExists) {
      throw new Error('指定的分类不存在');
    }
    
    const newArticle = {
      ...articleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    data.articles.push(newArticle);
    await this.updateFileContent(data, `添加文章: ${newArticle.title}`);
    return newArticle;
  }

  async updateArticle(id, articleData) {
    const { data } = await this.getFileContent();
    const index = data.articles.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('文章不存在');
    }
    
    if (articleData.categoryId) {
      const categoryExists = data.categories.some(c => c.id === articleData.categoryId);
      if (!categoryExists) {
        throw new Error('指定的分类不存在');
      }
    }
    
    data.articles[index] = {
      ...data.articles[index],
      ...articleData,
      id,
      updatedAt: new Date().toISOString()
    };
    
    await this.updateFileContent(data, `更新文章: ${data.articles[index].title}`);
    return data.articles[index];
  }

  async deleteArticle(id) {
    const { data } = await this.getFileContent();
    const index = data.articles.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('文章不存在');
    }
    
    const deletedArticle = data.articles.splice(index, 1)[0];
    await this.updateFileContent(data, `删除文章: ${deletedArticle.title}`);
    return deletedArticle;
  }
}

module.exports = new GitHubService();
