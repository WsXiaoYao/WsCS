import OpenAI from 'openai'

export interface APIEndpoint {
  url: string
  isHealthy: boolean
  lastUsed: number
  failureCount: number
}

export class APIFailoverManager {
  private endpoints: APIEndpoint[] = []
  private currentIndex = 0
  private readonly maxFailures = 3
  private readonly cooldownPeriod = 5 * 60 * 1000 // 5 minutes

  constructor(baseURLs: string[]) {
    this.endpoints = baseURLs.map(url => ({
      url: url.endsWith('/v1') ? url : `${url}/v1`,
      isHealthy: true,
      lastUsed: 0,
      failureCount: 0
    }))
  }

  /**
   * 获取下一个可用的API端点
   */
  getNextEndpoint(): APIEndpoint {
    const now = Date.now()
    
    // 重置冷却时间已过的端点
    for (const endpoint of this.endpoints) {
      if (!endpoint.isHealthy && now - endpoint.lastUsed > this.coolDownPeriod) {
        endpoint.isHealthy = true
        endpoint.failureCount = 0
      }
    }

    // 找到可用的端点
    const availableEndpoints = this.endpoints.filter(e => e.isHealthy)
    
    if (availableEndpoints.length === 0) {
      // 如果没有可用的端点，重置所有端点
      this.endpoints.forEach(e => {
        e.isHealthy = true
        e.failureCount = 0
      })
      return this.endpoints[0]
    }

    // 轮询选择
    const endpoint = availableEndpoints[this.currentIndex % availableEndpoints.length]
    this.currentIndex++
    return endpoint
  }

  /**
   * 标记端点失败
   */
  markFailure(url: string): void {
    const endpoint = this.endpoints.find(e => e.url === url)
    if (endpoint) {
      endpoint.failureCount++
      endpoint.lastUsed = Date.now()
      
      if (endpoint.failureCount >= this.maxFailures) {
        endpoint.isHealthy = false
        console.warn(`API endpoint marked as unhealthy: ${url}`)
      }
    }
  }

  /**
   * 标记端点成功
   */
  markSuccess(url: string): void {
    const endpoint = this.endpoints.find(e => e.url === url)
    if (endpoint) {
      endpoint.failureCount = 0
      endpoint.isHealthy = true
    }
  }

  /**
   * 获取所有端点的状态
   */
  getEndpointStatus(): APIEndpoint[] {
    return this.endpoints.map(e => ({ ...e }))
  }

  /**
   * 创建 OpenAI 客户端，自动处理故障切换
   */
  async createOpenAIClient(apiKey: string, operation: (client: OpenAI) => Promise<any>): Promise<any> {
    let lastError: any = null
    
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.getNextEndpoint()
      
      try {
        const client = new OpenAI({
          apiKey,
          baseURL: endpoint.url
        })
        
        const result = await operation(client)
        this.markSuccess(endpoint.url)
        return result
        
      } catch (error: any) {
        lastError = error
        this.markFailure(endpoint.url)
        
        console.error(`API request failed for ${endpoint.url}:`, error.message)
        
        // 如果是客户端错误或配置错误，不重试
        if (error.status === 401 || error.status === 403 || error.status === 400) {
          throw error
        }
        
        // 继续尝试下一个端点
        continue
      }
    }
    
    throw lastError || new Error('All API endpoints failed')
  }
}
