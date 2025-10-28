<template>
  <div class="home-container">
    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="32" color="#409eff"><Collection /></el-icon>
          <h1>文章链接收藏</h1>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="showCategoryDialog">
            新建分类
          </el-button>
          <el-button type="primary" :icon="Plus" @click="showArticleDialog">
            添加文章
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 左侧分类列表 -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <h3>文章分类</h3>
            <el-badge :value="categories.length" class="badge" type="primary" />
          </div>
          
          <div class="category-list">
            <!-- 全部文章 -->
            <div 
              class="category-item"
              :class="{ active: selectedCategoryId === null }"
              @click="selectCategory(null)"
            >
              <el-icon><Folder /></el-icon>
              <span class="category-name">全部文章</span>
              <span class="article-count">{{ totalArticles }}</span>
            </div>

            <!-- 分类列表 -->
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategoryId === category.id }"
              @click="selectCategory(category.id)"
            >
              <el-icon><FolderOpened /></el-icon>
              <span class="category-name">{{ category.name }}</span>
              <span class="article-count">{{ getCategoryArticleCount(category.id) }}</span>
              <div class="category-actions">
                <el-icon @click.stop="editCategory(category)"><Edit /></el-icon>
                <el-icon @click.stop="confirmDeleteCategory(category)"><Delete /></el-icon>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="categories.length === 0" class="empty-state">
              <el-icon :size="48" color="#c0c4cc"><FolderOpened /></el-icon>
              <p>暂无分类</p>
              <el-button text type="primary" @click="showCategoryDialog">
                创建第一个分类
              </el-button>
            </div>
          </div>
        </aside>

        <!-- 右侧文章列表 -->
        <section class="article-section">
          <div class="section-header">
            <h3>
              {{ selectedCategoryId ? getCurrentCategoryName() : '全部文章' }}
            </h3>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文章标题或描述..."
              :prefix-icon="Search"
              clearable
              class="search-input"
            />
          </div>

          <!-- 文章列表 -->
          <div v-loading="loading" class="article-list">
            <div
              v-for="article in filteredArticles"
              :key="article.id"
              class="article-card"
            >
              <div class="article-header">
                <a :href="article.url" target="_blank" class="article-title">
                  {{ article.title }}
                  <el-icon><Link /></el-icon>
                </a>
                <div class="article-actions">
                  <el-button text :icon="Edit" @click="editArticle(article)">
                    编辑
                  </el-button>
                  <el-button text type="danger" :icon="Delete" @click="confirmDeleteArticle(article)">
                    删除
                  </el-button>
                </div>
              </div>
              
              <p v-if="article.description" class="article-description">
                {{ article.description }}
              </p>
              
              <div class="article-footer">
                <el-tag size="small" type="info">
                  {{ getCategoryName(article.categoryId) }}
                </el-tag>
                <span class="article-date">
                  {{ formatDate(article.createdAt) }}
                </span>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredArticles.length === 0 && !loading" class="empty-state">
              <el-icon :size="64" color="#c0c4cc"><Document /></el-icon>
              <p>{{ searchKeyword ? '没有找到相关文章' : '暂无文章' }}</p>
              <el-button v-if="!searchKeyword" type="primary" @click="showArticleDialog">
                添加第一篇文章
              </el-button>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 分类对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryForm.id ? '编辑分类' : '新建分类'"
      width="500px"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称" required>
          <el-input
            v-model="categoryForm.name"
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述(可选)"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 文章对话框 -->
    <el-dialog
      v-model="articleDialogVisible"
      :title="articleForm.id ? '编辑文章' : '添加文章'"
      width="600px"
    >
      <el-form :model="articleForm" label-width="80px">
        <el-form-item label="文章标题" required>
          <el-input
            v-model="articleForm.title"
            placeholder="请输入文章标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="文章链接" required>
          <el-input
            v-model="articleForm.url"
            placeholder="请输入文章链接 (https://...)"
          />
        </el-form-item>
        <el-form-item label="所属分类" required>
          <el-select
            v-model="articleForm.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文章描述">
          <el-input
            v-model="articleForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入文章描述(可选)"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveArticle" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus, Edit, Delete, Search, Link, Document,
  Folder, FolderOpened, Collection
} from '@element-plus/icons-vue';
import {
  getCategories, createCategory, updateCategory, deleteCategory
} from '@/api/category.js';
import {
  getArticles, createArticle, updateArticle, deleteArticle
} from '@/api/article.js';

// 数据状态
const categories = ref([]);
const articles = ref([]);
const selectedCategoryId = ref(null);
const searchKeyword = ref('');
const loading = ref(false);
const saving = ref(false);

// 对话框状态
const categoryDialogVisible = ref(false);
const articleDialogVisible = ref(false);

// 表单数据
const categoryForm = ref({
  id: null,
  name: '',
  description: '',
});

const articleForm = ref({
  id: null,
  title: '',
  url: '',
  description: '',
  categoryId: '',
});

// 计算属性
const totalArticles = computed(() => articles.value.length);

const filteredArticles = computed(() => {
  let result = articles.value;

  // 按分类筛选
  if (selectedCategoryId.value) {
    result = result.filter(a => a.categoryId === selectedCategoryId.value);
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(a =>
      a.title.toLowerCase().includes(keyword) ||
      (a.description && a.description.toLowerCase().includes(keyword))
    );
  }

  return result;
});

// 方法
function getCategoryArticleCount(categoryId) {
  return articles.value.filter(a => a.categoryId === categoryId).length;
}

function getCategoryName(categoryId) {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : '未分类';
}

