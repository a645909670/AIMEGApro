import { NextRequest } from 'next/server'
import { R } from '@/framework/utils'
import { getBucket } from '@/framework/utils/s34r2'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import prisma from '@/config/prisma'
import { getAuthUser } from '@/auth'

const S3_PUBLIC_PATH = process.env.UE_S3_PUBLIC_PATH || ''
const S3_ENDPOINT = process.env.UE_S3_ENDPOINT || ''
const S3_REGION = process.env.UE_S3_REGION || 'auto'
const S3_ACCESS_KEY = process.env.UE_S3_ACCESS_KEY || ''
const S3_SECRET_KEY = process.env.UE_S3_SECRET_KEY || ''
const S3_BUCKET = getBucket()
const DASHSCOPE_WORKSPACE_ID = process.env.DASHSCOPE_WORKSPACE_ID || ''
const ALIBABA_API_KEY = process.env.ALIBABA_API_KEY || ''

// 每日免费使用次数限制：登录用户 5 次，匿名用户 3 次
const DAILY_LIMIT_AUTHED = 5
const DAILY_LIMIT_ANON = 3

function getScaleParams(expandDirection: string) {
  switch (expandDirection) {
    case '16:9': return { x_scale: 1.78, y_scale: 1.0 }
    case '9:16': return { x_scale: 1.0, y_scale: 1.78 }
    case '1:1': return { x_scale: 1.5, y_scale: 1.5 }
    default: return { x_scale: 1.5, y_scale: 1.0 }
  }
}

function nanoid(len = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < len; i++) id += chars.charAt(Math.floor(Math.random() * chars.length))
  return id
}

/** 获取客户端真实 IP */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return '127.0.0.1'
}

/** 检查当日使用次数是否超限（登录用户5次，匿名用户3次） */
async function checkDailyLimit(email: string | null, ip: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  // 使用北京时间（UTC+8）作为统计基准
  const now = new Date()
  const beijingOffset = 8 * 60 * 60 * 1000 // UTC+8 的毫秒数
  const beijingNow = new Date(now.getTime() + beijingOffset)
  beijingNow.setHours(0, 0, 0, 0)
  const todayStart = new Date(beijingNow.getTime() - beijingOffset) // 转回 UTC 用于数据库查询

  const limit = email ? DAILY_LIMIT_AUTHED : DAILY_LIMIT_ANON

  const where = email
    ? { createdAt: { gte: todayStart }, userEmail: email, status: { not: 'FAILED' } }
    : { createdAt: { gte: todayStart }, ipAddress: ip, status: { not: 'FAILED' } }

  const usedCount = await prisma.outpaintTask.count({ where })
  return { allowed: usedCount < limit, used: usedCount, limit }
}

async function uploadResultToS3(key: string, imageBuffer: Buffer, contentType: string) {
  const client = new S3Client({
    endpoint: S3_ENDPOINT, region: S3_REGION,
    credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  })
  await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: imageBuffer, ContentType: contentType }))
  return `${S3_PUBLIC_PATH}/${key}`
}

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId')
  if (!taskId) return R.bad('taskId is required')

  const task = await prisma.outpaintTask.findUnique({ where: { taskId } })
  if (!task) return R.error('Task not found')

  return R.ok({
    taskId: task.taskId,
    status: task.status,
    resultUrl: task.resultUrl,
    errorMessage: task.errorMessage,
  })
}

// 提交扩图任务
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { imageKey, expandDirection, alignment, prompt, action } = body

  if (action === 'process') {
    return processTask(body.taskId)
  }

  if (!imageKey) return R.bad('imageKey is required')
  const taskId = nanoid()
  const dir = expandDirection || '16:9'

  // 获取登录用户信息（未登录则用 IP）
  let userEmail: string | null = null
  try {
    const authUser = await getAuthUser()
    userEmail = authUser?.email || null
  } catch { /* 未登录用户 */ }

  // 提交前检查每日限制
  const ip = getClientIp(request)
  const { allowed, used, limit } = await checkDailyLimit(userEmail, ip)
  if (!allowed) {
    const tip = userEmail ? `今日免费扩图次数已用完（${used}/${limit}），请明天再试` : `今日免费扩图次数已用完（${used}/${limit}），请登录后获取更多使用次数`
    return R.error(tip)
  }

  try {
    await prisma.outpaintTask.create({
      data: { taskId, imageKey, expandDirection: dir, alignment: alignment || 'Middle', prompt: prompt || '', status: 'PENDING', userEmail, ipAddress: userEmail ? null : ip },
    })
    return R.ok({ taskId, status: 'PENDING' })
  } catch (error: any) {
    console.error('提交任务失败:', error)
    return R.error(error.message || '提交任务失败')
  }
}

