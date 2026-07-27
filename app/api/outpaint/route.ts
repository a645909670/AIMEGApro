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
/**
 * 单个登录用户在北京时间自然日内最多可创建的有效图片生成任务数。
 * 状态为 FAILED 的任务不占用额度，便于用户在生成失败后重新尝试。
 */
const DAILY_GENERATION_LIMIT = 3
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

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
/**
 * 统计登录用户在北京时间当天已创建的有效生成任务。
 * @param email 登录用户邮箱
 * @returns 当日用量及剩余可生成次数
 */
async function checkDailyLimit(email: string): Promise<{ allowed: boolean; used: number; limit: number; remaining: number }> {
  // 使用北京时间（UTC+8）作为统计基准
  const now = new Date()
  const beijingOffset = 8 * 60 * 60 * 1000 // UTC+8 的毫秒数
  const beijingNow = new Date(now.getTime() + beijingOffset)
  // 不调用 setHours，避免受到 Node 进程本地时区影响。
  const todayStart = new Date(beijingNow.getTime() - beijingOffset) // 转回 UTC 用于数据库查询

  /**
   * t_outpaint_task 的 create_time 存储为“北京时间墙上时间”的 timestamp，
   * 因此查询边界同样需要构造为北京时间 00:00，而不是转换成 UTC 的前一天 16:00。
   * 使用 getUTC* 可避免部署服务器自身时区影响每日额度的重置时刻。
   */
  todayStart.setTime(Date.UTC(
    beijingNow.getUTCFullYear(),
    beijingNow.getUTCMonth(),
    beijingNow.getUTCDate(),
    0,
    0,
    0,
  ))
  const tomorrowStart = new Date(Date.UTC(
    beijingNow.getUTCFullYear(),
    beijingNow.getUTCMonth(),
    beijingNow.getUTCDate() + 1,
    0,
    0,
    0,
  ))
  const usedCount = await prisma.outpaintTask.count({
    where: {
      createdAt: { gte: todayStart, lt: tomorrowStart },
      userEmail: email,
      status: { not: 'FAILED' },
    },
  })
  const remaining = Math.max(DAILY_GENERATION_LIMIT - usedCount, 0)
  return {
    allowed: remaining > 0,
    used: usedCount,
    limit: DAILY_GENERATION_LIMIT,
    remaining,
  }
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
  if (request.nextUrl.searchParams.get('quota') === '1') {
    try {
      const authUser = await getAuthUser()
      if (!authUser?.email) return R.bad('Please sign in before generating images.')

      return R.ok(await checkDailyLimit(authUser.email))
    } catch (error: any) {
      console.error('Failed to load daily generation quota:', error)
      return R.error('Failed to load daily generation quota.')
    }
  }

  const taskId = request.nextUrl.searchParams.get('taskId')
  if (!taskId) return R.bad('taskId is required')

  const task = await prisma.outpaintTask.findUnique({ where: { taskId } })
  if (!task) return R.error('Task not found')

  // GPT 模型（taskId 以 task_ 开头）：代理查询 right.codes 实时状态
  if (taskId.startsWith('task_') && task.status === 'PROCESSING') {
    try {
      const pollResp = await fetch('https://www.right.codes/v1/tasks/' + taskId, {
        headers: { 'Authorization': 'Bearer ' + GPT_IMAGE2_KEY },
      })
      const pollResult = await pollResp.json()
      const rtStatus = pollResult.status || pollResult.data?.status || ''
      // right.codes 完成后可能不返回 status，直接返回 data 数组
      const hasDataUrl = pollResult.data?.[0]?.url || pollResult.data?.[0]?.b64_json || pollResult.data?.url || pollResult.url || pollResult.result
      const isCompleted = rtStatus === 'succeeded' || rtStatus === 'completed' || rtStatus === 'success' || rtStatus === 'SUCCEEDED' || hasDataUrl
      console.log('GPT 代理查询, 状态:', rtStatus, '有返回数据:', !!hasDataUrl)

      if (isCompleted) {
        const imageUrl = pollResult.data?.[0]?.url || pollResult.data?.[0]?.b64_json || pollResult.data?.output?.[0] || pollResult.output?.[0] ||
          pollResult.data?.url || pollResult.url || pollResult.result ||
          pollResult.data?.image_url || pollResult.data?.image || pollResult.output?.image_url ||
          pollResult.output_image_url || pollResult.image_url
        if (imageUrl) {
          const resultResp = await saveResult(task, task.taskId, imageUrl)
          const resultData = await resultResp.json()
          return R.ok(resultData.data || resultData)
        }
        return R.ok({ taskId, status: 'FAILED', errorMessage: 'GPT 任务成功但未找到图片URL' })
      }
      if (rtStatus === 'failed' || rtStatus === 'FAILED') {
        await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'FAILED', errorMessage: pollResult.error?.message || 'GPT 处理失败' } })
        return R.ok({ taskId, status: 'FAILED', errorMessage: pollResult.error?.message || 'GPT 处理失败' })
      }
      // 还在处理中，返回 PROCESSING
      return R.ok({ taskId, status: 'PROCESSING' })
    } catch (e: any) {
      console.error('GPT 代理查询失败:', e.message)
      return R.ok({ taskId, status: 'PROCESSING' })
    }
  }

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
  const { imageKey, model, expandDirection, alignment, prompt, action } = body

  if (action === 'process') {
    return processTask(body.taskId, body.model || 'tongyi')
  }

  if (!imageKey) return R.bad('imageKey is required')
  const dir = expandDirection || '16:9'
  const useModel = model || 'tongyi'

  // 获取登录用户信息（未登录则用 IP）
  let userEmail: string | null = null
  try {
    const authUser = await getAuthUser()
    userEmail = authUser?.email || null
  } catch { /* 未登录用户 */ }

  if (!userEmail) return R.bad('Please sign in before generating images.')

  const ip = getClientIp(request)

  try {
    const quota = await checkDailyLimit(userEmail)
    if (!quota.allowed) return R.bad('Daily generation limit reached. Please try again tomorrow.')
  } catch (error: any) {
    console.error('Failed to verify daily generation quota:', error)
    return R.error('Failed to verify daily generation quota.')
  }

  // GPT 模型：先调用 right.codes API 获取 task_id，以此作为数据库 taskId
  if (useModel === 'gpt-image-2') {
    try {
      const imageUrl = `${S3_PUBLIC_PATH}/${imageKey}`
      const imageResp = await fetch(imageUrl)
      if (!imageResp.ok) return R.error('获取图片失败')
      const buf = Buffer.from(await imageResp.arrayBuffer())
      const base64 = buf.toString('base64')
      const mime = imageResp.headers.get('content-type') || 'image/png'

      const apiResp = await fetch('https://www.right.codes/draw/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GPT_IMAGE2_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nano-banana-2-lite',
          prompt: prompt || 'Expand this image naturally, keep the style consistent',
          n: 1, size: dir,
          async: true,
          image: [`data:${mime};base64,${base64}`],
        }),
      })
      const result = await apiResp.json()
      const rtTaskId = result.task_id || result.id
      if (!rtTaskId) return R.error('right.codes 未返回 task_id: ' + JSON.stringify(result).slice(0, 200))

      await prisma.outpaintTask.create({
        data: { taskId: rtTaskId, imageKey, expandDirection: dir, alignment: alignment || 'Middle', prompt: prompt || '', status: 'PENDING', userEmail, ipAddress: userEmail ? null : ip },
      })
      return R.ok({ taskId: rtTaskId, status: 'PENDING' })
    } catch (err: any) {
      return R.error('right.codes 调用失败: ' + err.message)
    }
  }

  // 通义万相：使用本地 taskId
  const taskId = nanoid()
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

