const https = require('https');

/**
 * 随机用户代理列表
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

/**
 * 获取随机用户代理
 * @returns {string} 随机用户代理字符串
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * 获取随机延迟时间（毫秒）
 * @param {number} min - 最小延迟时间
 * @param {number} max - 最大延迟时间
 * @returns {number} 随机延迟时间
 */
function getRandomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 创建简化的HTTP请求选项
 * @param {string} url - 请求URL
 * @returns {object} 请求选项
 */
function createSecureRequestOptions(url) {
  const urlObj = new URL(url);
  return {
    hostname: urlObj.hostname,
    port: urlObj.port || 443,
    path: urlObj.pathname + urlObj.search,
    method: 'GET',
    headers: {
      'User-Agent': 'curl/7.68.0',
      'Accept': '*/*'
    },
    timeout: 15000
  };
}

/**
 * 调用音乐API获取歌曲信息（带重试机制和防护策略）
 * @param {string} keyword - 搜索关键字
 * @param {string} source - 音乐源，默认为netease
 * @param {number} retries - 重试次数，默认为1
 * @returns {Promise} 搜索结果
 */
function searchMusic(keyword, source = 'netease', retries = 1) {
  return new Promise((resolve, reject) => {
    const url = `https://music-api.gdstudio.xyz/api.php?types=search&source=${source}&name=${encodeURIComponent(keyword)}&count=1&pages=1`;
    
    const makeRequest = (attempt) => {
      // 添加随机延迟，避免被识别为机器人
      const delay = attempt > 0 ? getRandomDelay(2000, 5000) : 0;
      
      setTimeout(() => {
        const options = createSecureRequestOptions(url);
        
        const request = https.request(options, (response) => {
          let data = '';
          
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          response.on('end', () => {
            try {
              console.log(`原始响应数据: ${data.substring(0, 200)}...`);
              const result = JSON.parse(data);
              console.log(`✓ 搜索成功: ${keyword}`);
              resolve(result);
            } catch (error) {
              console.log(`JSON解析失败，原始数据: ${data}`);
              if (attempt < retries) {
                console.log(`搜索API解析失败，重试第${attempt + 1}次: ${keyword}`);
                makeRequest(attempt + 1);
              } else {
                reject(error);
              }
            }
          });
        });
        
        request.on('error', (error) => {
          if (attempt < retries) {
            console.log(`搜索API请求失败，重试第${attempt + 1}次: ${keyword}`);
            makeRequest(attempt + 1);
          } else {
            reject(error);
          }
        });
        
        request.on('timeout', () => {
          request.destroy();
          if (attempt < retries) {
            console.log(`搜索API超时，重试第${attempt + 1}次: ${keyword}`);
            makeRequest(attempt + 1);
          } else {
            reject(new Error('Request timeout'));
          }
        });
        
        request.end();
      }, delay);
    };
    
    makeRequest(0);
  });
}

/**
 * 获取音乐播放链接（带重试机制和防护策略）
 * @param {string} trackId - 曲目ID
 * @param {string} source - 音乐源
 * @param {number} retries - 重试次数，默认为1
 * @returns {Promise} 音乐链接信息
 */
function getMusicUrl(trackId, source = 'netease', retries = 1) {
  return new Promise((resolve, reject) => {
    const url = `https://music-api.gdstudio.xyz/api.php?types=url&source=${source}&id=${trackId}&br=320`;
    
    const makeRequest = (attempt) => {
      // 添加随机延迟，避免被识别为机器人
      const delay = attempt > 0 ? getRandomDelay(2500, 6000) : getRandomDelay(500, 1500);
      
      setTimeout(() => {
        const options = createSecureRequestOptions(url);
        
        const request = https.request(options, (response) => {
          let data = '';
          
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          response.on('end', () => {
            try {
              const result = JSON.parse(data);
              console.log(`✓ 获取播放链接成功: ${trackId}`);
              resolve(result);
            } catch (error) {
              if (attempt < retries) {
                console.log(`获取播放链接失败，重试第${attempt + 1}次: ${trackId}`);
                makeRequest(attempt + 1);
              } else {
                reject(error);
              }
            }
          });
        });
        
        request.on('error', (error) => {
          if (attempt < retries) {
            console.log(`播放链接API请求失败，重试第${attempt + 1}次: ${trackId}`);
            makeRequest(attempt + 1);
          } else {
            reject(error);
          }
        });
        
        request.on('timeout', () => {
          request.destroy();
          if (attempt < retries) {
            console.log(`播放链接API超时，重试第${attempt + 1}次: ${trackId}`);
            makeRequest(attempt + 1);
          } else {
            reject(new Error('Request timeout'));
          }
        });
        
        request.end();
      }, delay);
    };
    
    makeRequest(0);
  });
}

/**
 * 获取专辑封面（带重试机制和防护策略）
 * @param {string} picId - 专辑图ID
 * @param {string} source - 音乐源
 * @param {number} retries - 重试次数，默认为1
 * @returns {Promise} 专辑封面链接
 */
function getAlbumCover(picId, source = 'netease', retries = 1) {
  return new Promise((resolve, reject) => {
    const url = `https://music-api.gdstudio.xyz/api.php?types=pic&source=${source}&id=${picId}&size=500`;
    
    const makeRequest = (attempt) => {
      // 添加随机延迟，避免被识别为机器人
      const delay = attempt > 0 ? getRandomDelay(1500, 4000) : getRandomDelay(300, 800);
      
      setTimeout(() => {
        const options = createSecureRequestOptions(url);
        
        const request = https.request(options, (response) => {
          let data = '';
          
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          response.on('end', () => {
            try {
              const result = JSON.parse(data);
              console.log(`✓ 获取封面成功: ${picId}`);
              resolve(result.url || '/icons/icon-192x192.png');
            } catch (error) {
              if (attempt < retries) {
                console.log(`获取封面失败，重试第${attempt + 1}次: ${picId}`);
                makeRequest(attempt + 1);
              } else {
                resolve('/icons/icon-192x192.png'); // 封面获取失败时返回默认图片
              }
            }
          });
        });
        
        request.on('error', (error) => {
          if (attempt < retries) {
            console.log(`封面API请求失败，重试第${attempt + 1}次: ${picId}`);
            makeRequest(attempt + 1);
          } else {
            resolve('/icons/icon-192x192.png'); // 封面获取失败时返回默认图片
          }
        });
        
        request.on('timeout', () => {
          request.destroy();
          if (attempt < retries) {
            console.log(`封面API超时，重试第${attempt + 1}次: ${picId}`);
            makeRequest(attempt + 1);
          } else {
            resolve('/icons/icon-192x192.png'); // 封面获取失败时返回默认图片
          }
        });
        
        request.end();
      }, delay);
    };
    
    makeRequest(0);
  });
}

// 导出函数供其他模块使用
module.exports = {
  searchMusic,
  getMusicUrl,
  getAlbumCover
};