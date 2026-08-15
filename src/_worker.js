// Node.js 本地开发时自动加载 .env（Node.js 22+ 原生支持）
if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('_worker.js')) {
  try {
    await import('data:text/javascript,import dotenv from "dotenv"; dotenv.config()')
  } catch {}
}

// 路由映射配置（本地通过 .env API_MAPPING=... 覆盖，Cloudflare 通过环境变量注入）
const apiMapping = {
  '/discord':    'https://discord.com/api',
  '/telegram':   'https://api.telegram.org',
  '/openai':     'https://api.openai.com',
  '/claude':     'https://api.anthropic.com',
  '/gemini':     'https://generativelanguage.googleapis.com',
  '/meta':       'https://www.meta.ai/api',
  '/groq':       'https://api.groq.com',
  '/x':          'https://api.x.ai',
  '/cohere':     'https://api.cohere.ai',
  '/huggingface':'https://api-inference.huggingface.co',
  '/together':   'https://api.together.xyz',
  '/novita':     'https://api.novita.ai',
  '/portkey':    'https://api.portkey.ai',
  '/fireworks':  'https://api.fireworks.ai',
  '/openrouter': 'https://openrouter.ai/api'
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // 静态路径处理
  if (pathname === '/' || pathname === '/index.html') {
    return new Response(null, { status: 404 })
  }
  if (pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  // 优先读取环境变量覆盖的路由表
  const raw = self?.env?.API_MAPPING ?? process.env.API_MAPPING
  const mapping = raw ? (() => { try { return JSON.parse(raw) } catch { return apiMapping } })() : apiMapping

  const matchedPrefix = Object.keys(mapping).find(prefix => pathname.startsWith(prefix))

  if (matchedPrefix) {
    const targetPath = pathname.slice(matchedPrefix.length)
    const targetUrl = `${mapping[matchedPrefix]}${targetPath}`

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      })
      return response
    } catch (error) {
      console.error('Proxy error:', error)
      return new Response(JSON.stringify({
        error: 'Proxy error',
        details: error.message
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response('Not Found', { status: 404 })
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

export default { fetch: handleRequest }