/** 下载结果图片并保存到 S3，更新任务状态，返回 NextResponse */
async function saveResult(task: any, taskId: string, resultUrl: string) {
  let finalUrl = resultUrl
  if (resultUrl.startsWith('http') && !resultUrl.includes(S3_PUBLIC_PATH)) {
    const imageResp = await fetch(resultUrl)
    if (imageResp.ok) {
      const buf = Buffer.from(await imageResp.arrayBuffer())
      const ct = imageResp.headers.get('content-type') || 'image/png'
      const ext = ct.includes('jpeg') ? '.jpg' : '.png'
      const baseName = task.imageKey.replace(/[/\\]/g, '_').replace(/\.[^.]+$/, '')
      finalUrl = await uploadResultToS3(`output/${Date.now()}_${baseName}${ext}`, buf, ct)
    }
  }
  await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'SUCCEEDED', resultUrl: finalUrl } })
  return R.ok({ taskId, status: 'SUCCEEDED', resultUrl: finalUrl })
}

/** GPT-IMAGE-2 模型扩图 */
const GPT_IMAGE2_KEY = process.env.GPT_IMAGE2_KEY || ''

async function processWithOpenAI(task: any, taskId: string) {
  console.log('=== GPT-IMAGE-2 标记处理中 ===', { taskId })
  // right.codes 已在提交时调用，这里仅将任务标记为 PROCESSING
  // 前端轮询 GET /api/outpaint?taskId=xxx 时会代理查询 right.codes 实时状态
  await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'PROCESSING' } })
  return R.ok({ taskId, status: 'PROCESSING' })
}

async function processTask(taskId: string, model: string = 'tongyi') {
  const task = await prisma.outpaintTask.findUnique({ where: { taskId } })
  if (!task) return R.error('Task not found')
  if (task.status !== 'PENDING') return R.ok({ taskId, status: task.status, resultUrl: task.resultUrl })

  await prisma.outpaintTask.update({ where: { taskId }, data: { status: 'PROCESSING' } })

  try {
    if (model === 'gpt-image-2') {
      return await processWithOpenAI(task, taskId)
    }
    // 默认使用通义万相
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

    return await saveResult(task, taskId, outputImageUrl)
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
