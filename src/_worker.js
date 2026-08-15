addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

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

  // 路由绑定：路径前缀 → 上游 API 地址
  const apiMapping = {
    '/discord': 'https://discord.com/api',
    '/telegram': 'https://api.telegram.org',
    '/openai': 'https://api.openai.com',
    '/claude': 'https://api.anthropic.com',
    '/gemini': 'https://generativelanguage.googleapis.com',
    '/meta': 'https://www.meta.ai/api',
    '/groq': 'https://api.groq.com',
    '/x': 'https://api.x.ai',
    '/cohere': 'https://api.cohere.ai',
    '/huggingface': 'https://api-inference.huggingface.co',
    '/together': 'https://api.together.xyz',
    '/novita': 'https://api.novita.ai',
    '/portkey': 'https://api.portkey.ai',
    '/fireworks': 'https://api.fireworks.ai',
    '/openrouter': 'https://openrouter.ai/api'
  }

  // 匹配路径前缀
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

  // 未匹配任何路由
  return new Response('Not Found', { status: 404 })
}
