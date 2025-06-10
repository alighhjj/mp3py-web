# 音乐API使用说明

基于 GD Studio 音乐平台 API 的使用指南和示例代码。

## API 概述

**API 基础地址**: `https://music-api.gdstudio.xyz/api.php` <mcreference link="https://music-api.gdstudio.xyz/api.php" index="0">0</mcreference>

**支持的音乐源**: netease（网易云）、tencent（QQ音乐）、tidal、spotify、ytmusic、qobuz、joox、deezer、migu（咪咕）、kugou（酷狗）、kuwo（酷我）、ximalaya（喜马拉雅） <mcreference link="https://music-api.gdstudio.xyz/api.php" index="0">0</mcreference>

**免责声明**: 本API仅供学习参考使用，严禁商业用途 <mcreference link="https://music-api.gdstudio.xyz/api.php" index="0">0</mcreference>

## API 接口详解

### 1. 搜索音乐 API

#### 接口地址
```
GET https://music-api.gdstudio.xyz/api.php?types=search&source=[MUSIC_SOURCE]&name=[KEYWORD]&count=[PAGE_LENGTH]&pages=[PAGE_NUM]
```

#### 参数说明
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| types | string | 是 | - | 固定值：search |
| source | string | 否 | netease | 音乐源，可选值见上方支持列表 |
| name | string | 是 | - | 搜索关键字（歌曲名、歌手名、专辑名） |
| count | int | 否 | 20 | 每页返回数量 |
| pages | int | 否 | 1 | 页码 |

#### 高级用法
- 在音乐源后加上 `_album` 可获取专辑曲目列表，如：`netease_album` <mcreference link="https://music-api.gdstudio.xyz/api.php" index="0">0</mcreference>

#### 返回字段
| 字段 | 说明 |
|------|------|
| id | 曲目ID（track_id） |
| name | 歌曲名 |
| artist | 歌手列表 |
| album | 专辑名 |
| pic_id | 专辑图ID |
| lyric_id | 歌词ID |
| source | 音乐源 |

#### 示例代码

**cURL 示例**:
```bash
# 基础搜索
curl "https://music-api.gdstudio.xyz/api.php?types=search&source=netease&name=%E5%91%A8%E6%9D%B0%E4%BC%A6&count=10&pages=1"

# 搜索指定音乐源
curl "https://music-api.gdstudio.xyz/api.php?types=search&source=tencent&name=%E9%99%88%E5%A5%95%E8%BF%85&count=20&pages=1"

# 专辑搜索
curl "https://music-api.gdstudio.xyz/api.php?types=search&source=netease_album&name=%E5%91%A8%E6%9D%B0%E4%BC%A6%20%E5%8F%B6%E6%83%A0%E7%BE%8E&count=50&pages=1"

# 使用管道和jq美化输出（需要安装jq）
curl -s "https://music-api.gdstudio.xyz/api.php?types=search&source=netease&name=%E5%91%A8%E6%9D%B0%E4%BC%A6&count=5&pages=1" | jq .
```

**JavaScript 示例**:
```javascript
/**
 * 搜索音乐
 * @param {string} keyword - 搜索关键字
 * @param {string} source - 音乐源，默认为 netease
 * @param {number} count - 返回数量，默认为 20
 * @param {number} page - 页码，默认为 1
 * @returns {Promise} 搜索结果
 */
async function searchMusic(keyword, source = 'netease', count = 20, page = 1) {
    const url = `https://music-api.gdstudio.xyz/api.php?types=search&source=${source}&name=${encodeURIComponent(keyword)}&count=${count}&pages=${page}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('搜索音乐失败:', error);
        throw error;
    }
}

// 使用示例
searchMusic('周杰伦', 'netease', 10, 1)
    .then(result => {
        console.log('搜索结果:', result);
    })
    .catch(error => {
        console.error('搜索失败:', error);
    });
```

**Python 示例**:
```python
import requests
import urllib.parse

def search_music(keyword, source='netease', count=20, page=1):
    """
    搜索音乐
    :param keyword: 搜索关键字
    :param source: 音乐源，默认为 netease
    :param count: 返回数量，默认为 20
    :param page: 页码，默认为 1
    :return: 搜索结果
    """
    url = f"https://music-api.gdstudio.xyz/api.php"
    params = {
        'types': 'search',
        'source': source,
        'name': keyword,
        'count': count,
        'pages': page
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"搜索音乐失败: {e}")
        raise

