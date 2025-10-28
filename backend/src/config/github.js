import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// GitHub 配置
export const githubConfig = {
  token: process.env.GITHUB_TOKEN,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
  dataPath: process.env.GITHUB_DATA_PATH || 'data.json',
};

// 验证配置是否完整
export function validateConfig() {
  const required = ['token', 'owner', 'repo'];
  const missing = required.filter(key => !githubConfig[key]);
  
  if (missing.length > 0) {
    throw new Error(`缺少必要的环境变量: ${missing.join(', ')}`);
  }
  
  return true;
}