function getCurrentCategoryName() {
  const category = categories.value.find(c => c.id === selectedCategoryId.value);
  return category ? category.name : '全部文章';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function selectCategory(categoryId) {
  selectedCategoryId.value = categoryId;
}

// 加载数据
async function loadCategories() {
  try {
    const res = await getCategories();
    categories.value = res.data;
  } catch (error) {
    console.error('加载分类失败:', error);
  }
}

async function loadArticles() {
  try {
    loading.value = true;
    const res = await getArticles();
    articles.value = res.data;
  } catch (error) {
    console.error('加载文章失败:', error);
  } finally {
    loading.value = false;
  }
}

// 分类操作
function showCategoryDialog() {
  categoryForm.value = {
    id: null,
    name: '',
    description: '',
  };
  categoryDialogVisible.value = true;
}

function editCategory(category) {
  categoryForm.value = {
    id: category.id,
    name: category.name,
    description: category.description || '',
  };
  categoryDialogVisible.value = true;
}

async function saveCategory() {
  if (!categoryForm.value.name.trim()) {
    ElMessage.warning('请输入分类名称');
    return;
  }

  try {
    saving.value = true;
    if (categoryForm.value.id) {
      await updateCategory(categoryForm.value.id, {
        name: categoryForm.value.name,
        description: categoryForm.value.description,
      });
      ElMessage.success('分类更新成功');
    } else {
      await createCategory({
        name: categoryForm.value.name,
        description: categoryForm.value.description,
      });
      ElMessage.success('分类创建成功');
    }
    categoryDialogVisible.value = false;
    await loadCategories();
  } catch (error) {
    console.error('保存分类失败:', error);
  } finally {
    saving.value = false;
  }
}

function confirmDeleteCategory(category) {
  const count = getCategoryArticleCount(category.id);
  const message = count > 0
    ? `确定要删除分类"${category.name}"吗? 该分类下有 ${count} 篇文章,删除后这些文章也会被删除。`
    : `确定要删除分类"${category.name}"吗?`;

  ElMessageBox.confirm(message, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteCategory(category.id);
      ElMessage.success('分类删除成功');
      if (selectedCategoryId.value === category.id) {
        selectedCategoryId.value = null;
      }
      await loadCategories();
      await loadArticles();
    } catch (error) {
      console.error('删除分类失败:', error);
    }
  }).catch(() => {});
}

// 文章操作
function showArticleDialog() {
  if (categories.value.length === 0) {
    ElMessage.warning('请先创建分类');
    return;
  }
  articleForm.value = {
    id: null,
    title: '',
    url: '',
    description: '',
    categoryId: selectedCategoryId.value || categories.value[0].id,
  };
  articleDialogVisible.value = true;
}

function editArticle(article) {
  articleForm.value = {
    id: article.id,
    title: article.title,
    url: article.url,
    description: article.description || '',
    categoryId: article.categoryId,
  };
  articleDialogVisible.value = true;
}

async function saveArticle() {
  if (!articleForm.value.title.trim()) {
    ElMessage.warning('请输入文章标题');
    return;
  }
  if (!articleForm.value.url.trim()) {
    ElMessage.warning('请输入文章链接');
    return;
  }
  if (!articleForm.value.categoryId) {
    ElMessage.warning('请选择文章分类');
    return;
  }

  try {
    saving.value = true;
    if (articleForm.value.id) {
      await updateArticle(articleForm.value.id, {
        title: articleForm.value.title,
        url: articleForm.value.url,
        description: articleForm.value.description,
        categoryId: articleForm.value.categoryId,
      });
      ElMessage.success('文章更新成功');
    } else {
      await createArticle({
        title: articleForm.value.title,
        url: articleForm.value.url,
        description: articleForm.value.description,
        categoryId: articleForm.value.categoryId,
      });
      ElMessage.success('文章添加成功');
    }
    articleDialogVisible.value = false;
    await loadArticles();
  } catch (error) {
    console.error('保存文章失败:', error);
  } finally {
    saving.value = false;
  }
}

function confirmDeleteArticle(article) {
  ElMessageBox.confirm(
    `确定要删除文章"${article.title}"吗?`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteArticle(article.id);
      ElMessage.success('文章删除成功');
      await loadArticles();
    } catch (error) {
      console.error('删除文章失败:', error);
    }
  }).catch(() => {});
}

// 初始化
onMounted(async () => {
  await loadCategories();
  await loadArticles();
});
</script>

<style scoped>
.home-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部标题栏 */
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  overflow: hidden;
  padding: 30px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  gap: 24px;
}

/* 左侧边栏 */
.sidebar {
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.category-list {
  flex: 1;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-item.active {
  background: #ecf5ff;
  color: #409eff;
}

.category-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-count {
  font-size: 12px;
  color: #909399;
  background: #f4f4f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.category-item.active .article-count {
  background: #409eff;
  color: white;
}

.category-actions {
  display: none;
  gap: 8px;
}

.category-item:hover .category-actions {
  display: flex;
}

.category-actions .el-icon {
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;
}

.category-actions .el-icon:hover {
  color: #409eff;
}

/* 右侧文章区 */
.article-section {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.search-input {
  width: 300px;
}

.article-list {
  flex: 1;
  overflow-y: auto;
}

.article-card {
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.article-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s;
}

.article-title:hover {
  color: #409eff;
}

.article-actions {
  display: flex;
  gap: 8px;
}

.article-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-date {
  font-size: 12px;
  color: #909399;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state p {
  margin: 16px 0;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .search-input {
    width: 200px;
  }
}
</style>
