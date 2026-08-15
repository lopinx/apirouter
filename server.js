const { createServer } = require('node:http')
const { pathToFileURL } = require('node:url')

// 兼容 Cloudflare Workers 的全局对象
globalThis.self = { env: process.env }

async function main() {
  // 动态加载 _worker.js（ESM）
  const workerUrl = new URL('src/_worker.js', pathToFileURL(process.cwd()))
  const { default: worker } = await import(workerUrl.href)

  const port = parseInt(process.env.PORT, 10) || 8787
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`)
    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.body
    })

    try {
      const response = await worker.fetch(request, {})
      const body = await response.text()
      res.writeHead(response.status, Object.fromEntries(response.headers))
      res.end(body)
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`Internal Server Error: ${err.message}`)
    }
  })

  server.listen(port, () => {
    console.log(`🚀 本地服务运行在 http://localhost:${port}`)
    console.log(`📋 路由数: ${Object.keys(require('./config')).length}`)
    console.log('按 Ctrl+C 停止')
  })
}

main().catch(err => {
  console.error('启动失败:', err)
  process.exit(1)
})
