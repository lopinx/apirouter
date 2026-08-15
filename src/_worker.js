addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 从环境变量读取路由映射，支持 JSON 字符串注入
function getApiMapping(env) {
  const raw = env.API_MAPPING
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch (e) {
      console.error('API_MAPPING 解析失败:', e.message)
    }
  }
  // 默认路由表
  return {
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

  const apiMapping = getApiMapping(self.env)
  const matchedPrefix = Object.keys(apiMapping).find(prefix => pathname.startsWith(prefix))

  if (matchedPrefix) {
    const targetPath = pathname.slice(matchedPrefix.length)
    const targetUrl = `${apiMapping[matchedPrefix]}${targetPath}`

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
