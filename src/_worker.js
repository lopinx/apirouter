// 默认路由映射
const apiMapping = {
  '/discord':     'https://discord.com/api',
  '/telegram':    'https://api.telegram.org',
  '/openai':      'https://api.openai.com',
  '/claude':      'https://api.anthropic.com',
  '/gemini':      'https://generativelanguage.googleapis.com',
  '/meta':        'https://www.meta.ai/api',
  '/groq':        'https://api.groq.com',
  '/x':           'https://api.x.ai',
  '/cohere':      'https://api.cohere.ai',
  '/huggingface': 'https://api-inference.huggingface.co',
  '/together':    'https://api.together.xyz',
  '/novita':      'https://api.novita.ai',
  '/portkey':     'https://api.portkey.ai',
  '/fireworks':   'https://api.fireworks.ai',
  '/openrouter':  'https://openrouter.ai/api'
}

async function handleRequest(request, env = {}) {
  const { pathname } = new URL(request.url)

  if (pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /', {
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  // 环境变量覆盖路由表
  let mapping = apiMapping
  if (env.API_MAPPING) {
    try { mapping = JSON.parse(env.API_MAPPING) } catch {}
  }

  const prefix = Object.keys(mapping).find(p => pathname.startsWith(p))
  if (!prefix) return new Response('Not Found', { status: 404 })

  try {
    return await fetch(mapping[prefix] + pathname.slice(prefix.length), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      duplex: 'half',
      redirect: 'manual'
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export default { fetch: handleRequest }

// Node.js 本地运行：自动启动 HTTP 服务器
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('_worker.js')) {
  const { createServer } = await import('node:http')
  const { Readable } = await import('node:stream')

  const port = process.env.PORT || 8787
  createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = chunks.length ? Buffer.concat(chunks) : null

    const request = new Request(`http://localhost:${port}${req.url}`, {
      method: req.method,
      headers: new Headers(req.headers),
      body,
      duplex: 'half'
    })
    try {
      const response = await handleRequest(request, process.env)
      res.writeHead(response.status, Object.fromEntries(response.headers))
      response.body ? Readable.fromWeb(response.body).pipe(res) : res.end()
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(err.message)
    }
  }).listen(port, () => console.log(`🚀 http://localhost:${port}`))
}
