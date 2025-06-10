document.addEventListener('DOMContentLoaded', () => {
    const audio = new Audio();
    const playPauseBtn = document.querySelector('.player-controls .fa-play');
    const backwardBtn = document.querySelector('.player-controls .fa-backward');
    const forwardBtn = document.querySelector('.player-controls .fa-forward');
    const progressBar = document.querySelector('.playback-bar .progress');
    const currentTimeSpan = document.querySelector('.playback-bar .current-time');
    const totalTimeSpan = document.querySelector('.playback-bar .total-time');
    const volumeSlider = document.querySelector('.volume-control .volume-slider');
    const progressBarContainer = document.querySelector('.playback-bar .progress-bar'); // 获取进度条容器
    const seekThumb = document.querySelector('.playback-bar .seek-thumb'); // 获取拖动圆点
    const songItems = document.querySelectorAll('.song-item');
    const downloadButton = document.getElementById('download-button'); // 获取下载按钮

    let currentSongIndex = 0;
    let playlist = []; // 播放列表将从DOM中获取
    let isLoadingSong = false; // 防止重复加载
    
    /**
     * 实时获取音乐播放链接
     * @param {string} trackId - 曲目ID
     * @param {string} source - 音乐源
     * @param {number} bitrate - 音质
     * @returns {Promise<string>} 播放链接
     */
    async function getRealTimeMusicUrl(trackId, source = 'netease', bitrate = 320) {
        if (!trackId) {
            throw new Error('缺少trackId参数');
        }
        
        try {
            console.log(`正在实时获取播放链接: trackId=${trackId}, source=${source}, br=${bitrate}`);
            
            const response = await fetch(`/api/music/url?trackId=${trackId}&source=${source}&br=${bitrate}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && data.url) {
                console.log('实时获取播放链接成功:', data.url);
                return data.url;
            } else {
                throw new Error('API返回的数据中没有有效的播放链接');
            }
        } catch (error) {
            console.error('实时获取播放链接失败:', error);
            throw error;
        }
    }

    /**
     * 重新获取音乐播放链接（保留原有函数作为备用）
     * @param {Object} song - 歌曲对象
     * @param {number} index - 歌曲索引
     */
    async function refreshMusicUrl(song, index) {
        if (!song.trackId || !song.source) {
            console.error('缺少trackId或source信息，无法重新获取链接:', song.title);
            return;
        }
        
        try {
            console.log('正在重新获取播放链接:', song.title);
            
            // 添加随机延迟，避免频繁请求
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
            
            const url = await getRealTimeMusicUrl(song.trackId, song.source, 320);
            
            if (url) {
                // 更新歌曲的播放链接
                song.src = url;
                playlist[index].src = url;
                
                // 同时更新DOM中的数据
                const songItem = document.querySelectorAll('.song-item')[index];
                if (songItem) {
                    songItem.dataset.src = url;
                }
                
                console.log('播放链接更新成功:', song.title);
                
                // 重新设置音频源
                audio.src = song.src;
                
                // 如果这是当前选中的歌曲，尝试播放
                if (index === currentSongIndex) {
                    audio.play().then(() => {
                        playPauseBtn.classList.remove('fa-play');
                        playPauseBtn.classList.add('fa-pause');
                    }).catch(error => {
                        console.error('重新获取链接后播放失败:', error);
                    });
                }
            } else {
                console.error('无法获取有效的播放链接:', song.title);
            }
        } catch (error) {
            console.error('重新获取播放链接失败:', error);
        }
    }

    // 初始化播放器
    function initPlayer() {
        // 从DOM中获取歌曲数据
        songItems.forEach(item => {
            playlist.push({
                title: item.querySelector('.song-title').textContent,
                artist: item.querySelector('.song-artist').textContent, // 获取艺术家信息
                src: '', // 不再使用预存的src，每次都实时获取
                cover: item.dataset.cover || '/icons/icon-192x192.png', // 获取专辑封面
                trackId: item.dataset.trackId || '',
                source: item.dataset.source || 'netease'
            });
        });
        if (playlist.length > 0) {
            loadSong(currentSongIndex);
            updatePlaylistUI();
        }
    }

    // 加载歌曲
    async function loadSong(index) {
        if (isLoadingSong) {
            console.log('正在加载歌曲，请稍候...');
            return;
        }
        
        isLoadingSong = true;
        const song = playlist[index];
        
        try {
            // 先暂停当前播放，避免播放请求冲突
            audio.pause();
            // 重置播放按钮状态
            playPauseBtn.classList.remove('fa-pause');
            playPauseBtn.classList.add('fa-play');
            
            // 更新UI显示
            updateSongUI(song, index);
            
            // 检查是否有trackId
            if (!song.trackId) {
                console.error('歌曲缺少trackId，无法获取播放链接:', song.title);
                return;
            }
            
            console.log('开始实时获取播放链接:', song.title);
            
            // 实时获取播放链接
            const realTimeUrl = await getRealTimeMusicUrl(song.trackId, song.source, 320);
            
            if (realTimeUrl) {
                // 更新歌曲的播放链接
                song.src = realTimeUrl;
                playlist[index].src = realTimeUrl;
                
                // 设置新的音频源
                audio.src = song.src;
                
                // 添加音频加载错误处理
                audio.addEventListener('error', function handleAudioError(e) {
                    console.error('音频加载失败:', song.title, e);
                    console.error('错误详情:', e.target.error);
                    
                    // 检查是否是403错误或网络错误
                    if (e.target.error && (e.target.error.code === 4 || e.target.error.message.includes('403'))) {
                        console.warn('检测到403错误，可能是链接失效或访问受限，尝试重新获取');
                        // 尝试重新获取链接
                        refreshMusicUrl(song, index);
                    }
                    
                    // 移除事件监听器避免重复触发
                    audio.removeEventListener('error', handleAudioError);
                }, { once: true });
                
                console.log('歌曲加载完成:', song.title);
            } else {
                console.error('无法获取有效的播放链接:', song.title);
            }
            
        } catch (error) {
            console.error('加载歌曲失败:', song.title, error);
        } finally {
            isLoadingSong = false;
        }
    }
    
    /**
     * 更新歌曲UI显示
     * @param {Object} song - 歌曲对象
     * @param {number} index - 歌曲索引
     */
    function updateSongUI(song, index) {
        // 移除所有歌曲项的 active 类
        document.querySelectorAll('.song-item').forEach(item => item.classList.remove('active'));
        // 为当前歌曲项添加 active 类
        songItems[index].classList.add('active');
        
        // 更新播放器顶部的歌曲信息
        document.querySelector('.app-title').innerHTML = `<i class="fas fa-music"></i> ${song.title}`;
        // 更新 album-info 区域的歌曲标题和艺术家
        document.querySelector('.album-info .song-title-display').textContent = song.title;
        document.querySelector('.album-info .artist-display').textContent = `by ${song.artist}`;
        
        // 更新专辑封面
        const albumCover = document.getElementById('current-album-cover');
        if (albumCover && song.cover) {
            albumCover.src = song.cover;
            albumCover.onerror = function() {
                // 如果封面加载失败，使用默认图片
                this.src = '/icons/icon-192x192.png';
            };
        }
        
        // 更新媒体会话元数据（用于锁屏界面显示）
        updateMediaSession(song);
    }
    
    /**
     * 更新媒体会话元数据
     * @param {Object} song - 歌曲对象
     */
    function updateMediaSession(song) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: song.album || '未知专辑',
                artwork: [
                    {
                        src: song.cover || '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: song.cover || '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            });
            
            // 设置媒体会话动作处理器
            navigator.mediaSession.setActionHandler('play', () => {
                if (audio.paused) {
                    togglePlayPause();
                }
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                if (!audio.paused) {
                    togglePlayPause();
                }
            });
            
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                playPreviousSong();
            });
            
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                playNextSong();
            });
            
            // 设置播放位置状态（可选）
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime && audio.duration) {
                    audio.currentTime = details.seekTime;
                }
            });
            
            console.log('媒体会话元数据已更新:', song.title, 'by', song.artist);
        } else {
            console.log('当前浏览器不支持 Media Session API');
        }
    }

    // 播放/暂停功能
    function togglePlayPause() {
        if (audio.paused) {
            // 使用Promise处理播放请求
            audio.play().then(() => {
                playPauseBtn.classList.remove('fa-play');
                playPauseBtn.classList.add('fa-pause');
            }).catch(error => {
                console.error('播放失败:', error);
                // 如果播放失败，可能是链接失效，尝试重新获取
                const currentSong = playlist[currentSongIndex];
                if (currentSong && currentSong.trackId) {
                    console.log('播放失败，尝试重新获取链接...');
                    refreshMusicUrl(currentSong, currentSongIndex);
                }
            });
        } else {
            audio.pause();
            playPauseBtn.classList.remove('fa-pause');
            playPauseBtn.classList.add('fa-play');
        }
    }

    // 上一曲
    async function playPreviousSong() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        await loadSong(currentSongIndex);
        // 等待音频加载完成后再播放
        audio.addEventListener('canplaythrough', function playWhenReady() {
            audio.removeEventListener('canplaythrough', playWhenReady);
            audio.play().then(() => {
                // 播放成功后更新按钮状态
                playPauseBtn.classList.remove('fa-play');
                playPauseBtn.classList.add('fa-pause');
            }).catch(error => {
                console.error('播放上一曲失败:', error);
            });
        });
    }

    // 下一曲
    async function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        await loadSong(currentSongIndex);
        // 等待音频加载完成后再播放
        audio.addEventListener('canplaythrough', function playWhenReady() {
            audio.removeEventListener('canplaythrough', playWhenReady);
            audio.play().then(() => {
                // 播放成功后更新按钮状态
                playPauseBtn.classList.remove('fa-play');
                playPauseBtn.classList.add('fa-pause');
            }).catch(error => {
                console.error('播放下一曲失败:', error);
            });
        });
    }

    // 更新播放进度条和时间
    audio.addEventListener('timeupdate', () => {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
        
        // 更新媒体会话播放位置
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
                duration: audio.duration || 0,
                playbackRate: audio.playbackRate,
                position: audio.currentTime || 0
            });
        }
    });

    // 歌曲加载完成时更新总时长
    audio.addEventListener('loadedmetadata', () => {
        totalTimeSpan.textContent = formatTime(audio.duration);

    });

    // 格式化时间
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 调整音量
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
        // 更新无障碍属性
        e.target.setAttribute('aria-valuenow', e.target.value);
        e.target.setAttribute('title', `调节音量: ${e.target.value}%`);
    });

    // 进度条点击和拖动跳转
    let isDragging = false;

    progressBarContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        seekThumb.style.display = 'block'; // 显示圆点
        const width = progressBarContainer.clientWidth;
        const clickX = e.offsetX;
        const percent = (clickX / width) * 100;
        seekThumb.style.left = `${percent}%`; // 设置圆点位置
        updateProgressBar(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateProgressBar(e);
            // 更新圆点位置
            const width = progressBarContainer.clientWidth;
            const clickX = e.offsetX;
            const percent = (clickX / width) * 100;
            seekThumb.style.left = `${percent}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        seekThumb.style.display = 'none'; // 隐藏圆点
    });

    function updateProgressBar(e) {
        const width = progressBarContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // 歌曲播放结束自动播放下一曲
    audio.addEventListener('ended', () => {
        playNextSong();
    });

    // 更新播放列表UI
    function updatePlaylistUI() {
        songItems.forEach((item, index) => {
            item.addEventListener('click', async () => {
                currentSongIndex = index;
                
                // 移除了歌曲时长获取功能
                
                await loadSong(currentSongIndex);
                // 等待音频加载完成后再播放
                audio.addEventListener('canplaythrough', function playWhenReady() {
                    audio.removeEventListener('canplaythrough', playWhenReady);
                    audio.play().then(() => {
                        // 播放成功后更新按钮状态
                        playPauseBtn.classList.remove('fa-play');
                        playPauseBtn.classList.add('fa-pause');
                    }).catch(error => {
                        console.error('播放失败:', error);
                    });
                });
            });
        });
    }

    /**
     * 下载当前选定的歌曲
     */
    async function downloadCurrentSong() {
        const currentSong = playlist[currentSongIndex];
        if (!currentSong) {
            alert('请先选择一首歌曲');
            return;
        }
        
        try {
            // 如果当前歌曲没有播放链接，先获取
            let downloadUrl = currentSong.src;
            if (!downloadUrl && currentSong.trackId) {
                console.log('正在获取下载链接:', currentSong.title);
                downloadUrl = await getRealTimeMusicUrl(currentSong.trackId, currentSong.source, 320);
            }
            
            if (!downloadUrl) {
                alert('无法获取歌曲下载链接，请稍后重试');
                return;
            }
            
            console.log('开始下载:', currentSong.title);
            
            // 使用fetch获取音频数据
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 获取音频数据的Blob
            const audioBlob = await response.blob();
            
            // 创建Blob URL
            const blobUrl = URL.createObjectURL(audioBlob);
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${currentSong.artist} - ${currentSong.title}.mp3`;
            link.style.display = 'none';
            
            // 添加到页面并触发下载
            document.body.appendChild(link);
            link.click();
            
            // 清理
            document.body.removeChild(link);
            
            // 释放Blob URL
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 1000);
            
            console.log('下载完成:', currentSong.title);
            
        } catch (error) {
            console.error('下载失败:', error);
            alert('下载失败，请稍后重试');
        }
    }
    
    // 事件监听
    playPauseBtn.addEventListener('click', togglePlayPause);
    backwardBtn.addEventListener('click', playPreviousSong);
    forwardBtn.addEventListener('click', playNextSong);
    
    // 下载按钮事件监听
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadCurrentSong);
    }

    // 初始化播放器
    initPlayer();
});
