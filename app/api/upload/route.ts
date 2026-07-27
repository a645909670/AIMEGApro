import { NextRequest } from 'next/server'
import { R } from '@/framework/utils'
import { createPutSingedUrl } from '@/framework/utils/s34r2'
import { createUploadFileKey } from '@/framework/components/ue-upload/utils'
import { getAuthUser } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser?.email) {
      return R.bad('Please sign in before uploading.')
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return R.bad('No file provided')
    }

    const key = createUploadFileKey(file.name, { dir: '/input/origin', withTimestamp: true } as any, true)
    const putUrl = await createPutSingedUrl(key)

    // 服务器端上传到 R2
    const uploadResp = await fetch(putUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    if (!uploadResp.ok) {
      return R.error('Upload to storage failed')
    }

    console.log(`[上传日志] 文件名: ${file.name}, 大小: ${file.size}, 路径: ${key}`)

    return R.ok({ key })
  } catch (error: any) {
    console.error('上传失败:', error)
    return R.error(error.message || 'Upload failed')
  }
}
