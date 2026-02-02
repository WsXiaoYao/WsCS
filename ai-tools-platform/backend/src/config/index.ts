import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  // 第三方OpenAI兼容API配置（支持多个URL，逗号分隔）
  customOpenAiApiKey: process.env.CUSTOM_OPENAI_API_KEY || '',
  customOpenAiBaseURLs: (process.env.CUSTOM_OPENAI_BASE_URLS || process.env.CUSTOM_OPENAI_BASE_URL || 'https://api.vveai.com/v1').split(',').map(url => url.trim()),
  customOpenAiModel: process.env.CUSTOM_OPENAI_MODEL || 'gpt-3.5-turbo',
  // Gemini图像生成API配置（支持多个URL，逗号分隔）
  geminiImageApiKey: process.env.GEMINI_IMAGE_API_KEY || '',
  geminiImageBaseURLs: (process.env.GEMINI_IMAGE_BASE_URLS || process.env.GEMINI_IMAGE_BASE_URL || 'https://api.gpt.ge/v1').split(',').map(url => url.trim()),
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'nano-banana',
  // 数据库配置
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'ai_tools_platform',
    user: process.env.DB_USER || 'xiaoyao',
    password: process.env.DB_PASSWORD || '',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10)
  }
}
