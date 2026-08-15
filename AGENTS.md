# Serverless API Proxy - 工作区指令

## 项目概述

无服务器 API 代理服务，将多个 AI 平台 API 代理到同一域名下，解决跨区域访问限制问题。同时支持 Cloudflare Workers 部署和 Node.js 本地运行。

---

## 项目结构

```
apirouter/
├── src/
│   └── _worker.js       # 单文件主逻辑（路由映射 + HTTP 服务器 + CF Workers 入口）
├── public/
│   ├── index.html       # 装饰性健康检查页面
│   └── robots.txt       # 禁止爬虫
├── .github/workflows/
│   └── deploy.yml       # GitHub Actions 手动部署工作流
├── .env.example         # 环境变量示例
├── wrangler.toml        # Cloudflare Workers 配置
└── package.json         # 元信息（无构建步骤、无依赖）
```

---

## 技术栈与部署

- **运行时**：Cloudflare Workers 或 Node.js 22+（单文件兼容两者）
- **部署方式**：GitHub Actions 手动触发（`workflow_dispatch`）
- **本地运行**：`npm run dev`，自动加载 `.env` 文件
- **无依赖**：纯原生 JavaScript，无任何 npm 包

---

## 核心逻辑

`src/_worker.js` 单文件包含全部逻辑：
- `apiMapping` 对象为默认路由表
- 环境变量 `API_MAPPING`（JSON 字符串）可覆盖默认路由表
- `handleRequest` 函数处理路由匹配和代理转发
- 文件底部自动检测 Node.js 环境并启动 HTTP 服务器

### 路由匹配规则

- 按前缀匹配，第一个命中的前缀生效
- 透传请求方法、请求头、请求体
- `redirect: 'manual'` 不自动跟随重定向

### 特殊路径

| 路径 | 行为 |
|------|------|
| `/robots.txt` | 返回 `Disallow: /` |
| 未匹配前缀 | 返回 404 |

---

## API 映射列表

| 路径前缀 | 目标 API | 服务商 |
|---------|---------|--------|
| `/openai` | `https://api.openai.com` | OpenAI |
| `/claude` | `https://api.anthropic.com` | Anthropic |
| `/gemini` | `https://generativelanguage.googleapis.com` | Google |
| `/groq` | `https://api.groq.com` | Groq |
| `/cohere` | `https://api.cohere.ai` | Cohere |
| `/huggingface` | `https://api-inference.huggingface.co` | Hugging Face |
| `/fireworks` | `https://api.fireworks.ai` | Fireworks AI |
| `/openrouter` | `https://openrouter.ai/api` | OpenRouter |
| `/discord` | `https://discord.com/api` | Discord |
| `/telegram` | `https://api.telegram.org` | Telegram |
| `/meta` | `https://www.meta.ai/api` | Meta AI |
| `/x` | `https://api.x.ai` | xAI |
| `/together` | `https://api.together.xyz` | Together AI |
| `/novita` | `https://api.novita.ai` | Novita AI |
| `/portkey` | `https://api.portkey.ai` | Portkey AI |

---

## 环境变量

| 变量名 | 平台 | 说明 |
|--------|------|------|
| `API_MAPPING` | CF Workers / Node.js | JSON 字符串，覆盖默认路由表 |
| `PORT` | Node.js | 本地服务端口，默认 8787 |

---

## 注意事项

- 代理**透传所有请求方法和请求头**（包括认证 Header），请自行管理 API Key
- 代理**不设置 CORS 头**，适用于服务端调用场景
- **无速率限制**，上游 API 的限流策略直接生效
- 路由匹配按 `apiMapping` 中定义的顺序进行，注意前缀之间不要有歧义（如 `/x` 和 `/xx`）
- 新增 API 只需修改 `src/_worker.js` 中的 `apiMapping` 对象
