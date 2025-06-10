const express = require('express');
const path = require('path');
const fs = require('fs');
const { processMusicList } = require('./music_get');
const { getMusicUrl } = require('./music_api');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 设置安全头部和缓存控制中间件
 * 添加必要的安全响应头和缓存策略以提高应用安全性和性能
 */
app.use((req, res, next) => {
  // 防止MIME类型嗅探攻击
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // 防止点击劫持攻击
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 启用XSS保护
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 强制使用HTTPS（仅在生产环境中启用）
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // 控制引用者信息
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 内容安全策略（允许音频和图片从外部源加载）
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https: http:; " +
    "media-src 'self' https: http: blob:; " +
    "connect-src 'self' https: http:;"
  );
  
  // 获取请求URL用于后续处理
  const url = req.url;
  
  // 设置正确的Content-Type头部
  if (url.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  } else if (url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (url.endsWith('.html') || url.endsWith('.htm')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  } else if (/\.(jpg|jpeg)$/i.test(url)) {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (url.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png');
  } else if (/\.(woff|woff2)$/i.test(url)) {
    res.setHeader('Content-Type', 'font/woff2');
  }
  
  // 设置缓存控制策略
  const isStaticAsset = /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(url);
  const isAudioFile = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(url);
  
  if (isStaticAsset) {
    // 静态资源缓存1年，使用Cache-Control而不是Expires
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (isAudioFile) {
    // 音频文件缓存1天
    res.setHeader('Cache-Control', 'public, max-age=86400');
  } else {
    // HTML页面和API响应不缓存
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }
  
  next();
});

// 设置静态文件目录
// 将 public 目录下的文件（如 CSS, JS, 图片）暴露给客户端访问
// 为静态文件添加安全头部
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    // 防止MIME类型嗅探攻击
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 防止点击劫持攻击
    res.setHeader('X-Frame-Options', 'DENY');
    // 启用XSS保护
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
}));

// 设置音乐文件目录
// 将 music 目录下的音乐文件暴露给客户端访问
// 为音乐文件添加安全头部
app.use('/music', express.static(path.join(__dirname, 'music'), {
  setHeaders: (res, path) => {
    // 防止MIME类型嗅探攻击
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 防止点击劫持攻击
    res.setHeader('X-Frame-Options', 'DENY');
    // 启用XSS保护
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
}));

// 设置视图引擎为 EJS
// Express 将使用 EJS 来渲染位于 views 目录下的模板文件
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// API路由：获取音乐播放链接
app.get('/api/music/url', async (req, res) => {
  try {
    // 设置API响应的安全头部
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { trackId, source = 'netease', br = 320 } = req.query;
    
    if (!trackId) {
      return res.status(400).json({ error: '缺少trackId参数' });
    }
    
    console.log(`获取音乐链接请求: trackId=${trackId}, source=${source}, br=${br}`);
    
    const result = await getMusicUrl(trackId, source, br);
    
    if (result && result.url) {
      res.json(result);
    } else {
      res.status(404).json({ error: '无法获取播放链接' });
    }
  } catch (error) {
    console.error('获取音乐链接失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 读取音乐数据
app.get('/', async (req, res) => {
  try {
    const musicDataPath = path.join(__dirname, 'music_data.json');
    
    // 检查music_data.json是否存在
    if (!fs.existsSync(musicDataPath)) {
      return res.status(500).send('音乐数据文件不存在，请先运行数据处理程序');
    }
    
    // 读取预处理的音乐数据
    const musicDataContent = fs.readFileSync(musicDataPath, 'utf8');
    const musicData = JSON.parse(musicDataContent);
    
    res.render('index', { title: '音乐播放器', songs: musicData.songs });
  } catch (error) {
    console.error('读取音乐数据失败:', error);
    res.status(500).send('服务器错误');
  }
});

// 启动函数
async function startServer() {
  try {
    console.log('正在初始化音乐数据...');
    
    const musicListPath = path.join(__dirname, 'music_list.json');
    const musicDataPath = path.join(__dirname, 'music_data.json');
    
    // 检查是否需要重新处理数据
    let needProcess = true;
    
    if (fs.existsSync(musicDataPath)) {
      try {
        const musicDataContent = fs.readFileSync(musicDataPath, 'utf8');
        const musicData = JSON.parse(musicDataContent);
        
        // 检查数据是否是今天处理的（可选：可以设置更长的缓存时间）
        const processedDate = new Date(musicData.processedAt);
        const today = new Date();
        const isToday = processedDate.toDateString() === today.toDateString();
        
        if (isToday && musicData.songs && musicData.songs.length > 0) {
          console.log('使用现有的音乐数据（今日已处理）');
          needProcess = false;
        }
      } catch (error) {
        console.log('现有数据文件损坏，将重新处理');
      }
    }
    
    if (needProcess) {
      console.log('开始处理音乐数据...');
      await processMusicList(musicListPath, musicDataPath);
      console.log('音乐数据处理完成');
    }
    
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();