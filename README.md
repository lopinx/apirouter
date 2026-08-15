<div align="right">
   <a href="README_CN.md">中文</a> | <strong>English</strong>
</div>

# 🌐 Serverless API Proxy

<p align="center">
<img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
<img src="https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-FF7100?logo=cloudflare" alt="Cloudflare Workers">
<img src="https://img.shields.io/badge/APIs-15-brightgreen" alt="API Count">
</p>

> **Multi-API Proxy Gateway** powered by Cloudflare Workers — route to 15+ AI platforms through a single domain.

---

## ✨ Features

- **Zero Configuration** — Just deploy and go
- **15+ APIs Supported** — OpenAI, Gemini, Claude, Groq, and more
- **Full Header Passthrough** — Auth headers forwarded as-is
- **Single Domain** — All APIs under one unified endpoint

---

## 🚀 Quick Start

### Deploy to Cloudflare Workers

<p align="center">
<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/lopins/serverless-api-proxy">
<img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers">
</a>
</p>

```bash
# Clone the repo
git clone https://github.com/lopins/serverless-api-proxy.git
cd serverless-api-proxy

# Deploy with Wrangler
npx wrangler deploy
```

---

## 📋 Supported APIs

| 🔗 Path | 🎯 Target API | 📝 Example Route |
|:--------|:--------------|:-----------------|
| `/openai` | [OpenAI](https://api.openai.com) | `/openai/v1/chat/completions` |
| `/claude` | [Anthropic](https://api.anthropic.com) | `/claude/v1/completions` |
| `/gemini` | [Google Gemini](https://generativelanguage.googleapis.com) | `/gemini/v1/models/gemini-pro:generateContent` |
| `/groq` | [Groq](https://api.groq.com) | `/groq/openai/v1/chat/completions` |
| `/cohere` | [Cohere](https://api.cohere.ai) | `/cohere/v1/chat/completions` |
| `/huggingface` | [Hugging Face](https://api-inference.huggingface.co) | `/huggingface/models/meta-llama/Llama-3.1-70B-Instruct/v1/chat/completions` |
| `/fireworks` | [Fireworks AI](https://api.fireworks.ai) | `/fireworks/v1/chat/completions` |
| `/openrouter` | [OpenRouter](https://openrouter.ai/api) | `/openrouter/api/v1/chat/completions` |
| `/discord` | [Discord](https://discord.com/api) | `/discord/api/v10/users/@me` |
| `/telegram` | [Telegram Bot API](https://api.telegram.org) | `/telegram/bot<TOKEN>/getMe` |
| `/meta` | [Meta AI](https://www.meta.ai/api) | `/meta/api/chat` |
| `/x` | [xAI](https://api.x.ai) | `/x/v1/chat/completions` |
| `/together` | [Together AI](https://api.together.xyz) | `/together/v1/chat/completions` |
| `/novita` | [Novita AI](https://api.novita.ai) | `/novita/v3/chat/completions` |
| `/portkey` | [Portkey AI](https://api.portkey.ai) | `/portkey/v1/chat/completions` |

---

## 💻 Usage Example

### Python (OpenAI SDK compatible)

```python
import random
import re
from openai import OpenAI

ApiKey = "sk-your-api-key-here"
BaseUrl = "https://your-domain/openai/v1"
models = ["gpt-3.5-turbo", "gpt-4o-mini"]

def gentext():
    client = OpenAI(api_key=ApiKey, base_url=BaseUrl)
    model = random.choice(models)
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a smart and creative novelist."},
                {"role": "user", "content": "Write a short fairy tale about kindness."}
            ],
            top_p=0.7,
            temperature=0.7
        )
        text = completion.choices[0].message.content
        print(f"{model}: {re.sub(r'\n+', '', text)}")
    except Exception as e:
        print(f"{model}: {str(e)}\n")
```

### cURL

```bash
curl https://your-domain/openai/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## 🏗️ Architecture

```mermaid
flowchart TD
    C[👤 Client Request] -->|"GET /openai/v1/chat/completions"| W[⚡ Cloudflare Worker]

    subgraph worker ["Cloudflare Worker — src/_worker.js"]
        M[📋 apiMapping<br/>15 API route table]
        P[🔄 Forward method + headers + body]
        M --> P
    end

    W -->|"fetch()"| U[☁️ Upstream API<br/>OpenAI / Anthropic / Gemini / ...]
    U -->|"response"| W
    W -->|"return"| C

    style C fill:#1f6feb,stroke:#58a6ff,color:#fff
    style W fill:#30363d,stroke:#8b949e,color:#e6edf3
    style M fill:#1f6feb22,stroke:#1f6feb,color:#58a6ff
    style P fill:#30363d,stroke:#8b949e,color:#c9d1d9
    style U fill:#238636,stroke:#3fb950,color:#fff
```

---

## ⚠️ Notes

- 🔑 **API Keys**: Pass your API keys via request headers (`Authorization: Bearer ...`)
- 🌍 **No CORS Headers**: This proxy is designed for server-to-server use; browser requests may face CORS restrictions
- 📦 **No Rate Limiting**: Upstream rate limits apply directly; no additional throttling

---

<div align="center">

**Made with ❤️ by [lopins](https://github.com/lopinx/apirouter)**

</div>