# 使用示例
if __name__ == "__main__":
    result = search_music("陈奕迅", "netease", 10, 1)
    print("搜索结果:", result)
```

### 2. 获取音乐播放链接 API

#### 接口地址
```
GET https://music-api.gdstudio.xyz/api.php?types=url&source=[MUSIC_SOURCE]&id=[TRACK_ID]&br=[BITRATE]
```

#### 参数说明
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| types | string | 是 | - | 固定值：url |
| source | string | 否 | netease | 音乐源 |
| id | string | 是 | - | 曲目ID（从搜索接口获取） |
| br | int | 否 | 999 | 音质：128/192/320/740/999（740、999为无损） |

#### 返回字段
| 字段 | 说明 |
|------|------|
| url | 音乐播放链接 |
| br | 实际返回音质 |
| size | 文件大小（KB） |

#### 示例代码

**cURL 示例**:
```bash
# 获取标准音质播放链接
curl "https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=12345678&br=320"

# 获取无损音质播放链接
curl "https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=12345678&br=999"

# 获取不同音乐源的播放链接
curl "https://music-api.gdstudio.xyz/api.php?types=url&source=tencent&id=87654321&br=320"

# 获取低音质播放链接（适合网络较慢的情况）
curl "https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=12345678&br=128"

# 使用管道和jq美化输出
curl -s "https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=12345678&br=320" | jq .

# 直接下载音乐文件（先获取链接，再下载）
MUSIC_URL=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=12345678&br=320" | jq -r '.url')
curl -o "music.mp3" "$MUSIC_URL"
```

**JavaScript 示例**:
```javascript
/**
 * 获取音乐播放链接
 * @param {string} trackId - 曲目ID
 * @param {string} source - 音乐源，默认为 netease
 * @param {number} bitrate - 音质，默认为 999
 * @returns {Promise} 音乐链接信息
 */
async function getMusicUrl(trackId, source = 'netease', bitrate = 999) {
    const url = `https://music-api.gdstudio.xyz/api.php?types=url&source=${source}&id=${trackId}&br=${bitrate}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取音乐链接失败:', error);
        throw error;
    }
}

// 使用示例
getMusicUrl('12345678', 'netease', 320)
    .then(result => {
        console.log('音乐链接:', result.url);
        console.log('实际音质:', result.br);
        console.log('文件大小:', result.size, 'KB');
    });
```

### 3. 获取专辑封面 API

#### 接口地址
```
GET https://music-api.gdstudio.xyz/api.php?types=pic&source=[MUSIC_SOURCE]&id=[PIC_ID]&size=[SIZE]
```

#### 参数说明
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| types | string | 是 | - | 固定值：pic |
| source | string | 否 | netease | 音乐源 |
| id | string | 是 | - | 专辑图ID（从搜索接口获取的pic_id） |
| size | int | 否 | 300 | 图片尺寸：300（小图）/500（大图） |

#### 返回字段
| 字段 | 说明 |
|------|------|
| url | 专辑封面图片链接 |

#### 示例代码

**cURL 示例**:
```bash
# 获取小尺寸专辑封面
curl "https://music-api.gdstudio.xyz/api.php?types=pic&source=netease&id=12345678&size=300"

# 获取大尺寸专辑封面
curl "https://music-api.gdstudio.xyz/api.php?types=pic&source=netease&id=12345678&size=500"

# 获取不同音乐源的专辑封面
curl "https://music-api.gdstudio.xyz/api.php?types=pic&source=tencent&id=87654321&size=500"

# 使用管道和jq获取封面链接
curl -s "https://music-api.gdstudio.xyz/api.php?types=pic&source=netease&id=12345678&size=500" | jq -r '.url'

# 直接下载专辑封面图片
COVER_URL=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=pic&source=netease&id=12345678&size=500" | jq -r '.url')
curl -o "album_cover.jpg" "$COVER_URL"

# 批量获取多个专辑封面
for pic_id in 12345678 87654321 11223344; do
    echo "获取专辑封面 ID: $pic_id"
    curl -s "https://music-api.gdstudio.xyz/api.php?types=pic&source=netease&id=$pic_id&size=300" | jq -r '.url'
done
```

**JavaScript 示例**:
```javascript
/**
 * 获取专辑封面
 * @param {string} picId - 专辑图ID
 * @param {string} source - 音乐源，默认为 netease
 * @param {number} size - 图片尺寸，默认为 300
 * @returns {Promise} 专辑封面链接
 */
async function getAlbumCover(picId, source = 'netease', size = 300) {
    const url = `https://music-api.gdstudio.xyz/api.php?types=pic&source=${source}&id=${picId}&size=${size}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('获取专辑封面失败:', error);
        throw error;
    }
}

