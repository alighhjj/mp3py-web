const fs = require('fs');
const path = require('path');
const { searchMusic, getAlbumCover } = require('./music_api');

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
 * 追加写入单首歌曲数据到文件（只有成功获取数据时才写入）
 * @param {string} outputPath - 输出文件路径
 * @param {object} songData - 歌曲数据
 * @param {number} index - 歌曲索引
 * @param {number} total - 总歌曲数
 * @returns {boolean} 是否成功写入
 */
function appendSongDataSync(outputPath, songData, index, total) {
  try {
    // 验证歌曲数据是否有效
    if (songData.error) {
      console.log(`⚠️ 跳过写入无效数据: ${songData.title} - ${songData.artist}`);
      return false;
    }
    
    let existingData = { processedAt: new Date().toISOString(), totalSongs: 0, songs: [] };
    
    // 如果文件存在，读取现有数据
    if (fs.existsSync(outputPath)) {
      const fileContent = fs.readFileSync(outputPath, 'utf8');
      existingData = JSON.parse(fileContent);
    }
    
    // 检查是否已存在相同的歌曲（基于trackId和title）
    const isDuplicate = existingData.songs.some(song => 
      (song.trackId && song.trackId === songData.trackId) || 
      (song.title === songData.title && song.artist === songData.artist)
    );
    
    if (isDuplicate) {
      console.log(`⚠️ 歌曲已存在，跳过写入: ${songData.title} - ${songData.artist}`);
      return false;
    }
    
    // 追加新歌曲数据
    existingData.songs.push(songData);
    existingData.totalSongs = existingData.songs.length;
    existingData.lastUpdated = new Date().toISOString();
    existingData.progress = `${existingData.totalSongs}/${total} (有效歌曲)`;
    
    // 同步写入文件
    fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log(`✓ 已追加第${existingData.totalSongs}首有效歌曲数据到文件: ${songData.title}`);
    
    return true;
    
  } catch (error) {
    console.error(`追加歌曲数据失败:`, error.message);
    return false;
  }
}

/**
 * 批量处理音乐列表并实时保存到music_data.json（带防护策略）
 * @param {string} musicListPath - music_list.json文件路径
 * @param {string} outputPath - 输出文件路径
 * @returns {Promise} 处理结果
 */
