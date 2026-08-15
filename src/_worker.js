// 默认路由映射
const apiMapping = {
  '/discord':     'https://discord.com/api',
  '/telegram':    'https://api.telegram.org',
  '/gpt':         'https://api.openai.com',
  '/claude':      'https://api.anthropic.com',
  '/gemini':      'https://generativelanguage.googleapis.com',
  '/llama':       'https://www.meta.ai/api',
  '/grok':        'https://api.x.ai'
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

  // 前缀必须匹配完整路径段，避免 /x 误吞 /xyz
  const prefix = Object.keys(mapping).find(p => pathname === p || pathname.startsWith(p + '/'))
  if (!prefix) return new Response('Not Found', { status: 404 })

  const targetUrl = mapping[prefix] + pathname.slice(prefix.length)
  const headers = new Headers(request.headers)
  // 删除原始 host 头，让 fetch 运行时根据目标 URL 自动设置
  headers.delete('host')

  try {
    return await fetch(targetUrl, {
      method: request.method,
      headers,
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

  // undici 会自动解压响应体，转发时必须剔除实体相关头部，否则客户端收到的长度/编码不一致
  const ENTITY_HEADERS = /^(content-(encoding|length)|transfer-encoding|connection|keep-alive)$/i

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
      const headers = {}
      for (const [key, value] of response.headers) {
        if (!ENTITY_HEADERS.test(key)) headers[key] = value
      }
      res.writeHead(response.status, headers)
      response.body ? Readable.fromWeb(response.body).pipe(res) : res.end()
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(err.message)
    }
  }).listen(port, () => console.log(`🚀 http://localhost:${port}`))
}