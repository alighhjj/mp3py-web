# 部署到 Render 指南

本项目已经配置好了 Render 部署所需的文件，可以直接部署到 Render 平台。

## 部署步骤

### 1. 准备工作
- 确保你的代码已经推送到 GitHub 仓库
- 注册 Render 账号（https://render.com）

### 2. 在 Render 上创建服务
1. 登录 Render 控制台
2. 点击 "New" -> "Web Service"
3. 连接你的 GitHub 仓库
4. 选择这个音乐播放器项目

### 3. 配置部署设置
- **Name**: music-player（或你喜欢的名称）
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free（免费计划）

### 4. 环境变量（可选）
如果需要，可以在 Render 控制台中添加环境变量：
- `NODE_ENV`: production

### 5. 部署
点击 "Create Web Service" 开始部署。Render 会自动：
- 检测到这是一个 Node.js 项目
- 安装依赖（npm install）
- 启动应用（npm start）

## 部署后访问
部署完成后，Render 会提供一个 URL，格式类似：
`https://your-app-name.onrender.com`

## 注意事项

### 文件限制
- Render 免费计划有存储限制
- 建议音乐文件总大小不超过 500MB
- 如果音乐文件较大，考虑使用外部存储服务

### 性能优化
- 免费计划在无活动时会休眠
- 第一次访问可能需要等待几秒钟唤醒
- 考虑升级到付费计划以获得更好性能

### 故障排除
如果部署失败，检查：
1. package.json 中的启动脚本是否正确
2. Node.js 版本是否兼容（建议 18+）
3. 查看 Render 控制台中的构建日志

## 项目文件说明

- `package.json`: 包含启动脚本和 Node.js 版本要求
- `app.js`: 已配置使用环境变量 PORT
- `render.yaml`: Render 部署配置文件（可选）
- `README_DEPLOY.md`: 本部署指南

## 其他部署选项

如果 Render 不适合，还可以考虑：
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com
- **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform

这些平台都支持 Node.js 应用和文件系统操作。