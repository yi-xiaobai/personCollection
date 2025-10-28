module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: '方法不允许',
      message: '健康检查只支持GET请求' 
    });
  }
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Article Collection Backend - Vercel',
    version: '1.0.0'
  });
};
