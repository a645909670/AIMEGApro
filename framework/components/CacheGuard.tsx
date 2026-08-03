'use client'

import { useEffect } from 'react'
import { message } from 'antd'

const APP_VERSION_STORAGE_KEY = 'aimega-app-version'
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? 'default'

/**
 * 检测前端版本变化，避免浏览器继续使用旧页面状态。
 * 版本变化时只刷新一次页面，不清理用户的登录信息或生成任务数据。
 */
export default function CacheGuard() {
  useEffect(() => {
    try {
      const previousVersion = window.localStorage.getItem(APP_VERSION_STORAGE_KEY)

      if (previousVersion && previousVersion !== APP_VERSION) {
        window.localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION)
        window.location.reload()
        return
      }

      window.localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION)
    } catch (error) {
      console.error('[cache] failed to check application version', error)
      message.error('页面版本检查失败，请刷新页面重试。')
    }
  }, [])

  return null
}
