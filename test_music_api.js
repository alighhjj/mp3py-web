// 测试music_get.js模块的功能
const { searchMusic, getMusicUrl, getAlbumCover } = require('./music_api');

/**
 * 测试搜索音乐功能
 */
async function testSearchMusic() {
  console.log('=== 测试搜索音乐功能 ===');
  try {
    const keyword = '十年';
    console.log(`搜索关键字: ${keyword}`);
    
    const result = await searchMusic(keyword);
    console.log('搜索结果:', JSON.stringify(result, null, 2));
    
    if (result && result.length > 0) {
      const track = result[0];
      console.log(`找到歌曲: ${track.name} - ${track.artist}`);
      console.log(`歌曲ID: ${track.id}`);
      console.log(`音乐源: ${track.source}`);
      return track;
    } else {
      console.log('未找到歌曲');
      return null;
    }
  } catch (error) {
    console.error('搜索音乐失败:', error.message);
    return null;
  }
}

/**
 * 测试获取音乐播放链接功能
 */
async function testGetMusicUrl(trackId, source) {
  console.log('\n=== 测试获取播放链接功能 ===');
  try {
    console.log(`曲目ID: ${trackId}`);
    console.log(`音乐源: ${source}`);
    
    const result = await getMusicUrl(trackId, source);
    console.log('播放链接结果:', JSON.stringify(result, null, 2));
    
    if (result && result.url) {
      console.log(`播放链接: ${result.url}`);
      return result.url;
    } else {
      console.log('未获取到播放链接');
      return null;
    }
  } catch (error) {
    console.error('获取播放链接失败:', error.message);
    return null;
  }
}

/**
 * 测试获取专辑封面功能
 */
async function testGetAlbumCover(picId, source) {
  console.log('\n=== 测试获取专辑封面功能 ===');
  try {
    console.log(`专辑图ID: ${picId}`);
    console.log(`音乐源: ${source}`);
    
    const coverUrl = await getAlbumCover(picId, source);
    console.log(`封面链接: ${coverUrl}`);
    return coverUrl;
  } catch (error) {
    console.error('获取专辑封面失败:', error.message);
    return null;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('开始测试music_get.js模块功能...');
  console.log('=' .repeat(50));
  
  // 测试搜索音乐
  const track = await testSearchMusic();
  
  if (track) {
    // 测试获取播放链接
    await testGetMusicUrl(track.id, track.source);
    
    // 测试获取专辑封面
    if (track.pic_id) {
      await testGetAlbumCover(track.pic_id, track.source);
    } else {
      console.log('\n该歌曲没有专辑图ID，跳过封面测试');
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('测试完成！');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSearchMusic,
  testGetMusicUrl,
  testGetAlbumCover,
  runTests
};