# 分手挽回自测评估系统部署说明

这个项目已经整理成可以部署到线上平台的 Node.js Web 应用。部署后，你可以把网址分享给被分手、想挽回的人使用。

## 重要提醒

正式分享前，请去 DeepSeek 后台重新生成一个新的 API key。之前的 key 已经在聊天里出现过，不适合公开项目长期使用。

不要把 `.env.local` 上传到 GitHub 或任何公开平台。项目已经通过 `.gitignore` 排除了它。

## 本地运行

```bash
npm install
npm start
```

打开：

```text
http://127.0.0.1:8765/index.html
```

## 必填环境变量

线上平台里需要设置：

```env
DEEPSEEK_API_KEY=你的新版DeepSeekKey
DEEPSEEK_MODEL=deepseek-chat
SITE_ACCESS_CODE=设置一个给学员进入系统的口令
ACCESS_COOKIE_SECRET=随便生成一串长一点的随机字符
ADMIN_PASSWORD=设置你的后台口令
```

多数部署平台会自动提供 `PORT`，不需要手动填。

## 推荐部署方式：Render

1. 把这个项目上传到一个私有 GitHub 仓库。
2. 打开 Render，新建 Web Service。
3. 选择这个 GitHub 仓库。
4. Build Command 填：

```bash
npm install
```

5. Start Command 填：

```bash
npm start
```

6. 在 Environment Variables 里添加：

```env
DEEPSEEK_API_KEY=你的新版DeepSeekKey
DEEPSEEK_MODEL=deepseek-chat
SITE_ACCESS_CODE=你要发给学员的访问口令
ACCESS_COOKIE_SECRET=一串随机字符
ADMIN_PASSWORD=你的后台口令
```

7. 部署完成后，Render 会给你一个公网网址。把这个网址发给用户即可。

## 最快上线步骤

如果你只是想尽快拿到一个能分享的网址，推荐这样做：

1. 新建一个私有 GitHub 仓库。
2. 上传本项目里的这些内容：`public/`、`server.js`、`package.json`、`package-lock.json`、`.env.example`、`.gitignore`、`render.yaml`、`Procfile`。
3. 不要上传 `.env.local`、`node_modules/`、`screenshots/`、`test-results/`。
4. 到 Render 连接这个仓库并部署。
5. 在 Render 的环境变量里填写新版 `DEEPSEEK_API_KEY`、`SITE_ACCESS_CODE`、`ACCESS_COOKIE_SECRET`、`ADMIN_PASSWORD`。
6. 部署完成后，把 Render 给你的网址发给别人。

## 也可以部署到 Railway / Zeabur / VPS

只要平台支持 Node.js，就按下面方式配置：

```bash
npm install
npm start
```

并设置同样的环境变量：

```env
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
SITE_ACCESS_CODE
ACCESS_COOKIE_SECRET
ADMIN_PASSWORD
```

## 防同行盗取说明

这个版本已经做了基础保护：

- 访问系统前需要输入口令。
- DeepSeek key 和 AI 分析提示词只在后端，用户浏览器看不到。
- AI 分析接口有简单限流，避免被大量刷接口。
- 私有后台需要单独口令，普通用户无法查看访问和测评统计。
- 页面加了 `noindex` 和 `robots.txt`，降低被搜索引擎收录的概率。
- `.env.local` 不会上传，避免泄露 key 和访问口令。

但要注意：任何公开网页都无法 100% 防复制。更强的保护方式是后续加手机号登录、学员账号、付费权限、报告水印、后台记录访问日志、绑定你自己的域名。

## 项目结构

```text
public/              前端页面、样式、测评逻辑
server.js            后端服务和 DeepSeek API 代理
.env.example         环境变量示例
.gitignore           防止上传密钥和依赖目录
render.yaml          Render 部署配置
Procfile             通用 Web 进程配置
```

## 分享前建议

- 用新版 DeepSeek key，不要用已经泄露过的 key。
- 先自己用手机打开部署后的网址，完整跑一遍测评和 AI 深度分析。
- 测评报告里已经加入提醒：让做完测评的同学把报告截图发给老师，方便老师结合聊天记录继续判断。
- 不要把访问口令发到公开群里，建议只发给付费学员或内部学员。
- 后台地址是 `/admin`，例如 `https://你的域名/admin`。
