import { ref, computed } from 'vue'

// 配置
const CONFIG = {
  // 验证码
  VERIFY_KEY: 'dify_chat_verified',
  VERIFY_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24小时

  // 速率限制
  RATE_LIMIT_KEY: 'dify_chat_rate',
  MAX_PER_HOUR: 1000,
  MAX_PER_DAY: 5000,
  MAX_LENGTH: 10000,

  // 敏感词黑名单
  SENSITIVE_WORDS: [
    // SQL注入
    'drop table', 'delete from', 'truncate', 'insert into', 'update set',
    'script>alert', '<script', 'javascript:', 'onerror=',
    'eval(', 'exec(', 'system(', 'shell_exec(',
    // 恶意命令
    'rm -rf', '> /dev/', 'cat /etc/', 'wget http',
    'curl http', 'curl https',
    // 其他
    'password', '123456', 'admin', 'root',
    'test', 'test123', 'test1'
  ] as const,
} as const

interface RateLimitData {
  hourly: { [key: string]: number }
  daily: { [key: string]: number }
  lastResetHour: number
  lastResetDay: number
  requestHistory: number[]
}

export function useSecurity() {
  const isVerified = ref(false)
  const needVerification = computed(() => !isVerified.value)
  const rateLimitError = ref<string | null>(null)

  // 检查是否需要验证
  function checkVerificationStatus(): boolean {
    try {
      const verified = localStorage.getItem(CONFIG.VERIFY_KEY)
      if (!verified) return false

      const data = JSON.parse(verified)
      const now = Date.now()
      return (now - data.timestamp) < CONFIG.VERIFY_EXPIRY_MS
    } catch {
      return false
    }
  }

  // 标记已验证
  function markVerified() {
    localStorage.setItem(CONFIG.VERIFY_KEY, JSON.stringify({
      timestamp: Date.now()
    }))
    isVerified.value = true
  }

  // 生成验证码
  function generateCaptcha(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 验证验证码
  function verifyCaptcha(input: string, expected: string): boolean {
    return input.toUpperCase() === expected.toUpperCase()
  }

  // 检查速率限制
  function checkRateLimit(query: string): { allowed: boolean, reason?: string } {
    const now = Date.now()
    const currentHour = Math.floor(now / (60 * 60 * 1000))
    const currentDay = Math.floor(now / (24 * 60 * 60 * 1000))

    let data: RateLimitData
    try {
      const stored = localStorage.getItem(CONFIG.RATE_LIMIT_KEY)
      data = stored ? JSON.parse(stored) : {
        hourly: {},
        daily: {},
        lastResetHour: currentHour,
        lastResetDay: currentDay,
        requestHistory: []
      }
    } catch {
      data = {
        hourly: {},
        daily: {},
        lastResetHour: currentHour,
        lastResetDay: currentDay,
        requestHistory: []
      }
    }

    // 按小时重置
    if (data.lastResetHour !== currentHour) {
      data.hourly = {}
      data.lastResetHour = currentHour
    }

    // 按天重置
    if (data.lastResetDay !== currentDay) {
      data.daily = {}
      data.requestHistory = []
      data.lastResetDay = currentDay
    }

    const hourKey = String(currentHour)
    const dayKey = String(currentDay)

    const hourlyCount = (data.hourly[hourKey] || 0) + 1
    const dailyCount = (data.daily[dayKey] || 0) + 1

    // 检查限制
    if (hourlyCount > CONFIG.MAX_PER_HOUR) {
      return { allowed: false, reason: '请求过于频繁，请稍后再试' }
    }
    if (dailyCount > CONFIG.MAX_PER_DAY) {
      return { allowed: false, reason: '今日请求次数已达上限，请明天再试' }
    }

    // 记录请求
    data.hourly[hourKey] = hourlyCount
    data.daily[dayKey] = dailyCount
    data.requestHistory.push(now)

    // 只保留最近100条历史记录（用于行为检测）
    if (data.requestHistory.length > 100) {
      data.requestHistory = data.requestHistory.slice(-100)
    }

    localStorage.setItem(CONFIG.RATE_LIMIT_KEY, JSON.stringify(data))
    rateLimitError.value = null

    return { allowed: true }
  }

  // 检查文本长度
  function checkLength(query: string): { allowed: boolean, reason?: string } {
    if (query.length > CONFIG.MAX_LENGTH) {
      return { allowed: false, reason: `消息过长，最多支持${CONFIG.MAX_LENGTH}个字符` }
    }
    return { allowed: true }
  }

  // 检查敏感词
  function checkSensitiveWords(query: string): { allowed: boolean, reason?: string } {
    const lowerQuery = query.toLowerCase()
    for (const word of CONFIG.SENSITIVE_WORDS) {
      if (lowerQuery.includes(word.toLowerCase())) {
        return { allowed: false, reason: '输入内容包含敏感词汇，请重新输入' }
      }
    }
    return { allowed: true }
  }

  // 检查行为模式
  function checkBehaviorPattern(query: string): { allowed: boolean, reason?: string } {
    try {
      const stored = localStorage.getItem(CONFIG.RATE_LIMIT_KEY)
      if (!stored) return { allowed: true }

      const data: RateLimitData = JSON.parse(stored)
      const now = Date.now()
      const recentRequests = data.requestHistory.filter(t => now - t < 60000) // 最近1分钟

      // 检查过于频繁的请求（1分钟内超过10次）
      if (recentRequests.length > 10) {
        return { allowed: false, reason: '请求过于频繁，请稍后再试' }
      }

      // 检查重复输入
      if (data.requestHistory.length >= 2) {
        const lastTime = data.requestHistory[data.requestHistory.length - 1]
        const prevTime = data.requestHistory[data.requestHistory.length - 2]

        // 连续两次相同输入（通过时间判断，实际应该存输入哈希）
        if (now - lastTime < 1000) {
          return { allowed: false, reason: '发送过快，请稍后再试' }
        }
      }

      return { allowed: true }
    } catch {
      return { allowed: true }
    }
  }

  // 综合验证（排除固定prompt）
  function validateQuery(query: string, isFixedPrompt: boolean = false): { allowed: boolean, reason?: string } {
    // 固定prompt跳过所有检查
    if (isFixedPrompt) {
      return { allowed: true }
    }

    // 检查验证状态
    if (!checkVerificationStatus()) {
      return { allowed: false, reason: 'need_verification' }
    }

    // 检查长度
    const lengthCheck = checkLength(query)
    if (!lengthCheck.allowed) return lengthCheck

    // 检查敏感词
    const sensitiveCheck = checkSensitiveWords(query)
    if (!sensitiveCheck.allowed) return sensitiveCheck

    // 检查行为模式
    const behaviorCheck = checkBehaviorPattern(query)
    if (!behaviorCheck.allowed) return behaviorCheck

    // 检查速率限制
    const rateCheck = checkRateLimit(query)
    if (!rateCheck.allowed) return rateCheck

    return { allowed: true }
  }

  // 初始化验证状态
  function init() {
    isVerified.value = checkVerificationStatus()
  }

  return {
    isVerified,
    needVerification,
    rateLimitError,
    generateCaptcha,
    verifyCaptcha,
    markVerified,
    validateQuery,
    init
  }
}
