import { NextRequest } from 'next/server'
import { R } from '@/framework/utils'

export async function POST(request: NextRequest) {
  const { fileName, fileSize, imageKey } = await request.json()
  console.log(`[上传日志] 文件名: ${fileName}, 大小: ${fileSize}, 路径: ${imageKey}`)
  return R.ok({ logged: true })
}