// 使用示例
getAlbumCover('12345678', 'netease', 500)
    .then(coverUrl => {
        console.log('专辑封面链接:', coverUrl);
        // 可以直接用于 img 标签的 src 属性
        document.getElementById('albumCover').src = coverUrl;
    });
```

### 4. 获取歌词 API

#### 接口地址
```
GET https://music-api.gdstudio.xyz/api.php?types=lyric&source=[MUSIC_SOURCE]&id=[LYRIC_ID]
```

#### 参数说明
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| types | string | 是 | - | 固定值：lyric |
| source | string | 否 | netease | 音乐源 |
| id | string | 是 | - | 歌词ID（从搜索接口获取的lyric_id，通常与曲目ID相同） |

#### 返回字段
| 字段 | 说明 |
|------|------|
| lyric | LRC格式的原语种歌词 |
| tlyric | LRC格式的中文翻译歌词（可能为空） |

#### 示例代码

**cURL 示例**:
```bash
# 获取歌词
curl "https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=12345678"

# 获取不同音乐源的歌词
curl "https://music-api.gdstudio.xyz/api.php?types=lyric&source=tencent&id=87654321"

# 使用管道和jq美化输出
curl -s "https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=12345678" | jq .

# 只获取原文歌词
curl -s "https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=12345678" | jq -r '.lyric'

# 只获取翻译歌词
curl -s "https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=12345678" | jq -r '.tlyric'

# 保存歌词到文件
curl -s "https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=12345678" | jq -r '.lyric' > lyrics.lrc

# 批量获取多首歌曲的歌词
for lyric_id in 12345678 87654321 11223344; do
    echo "获取歌词 ID: $lyric_id"
    curl -s "https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=$lyric_id" | jq -r '.lyric' > "lyrics_$lyric_id.lrc"
done
```

**JavaScript 示例**:
```javascript
/**
 * 获取歌词
 * @param {string} lyricId - 歌词ID
 * @param {string} source - 音乐源，默认为 netease
 * @returns {Promise} 歌词信息
 */
