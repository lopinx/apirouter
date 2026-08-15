// 默认路由映射表
// 可通过环境变量 API_MAPPING（JSON 字符串）覆盖
module.exports = {
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