async function processTask(taskId: string) {
  const task = await prisma.outpaintTask.findUnique({ where: { taskId } })
  if (!task) return R.error('Task not found')
  if (task.status !== 'PENDING') return R.ok({ taskId, status: task.status, resultUrl: task.resultUrl })

  await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'PROCESSING' } })

  try {
    const imageUrl = `${S3_PUBLIC_PATH}/${task.imageKey}`
    const scaleParams = getScaleParams(task.expandDirection)
    const workspaceEndpoint = `https://${DASHSCOPE_WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/image2image/out-painting`

    const aliyunResponse = await fetch(workspaceEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ALIBABA_API_KEY}`, 'X-DashScope-Async': 'enable' },
      body: JSON.stringify({
        model: 'image-out-painting',
        input: { image_url: imageUrl },
        parameters: { x_scale: scaleParams.x_scale, y_scale: scaleParams.y_scale, prompt: task.prompt || '' },
      }),
    })

    const result = await aliyunResponse.json()
    if (result.code) {
      await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'FAILED', errorMessage: result.message } })
      return R.error(result.message || '阿里云 API 调用失败')
    }

    const aliyunTaskId = result.output?.task_id
    if (!aliyunTaskId) {
      await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'FAILED', errorMessage: 'No task_id' } })
      return R.error('No task_id')
    }

    const outputImageUrl = await pollAsyncResult(aliyunTaskId)
    if (!outputImageUrl) {
      await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'FAILED', errorMessage: '获取结果超时' } })
      return R.error('获取结果超时')
    }

    let finalUrl = outputImageUrl
    if (outputImageUrl.startsWith('http') && !outputImageUrl.includes(S3_PUBLIC_PATH)) {
      const imageResp = await fetch(outputImageUrl)
      if (imageResp.ok) {
        const buffer = Buffer.from(await imageResp.arrayBuffer())
        const ct = imageResp.headers.get('content-type') || 'image/png'
        const ext = ct.includes('jpeg') ? '.jpg' : '.png'
        const baseName = task.imageKey.replace(/[/\\]/g, '_').replace(/\.[^.]+$/, '')
        finalUrl = await uploadResultToS3(`output/${Date.now()}_${baseName}${ext}`, buffer, ct)
      }
    }

    await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'SUCCEEDED', resultUrl: finalUrl } })
    return R.ok({ taskId, status: 'SUCCEEDED', resultUrl: finalUrl })
  } catch (error: any) {
    await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'FAILED', errorMessage: error.message } }).catch(() => {})
    return R.error(error.message || '处理失败')
  }
}

async function pollAsyncResult(aliyunTaskId: string, maxRetries = 120): Promise<string | null> {
  const workspaceBase = DASHSCOPE_WORKSPACE_ID
    ? `https://${DASHSCOPE_WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com`
    : 'https://dashscope.aliyuncs.com'
  const taskUrl = `${workspaceBase}/api/v1/tasks/${aliyunTaskId}`
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    const response = await fetch(taskUrl, { headers: { 'Authorization': `Bearer ${ALIBABA_API_KEY}` } })
    const result = await response.json()
    const status = result.output?.task_status
    if (status === 'SUCCEEDED') {
      return result.output?.output_image_url ?? result.output?.image_url ?? result.output?.url ??
        result.output?.results?.[0]?.url ?? result.output?.results?.[0]?.image ?? null
    }
    if (status === 'FAILED') throw new Error(result.output?.message || '异步任务失败')
  }
  throw new Error('异步任务超时')
}
