// 前后端共享的常量

export const TOOL_CATEGORIES = {
  TEXT_GENERATION: 'text-generation',
  IMAGE_GENERATION: 'image-generation',
  AUDIO_PROCESSING: 'audio-processing',
  DATA_ANALYSIS: 'data-analysis',
  TRANSLATION: 'translation'
} as const

export const ERROR_MESSAGES = {
  TOOL_NOT_FOUND: '工具不存在',
  INVALID_INPUT: '输入参数无效',
  API_ERROR: 'API调用失败',
  NETWORK_ERROR: '网络错误'
} as const
