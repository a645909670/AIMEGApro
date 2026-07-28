import { NextRequest } from 'next/server'
import { R } from '@/framework/utils'
import { createPutSingedUrl } from '@/framework/utils/s34r2'
import { createUploadFileKey } from '@/framework/components/ue-upload/utils'
import { getAuthUser } from '@/auth'

/**
 * 从请求头读取并净化浏览器上传追踪编号，避免日志被任意请求头注入。
 * @param {NextRequest} request - 当前上传请求
 * @returns {String} 仅由字母、数字和连字符组成的日志关联编号
 */
function getUploadTraceId(request: NextRequest): string {
  const headerTraceId = request.headers.get('x-upload-trace-id') ?? ''
  if (/^[a-zA-Z0-9-]{8,64}$/.test(headerTraceId)) return headerTraceId

  return crypto.randomUUID()
}

/**
 * 为所有上传接口响应附加追踪编号，便于将浏览器报错与 Vercel Runtime Logs 关联。
 * @param {Response} response - 待返回的接口响应
 * @param {String} traceId - 当前上传请求的追踪编号
 * @returns {Response} 已附加追踪编号的响应
 */
function withUploadTraceId(response: Response, traceId: string): Response {
  response.headers.set('x-upload-trace-id', traceId)
  return response
}

export async function POST(request: NextRequest) {
  const traceId = getUploadTraceId(request)

  try {
    console.info('[upload] request received', {
      traceId,
      contentLength: request.headers.get('content-length') ?? 'unknown',
      contentType: request.headers.get('content-type') ?? 'unknown',
    })
    const authUser = await getAuthUser()
    if (!authUser?.email) {
      console.warn('[upload] rejected because no authenticated user was found', { traceId })
      return withUploadTraceId(R.bad('Please sign in before uploading.'), traceId)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      console.warn('[upload] rejected because the file field is missing', { traceId })
      return withUploadTraceId(R.bad('No file provided'), traceId)
    }

    const key = createUploadFileKey(file.name, { dir: '/input/origin', withTimestamp: true } as any, true)
    console.info('[upload] form data parsed', {
      traceId,
      fileSize: file.size,
      fileType: file.type || 'unknown',
      key,
    })
    const putUrl = await createPutSingedUrl(key)
    console.info('[upload] R2 signed URL created', { traceId })

    // 服务器端上传到 R2
    const uploadResp = await fetch(putUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    if (!uploadResp.ok) {
      console.error('[upload] R2 upload failed', {
        traceId,
        status: uploadResp.status,
        statusText: uploadResp.statusText,
      })
      return withUploadTraceId(R.error('Upload to storage failed'), traceId)
    }

    console.info('[upload] request completed', { traceId, fileSize: file.size, key })

    return withUploadTraceId(R.ok({ key, traceId }), traceId)
  } catch (error: any) {
    console.error('[upload] request failed unexpectedly', {
      traceId,
      errorName: error?.name ?? 'UnknownError',
      errorMessage: error?.message ?? 'Upload failed',
    })
    return withUploadTraceId(R.error('Upload service failed. Please try again.'), traceId)
  }
}
