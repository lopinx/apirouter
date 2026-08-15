# Serverless API Proxy - 工作区指令

## 项目概述

无服务器 API 代理服务，将 15 个 AI 平台 API 代理到同一域名下，解决跨区域访问限制问题。

---

## 项目结构

```
apipr/
├── src/
│   └── _worker.js       # Cloudflare Workers 主逻辑（API 路由映射核心）
├── public/
│   ├── index.html       # 装饰性健康检查页面
│   └── robots.txt       # 禁止爬虫
├── wrangler.toml        # Cloudflare Workers 部署配置
└── package.json         # 元信息（无构建步骤）
```

---

## 技术栈与部署

- **运行时**：Cloudflare Workers（纯 JavaScript，无框架依赖）
- **部署配置**：`wrangler.toml`
- **兼容性日期**：`2024-10-01`
- **workers_dev**：启用（可使用 `*.workers.dev` 子域名直接访问）

---

## 核心逻辑

`src/_worker.js` 中的 `apiMapping` 对象是路由映射的**唯一数据源**。新增 API 支持时，只需修改该对象的映射即可。

### 特殊路径处理

| 路径 | 行为 |
|------|------|
| `/` 或 `/index.html` | 返回 `index.html` 页面（装饰性健康检查页） |
| `/robots.txt` | 返回 `Disallow: /` 拒绝爬虫 |
| 其他 `/prefix/...` | 代理转发到对应上游 API |

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

## 部署注意事项

- 代理**透传所有请求方法和请求头**（包括认证 Header），请自行管理 API Key
- 代理**不设置 CORS 头**，适用于服务端调用场景
- **无速率限制**，上游 API 的限流策略直接生效
- 路由匹配按 `apiMapping` 中定义的顺序进行，注意前缀之间不要有歧义（如 `/x` 和 `/xx`）