async function getLyrics(lyricId, source = 'netease') {
    const url = `https://music-api.gdstudio.xyz/api.php?types=lyric&source=${source}&id=${lyricId}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取歌词失败:', error);
        throw error;
    }
}

/**
 * 解析LRC格式歌词
 * @param {string} lrcText - LRC格式歌词文本
 * @returns {Array} 解析后的歌词数组
 */
function parseLrc(lrcText) {
    if (!lrcText) return [];
    
    const lines = lrcText.split('\n');
    const lyrics = [];
    
    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3].padEnd(3, '0'));
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = match[4].trim();
            
            if (text) {
                lyrics.push({ time, text });
            }
        }
    });
    
    return lyrics.sort((a, b) => a.time - b.time);
}

// 使用示例
getLyrics('12345678', 'netease')
    .then(result => {
        console.log('原文歌词:', result.lyric);
        console.log('翻译歌词:', result.tlyric);
        
        // 解析歌词
        const parsedLyrics = parseLrc(result.lyric);
        console.log('解析后的歌词:', parsedLyrics);
    });
```

## cURL 高级用法

### 组合使用示例

```bash
#!/bin/bash
# 完整的音乐信息获取脚本

# 设置变量
KEYWORD="周杰伦 告白气球"
SOURCE="netease"

# 1. 搜索音乐
echo "正在搜索: $KEYWORD"
SEARCH_RESULT=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=search&source=$SOURCE&name=$(echo $KEYWORD | sed 's/ /%20/g')&count=1&pages=1")

# 2. 提取第一首歌的信息
TRACK_ID=$(echo $SEARCH_RESULT | jq -r '.[0].id')
PIC_ID=$(echo $SEARCH_RESULT | jq -r '.[0].pic_id')
LYRIC_ID=$(echo $SEARCH_RESULT | jq -r '.[0].lyric_id')
SONG_NAME=$(echo $SEARCH_RESULT | jq -r '.[0].name')
ARTIST=$(echo $SEARCH_RESULT | jq -r '.[0].artist')

echo "找到歌曲: $SONG_NAME - $ARTIST"
echo "曲目ID: $TRACK_ID"

# 3. 获取播放链接
echo "获取播放链接..."
MUSIC_URL=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=url&source=$SOURCE&id=$TRACK_ID&br=320" | jq -r '.url')
echo "播放链接: $MUSIC_URL"

# 4. 获取专辑封面
echo "获取专辑封面..."
COVER_URL=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=pic&source=$SOURCE&id=$PIC_ID&size=500" | jq -r '.url')
echo "封面链接: $COVER_URL"

# 5. 获取歌词
echo "获取歌词..."
LYRICS=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=lyric&source=$SOURCE&id=$LYRIC_ID" | jq -r '.lyric')
echo "歌词预览:"
echo "$LYRICS" | head -10

# 6. 下载文件（可选）
read -p "是否下载音乐和封面？(y/n): " download
if [ "$download" = "y" ]; then
    echo "下载音乐文件..."
    curl -o "${SONG_NAME// /_}.mp3" "$MUSIC_URL"
    
    echo "下载专辑封面..."
    curl -o "${SONG_NAME// /_}_cover.jpg" "$COVER_URL"
    
    echo "保存歌词..."
    echo "$LYRICS" > "${SONG_NAME// /_}.lrc"
    
    echo "下载完成！"
fi
```

### 错误处理和重试机制

```bash
#!/bin/bash
# 带错误处理的API调用脚本

# 函数：带重试的API调用
api_call_with_retry() {
    local url="$1"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        response=$(curl -s -w "%{http_code}" "$url")
        http_code="${response: -3}"
        body="${response%???}"
        
        if [ "$http_code" = "200" ]; then
            echo "$body"
            return 0
        else
            echo "请求失败，HTTP状态码: $http_code，重试中..." >&2
            retry_count=$((retry_count + 1))
            sleep 2
        fi
    done
    
    echo "API调用失败，已重试 $max_retries 次" >&2
    return 1
}

# 使用示例
result=$(api_call_with_retry "https://music-api.gdstudio.xyz/api.php?types=search&source=netease&name=周杰伦&count=5&pages=1")
if [ $? -eq 0 ]; then
    echo "搜索成功:"
    echo "$result" | jq .
else
    echo "搜索失败"
fi
```

### 批量处理脚本

```bash
#!/bin/bash
# 批量下载歌单脚本

# 歌曲列表（可以从文件读取）
songs=(
    "周杰伦 告白气球"
    "陈奕迅 十年"
    "邓紫棋 光年之外"
    "薛之谦 演员"
)

# 创建下载目录
mkdir -p downloads
cd downloads

# 批量处理
for song in "${songs[@]}"; do
    echo "========================================"
    echo "处理: $song"
    echo "========================================"
    
    # 搜索歌曲
    search_result=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=search&source=netease&name=$(echo $song | sed 's/ /%20/g')&count=1&pages=1")
    
    if [ "$(echo $search_result | jq length)" -gt 0 ]; then
        track_id=$(echo $search_result | jq -r '.[0].id')
        song_name=$(echo $search_result | jq -r '.[0].name')
        artist=$(echo $search_result | jq -r '.[0].artist')
        
        echo "找到: $song_name - $artist"
        
        # 获取播放链接并下载
        music_url=$(curl -s "https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=$track_id&br=320" | jq -r '.url')
        
        if [ "$music_url" != "null" ] && [ "$music_url" != "" ]; then
            filename="${song_name// /_}-${artist// /_}.mp3"
            echo "下载: $filename"
            curl -o "$filename" "$music_url"
            echo "下载完成"
        else
            echo "无法获取播放链接"
        fi
    else
        echo "未找到歌曲: $song"
    fi
    
    echo ""
    sleep 1  # 避免请求过于频繁
done

echo "批量下载完成！"
```
