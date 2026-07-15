import { NextRequest } from 'next/server'
import { R } from '@/framework/utils'
import { getBucket } from '@/framework/utils/s34r2'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const S3_PUBLIC_PATH = process.env.UE_S3_PUBLIC_PATH || ''
const S3_ENDPOINT = process.env.UE_S3_ENDPOINT || ''
const S3_REGION = process.env.UE_S3_REGION || 'auto'
const S3_ACCESS_KEY = process.env.UE_S3_ACCESS_KEY || ''
const S3_SECRET_KEY = process.env.UE_S3_SECRET_KEY || ''
const S3_BUCKET = getBucket()

// 百炼业务空间 ID，格式如: "maas" 或自定义
const DASHSCOPE_WORKSPACE_ID = process.env.DASHSCOPE_WORKSPACE_ID || ''
const ALIBABA_API_KEY = process.env.ALIBABA_API_KEY || ''

// 计算扩展倍数
function getScaleParams(expandDirection: string) {
  switch (expandDirection) {
    case '16:9':
      return { x_scale: 1.78, y_scale: 1.0 }
    case '9:16':
      return { x_scale: 1.0, y_scale: 1.78 }
    case '1:1':
      return { x_scale: 1.5, y_scale: 1.5 }
    default:
      return { x_scale: 1.5, y_scale: 1.0 }
  }
}

// 上传结果图片到 S3
async function uploadResultToS3(key: string, imageBuffer: Buffer, contentType: string) {
  const client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
  })

  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
    })
  )
  return `${S3_PUBLIC_PATH}/${key}`
}

export async function POST(request: NextRequest) {
  try {
    const { imageKey, expandDirection, alignment, prompt } = await request.json()
    if (!imageKey) {
      return R.bad('imageKey is required')
    }

    // 1. 获取 S3 图片 URL
    const imageUrl = `${S3_PUBLIC_PATH}/${imageKey}`

    // 2. 调用阿里云通义万相 API（异步模式）
    const scaleParams = getScaleParams(expandDirection || '16:9')
    const workspaceEndpoint = `https://${DASHSCOPE_WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/image2image/out-painting`

    const aliyunResponse = await fetch(workspaceEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ALIBABA_API_KEY}`,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'image-out-painting',
        input: {
          image_url: imageUrl,
        },
        parameters: {
          x_scale: scaleParams.x_scale,
          y_scale: scaleParams.y_scale,
          prompt: prompt || '',
        },
      }),
    })

    const result = await aliyunResponse.json()
    if (result.code) {
      console.error('阿里云 API 错误:', result)
      return R.error(result.message || '阿里云 API 调用失败')
    }

    // 3. 异步任务：轮询等待结果
    const taskId = result.output?.task_id
    if (!taskId) {
      return R.error('No task_id in response')
    }

    const outputImageUrl = await pollAsyncResult(taskId)
    if (!outputImageUrl) {
      return R.error('Failed to get output image')
    }

    // 4. 如果结果是临时 URL，下载并保存到 S3
    let finalUrl = outputImageUrl
    if (outputImageUrl.startsWith('http') && !outputImageUrl.includes(S3_PUBLIC_PATH)) {
      const imageResp = await fetch(outputImageUrl)
      if (imageResp.ok) {
        const buffer = Buffer.from(await imageResp.arrayBuffer())
        const contentType = imageResp.headers.get('content-type') || 'image/png'
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? '.jpg' : '.png'
        const outputKey = `output/${Date.now()}_${imageKey.replace(/[/\\]/g, '_')}${ext}`
        finalUrl = await uploadResultToS3(outputKey, buffer, contentType)
      }
    }

    return R.ok({ url: finalUrl })
  } catch (error: any) {
    console.error('扩图失败:', error)
    return R.error(error.message || '扩图处理失败')
  }
}

// 轮询异步任务结果
async function pollAsyncResult(taskId: string, maxRetries = 120): Promise<string | null> {
  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(taskUrl, {
      headers: {
        'Authorization': `Bearer ${ALIBABA_API_KEY}`,
      },
    })
    const result = await response.json()

    if (result.output?.task_status === 'SUCCEEDED') {
      return result.output.results?.[0]?.url || result.output.results?.[0]?.image || null
    }
    if (result.output?.task_status === 'FAILED') {
      throw new Error(result.output.message || '异步任务失败')
    }

    // 每 2 秒轮询一次
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  throw new Error('异步任务超时')
}
