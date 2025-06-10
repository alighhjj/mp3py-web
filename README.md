# 音乐播放器 (Music Player)

一个基于 Node.js 和 Express 的现代化音乐播放器 Web 应用，支持 PWA（渐进式 Web 应用）功能和在线音乐流媒体播放。

## 功能特性

### 🎵 核心功能
- **音乐播放控制**：播放、暂停、上一曲、下一曲
- **进度控制**：可拖拽的进度条，支持点击跳转
- **音量控制**：可调节音量滑块
- **播放列表**：显示所有音乐文件，支持点击切换
- **音乐信息显示**：自动读取 MP3 文件的元数据（标题、艺术家、时长）
- **歌曲下载**：支持下载当前播放的歌曲到本地
- **在线音乐流媒体**：集成第三方音乐API，支持在线搜索和播放
- **实时链接获取**：动态获取音乐播放链接，确保链接有效性

### 🌐 PWA 支持
- **离线缓存**：Service Worker 实现静态资源和音乐文件缓存
- **桌面安装**：支持安装到桌面作为原生应用
- **响应式设计**：适配不同屏幕尺寸
- **移动端优化**：支持 iOS 和 Android 设备
- **媒体会话API**：支持锁屏界面音乐控制

### 🔒 安全特性
- **安全头部**：完整的HTTP安全头部配置
- **内容安全策略**：CSP防护XSS攻击
- **MIME类型保护**：防止MIME类型嗅探攻击
- **点击劫持防护**：X-Frame-Options头部保护
- **HTTPS强制**：生产环境强制使用HTTPS

### 🎨 用户界面
- **现代化设计**：仿 macOS 风格的窗口控件
- **深色主题**：护眼的深色界面
- **专辑封面显示**：支持专辑信息展示
- **实时进度更新**：显示当前播放时间和总时长
- **错误处理界面**：友好的错误提示和处理
- **加载状态指示**：音乐加载过程的状态反馈

## 技术栈

- **后端**：Node.js + Express
- **前端**：原生 JavaScript + HTML5 Audio API
- **模板引擎**：EJS
- **音乐API**：第三方音乐服务API集成
- **PWA**：Service Worker + Web App Manifest
- **样式**：CSS3 + Font Awesome 图标
- **安全**：HTTP安全头部 + CSP策略
- **缓存策略**：智能缓存控制和资源优化

## 项目结构

```
mp3py-web/
├── app.js                 # Express 服务器主文件
├── music_api.js           # 音乐API服务模块
├── music_get.js           # 音乐数据处理模块
├── package.json           # 项目依赖配置
├── render.yaml           # Render 部署配置
├── music_list.json       # 本地音乐列表配置
├── music_list_api.json   # API音乐列表配置
├── music_data.json       # 处理后的音乐数据
├── public/               # 静态资源目录
│   ├── style.css         # 主样式文件
│   ├── player.js         # 播放器 JavaScript 逻辑
│   ├── sw.js             # Service Worker
│   ├── manifest.json     # PWA 配置文件
│   └── icons/            # 应用图标
├── views/                # EJS 模板
│   └── index.ejs         # 主页模板
├── music/                # 本地音乐文件目录
└── workers-site/         # Cloudflare Workers 配置
```

## 安装和运行

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd mp3py-web
```

2. **安装依赖**
```bash
npm install
```

3. **配置音乐源**
   - **本地音乐**：将 `.mp3` 格式的音乐文件放入 `music/` 目录中
   - **在线音乐**：编辑 `music_list_api.json` 配置在线音乐列表
   - **混合模式**：同时支持本地和在线音乐播放

4. **启动应用**
```bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm start
```

5. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 使用说明

### 基本操作
1. **播放音乐**：点击播放列表中的任意歌曲开始播放
2. **控制播放**：使用底部的播放控制按钮
3. **调节进度**：点击或拖拽进度条跳转到指定位置
4. **调节音量**：使用右下角的音量滑块
5. **下载歌曲**：点击"下载歌曲"按钮下载当前播放的音乐

### 高级功能
1. **在线音乐**：自动从第三方API获取音乐播放链接
2. **智能重试**：播放失败时自动重新获取有效链接
3. **媒体会话**：支持锁屏界面和系统媒体控制
4. **错误恢复**：网络异常时的自动恢复机制

### PWA 功能
1. **安装到桌面**：在支持的浏览器中点击地址栏的安装图标
2. **离线使用**：首次加载后，应用可在离线状态下使用已缓存的音乐
3. **后台播放**：支持后台继续播放音乐

## 部署

### Render 部署
项目已配置 `render.yaml`，可直接部署到 Render 平台：

1. 将代码推送到 GitHub
2. 在 Render 中连接 GitHub 仓库
3. 选择 Web Service 类型
4. Render 会自动检测配置并部署

详细部署说明请参考 `README_DEPLOY.md`

### Cloudflare Workers
项目包含 Cloudflare Workers 配置文件，支持部署到 Cloudflare Workers。

## API 接口

### 音乐相关接口
- `GET /api/music/url` - 获取音乐播放链接
  - 参数：`trackId`, `source`, `br`（音质）
- `GET /api/music/search` - 搜索音乐（预留接口）
- `GET /api/music/cover` - 获取专辑封面（预留接口）

### 静态资源
- `/music/*` - 本地音乐文件访问
- `/public/*` - 静态资源文件

## 开发

### 开发模式
```bash
npm run dev
```
使用 nodemon 实现热重载，修改代码后自动重启服务器。

### 添加新功能
- **播放器逻辑**：修改 `public/player.js`
- **样式调整**：修改 `public/style.css`
- **服务器逻辑**：修改 `app.js`
- **页面结构**：修改 `views/index.ejs`
- **音乐API**：修改 `music_api.js`
- **数据处理**：修改 `music_get.js`

### 配置文件说明
- `music_list.json` - 本地音乐文件列表
- `music_list_api.json` - 在线音乐配置列表
- `music_data.json` - 处理后的音乐数据缓存

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- 移动端浏览器（iOS Safari, Chrome Mobile）

## 许可证

ISC License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 更新日志

### v2.0.0
- 🎵 新增在线音乐流媒体支持
- 📥 新增歌曲下载功能
- 🔒 完整的安全头部配置
- 🔄 智能链接重试机制
- 📱 媒体会话API支持
- ⚡ 性能优化和缓存策略
- 🛠️ 错误处理和恢复机制

### v1.0.0
- 基础音乐播放功能
- PWA 支持
- 响应式设计
- 音乐元数据读取
<<<<<<< HEAD
- Service Worker 缓存
=======
- Service Worker 缓存
>>>>>>> 6c3a9482cf8c2db64ad076b45d69408c5a64981b
