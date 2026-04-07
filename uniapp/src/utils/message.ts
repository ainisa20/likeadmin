/**
 * 消息提示工具（uView）
 * 用于替换 PC 端的 ElMessage
 */

export const toast = {
  warning: (msg: string) => {
    uni.$u.toast(msg)
  },
  error: (msg: string) => {
    uni.$u.toast(msg)
  },
  success: (msg: string) => {
    uni.$u.toast(msg)
  }
}