async function processMusicList(musicListPath, outputPath) {
  try {
    console.log('🎵 开始处理音乐列表（带防护模式）...');
    
    // 读取music_list.json文件
    const musicListData = fs.readFileSync(musicListPath, 'utf8');
    const musicList = JSON.parse(musicListData);
    
    const totalSongs = musicList.classic_songs.length;
    console.log(`📋 共需处理 ${totalSongs} 首歌曲`);
    
    // 初始化输出文件 - 检查是否存在现有数据
    let initialData;
    if (fs.existsSync(outputPath)) {
      // 如果文件存在，读取现有数据并保留
      console.log('📂 检测到现有数据文件，读取并保留现有歌曲数据...');
      try {
        const existingContent = fs.readFileSync(outputPath, 'utf8');
        initialData = JSON.parse(existingContent);
        console.log(`📊 现有数据: ${initialData.songs ? initialData.songs.length : 0} 首歌曲`);
        
        // 更新处理时间和状态，但保留现有歌曲数据
        initialData.processedAt = new Date().toISOString();
        initialData.status = 'processing';
        initialData.lastUpdated = new Date().toISOString();
        
        // 确保数据结构完整
        if (!initialData.songs) {
          initialData.songs = [];
        }
        if (!initialData.totalSongs) {
          initialData.totalSongs = initialData.songs.length;
        }
      } catch (error) {
        console.log('⚠️ 读取现有数据失败，创建新的数据结构...');
        initialData = {
          processedAt: new Date().toISOString(),
          totalSongs: 0,
          songs: [],
          status: 'processing'
        };
      }
    } else {
      // 如果文件不存在，创建新的数据结构
      console.log('📝 创建新的数据文件...');
      initialData = {
        processedAt: new Date().toISOString(),
        totalSongs: 0,
        songs: [],
        status: 'processing'
      };
    }
    
    // 写入初始化后的数据
    fs.writeFileSync(outputPath, JSON.stringify(initialData, null, 2), 'utf8');
    console.log(`✓ 数据文件初始化完成，当前包含 ${initialData.totalSongs} 首歌曲`);
    
    // 处理经典歌曲列表
    for (let i = 0; i < totalSongs; i++) {
      const songInfo = musicList.classic_songs[i];
      console.log(`\n🎶 [${i + 1}/${totalSongs}] 正在处理: ${songInfo.song} - ${songInfo.artist}`);
      
      try {
        // 搜索歌曲信息
        const searchKeyword = `${songInfo.artist} ${songInfo.song}`;
        console.log(`🔍 搜索关键词: ${searchKeyword}`);
        const searchResult = await searchMusic(searchKeyword);
        
        if (searchResult && searchResult.length > 0) {
          const track = searchResult[0];
          console.log(`✓ 找到歌曲: ${track.name}`);
          
          // 获取专辑封面
          let coverUrl = '/icons/icon-192x192.png'; // 默认封面
          try {
            if (track.pic_id) {
              console.log(`🖼️ 获取专辑封面...`);
              coverUrl = await getAlbumCover(track.pic_id, track.source);
            }
          } catch (coverError) {
            console.log(`⚠️ 获取封面失败: ${songInfo.song} - ${songInfo.artist}`);
          }
          
          const songData = {
            title: track.name || songInfo.song,
            artist: Array.isArray(track.artist) ? track.artist.join(', ') : (track.artist || songInfo.artist),
            duration: '--:--', // API通常不返回时长信息
            src: null, // 不获取播放链接，设置为null
            cover: coverUrl,
            trackId: track.id,
            source: track.source,
            processedAt: new Date().toISOString() // 添加处理时间戳
          };
          
          // 追加写入歌曲数据
          const writeSuccess = appendSongDataSync(outputPath, songData, i, totalSongs);
          if (writeSuccess) {
            console.log(`✅ 成功处理并保存: ${songData.title} - ${songData.artist}`);
          }
          
        } else {
          console.log(`❌ API搜索失败，跳过写入: ${songInfo.song} - ${songInfo.artist}`);
          // API搜索失败时不写入数据，只记录日志
        }
      } catch (error) {
        console.error(`❌ 处理歌曲失败，跳过写入: ${songInfo.song} - ${songInfo.artist}`, error.message);
        // 处理失败时不写入数据，只记录错误日志
      }
      
      // 添加随机延迟避免API请求过于频繁
      if (i < totalSongs - 1) {
        const delay = getRandomDelay(3000, 8000); // 3-8秒随机延迟
        console.log(`⏱️ 等待 ${Math.round(delay/1000)} 秒后继续...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // 更新最终状态
    const finalData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    finalData.status = 'completed';
    finalData.completedAt = new Date().toISOString();
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf8');
    
    console.log(`\n🎉 成功处理 ${finalData.totalSongs} 首歌曲，数据已保存到 ${outputPath}`);
    
    return finalData;
    
  } catch (error) {
    console.error('❌ 处理音乐列表时发生错误:', error);
    throw error;
  }
}

/**
 * 主函数 - 当直接运行此文件时执行（带防护模式）
 */
async function main() {
  const musicListPath = path.join(__dirname, 'music_list_api.json');
  const outputPath = path.join(__dirname, 'music_data.json');
  
  console.log('🚀 启动音乐数据处理程序（防护模式）');
  console.log('📁 输入文件:', musicListPath);
  console.log('📁 输出文件:', outputPath);
  console.log('🛡️ 防护策略: 随机延迟、用户代理伪装、请求头模拟');
  console.log('💾 写入策略: 同步获取同步写入');
  console.log('=' .repeat(60));
  
  try {
    const startTime = Date.now();
    const result = await processMusicList(musicListPath, outputPath);
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 音乐数据处理完成！');
    console.log(`⏱️ 总耗时: ${duration} 秒`);
    console.log(`📊 处理歌曲数: ${result.totalSongs}`);
    console.log(`📁 输出文件: ${outputPath}`);
    console.log('✅ 程序执行成功');
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 处理失败:', error.message);
    console.error('🔧 请检查网络连接和API服务状态');
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main();
}

// 导出函数供其他模块使用
module.exports = {
  processMusicList,
  appendSongDataSync
};