import { NextRequest } from 'next/server'
import { R } from '@/framework/utils'
import { createPutSingedUrl, getBucket } from '@/framework/utils/s34r2'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ALIBABA_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis'
const S3_PUBLIC_PATH = process.env.UE_S3_PUBLIC_PATH || ''
const S3_ENDPOINT = process.env.UE_S3_ENDPOINT || ''
const S3_REGION = process.env.UE_S3_REGION || 'auto'
const S3_ACCESS_KEY = process.env.UE_S3_ACCESS_KEY || ''
const S3_SECRET_KEY = process.env.UE_S3_SECRET_KEY || ''
const S3_BUCKET = getBucket()

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

export async function POST(request: NextRequest) {
  try {
    const { imageKey, expandDirection, alignment, prompt } = await request.json()
    if (!imageKey) {
      return R.bad('imageKey is required')
    }

    // 1. 获取 S3 图片 URL
    const imageUrl = `${S3_PUBLIC_PATH}/${imageKey}`

    // 2. 调用阿里云通义万相 API
    const scaleParams = getScaleParams(expandDirection || '16:9')
    const aliyunBody = {
      model: 'image-out-painting',
      input: {
        image_url: imageUrl,
      },
      parameters: {
        x_scale: scaleParams.x_scale,
        y_scale: scaleParams.y_scale,
        prompt: prompt || '',
      },
    }

    const aliyunResponse = await fetch(ALIBABA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ALIBABA_API_KEY}`,
      },
      body: JSON.stringify(aliyunBody),
    })

    const result = await aliyunResponse.json()
    if (result.code) {
      console.error('阿里云 API 错误:', result)
      return R.error(result.message || '阿里云 API 调用失败')
    }

    // 3. 处理结果（可能同步返回或异步任务）
    let outputImageUrl: string | null = null

    if (result.output?.results?.[0]?.url) {
      // 同步返回结果 URL
      outputImageUrl = result.output.results[0].url
    } else if (result.output?.results?.[0]?.image) {
      // 同步返回 base64 图片
      const imageBuffer = Buffer.from(result.output.results[0].image, 'base64')
      const outputKey = `output/${Date.now()}_${imageKey.replace(/[/\\]/g, '_')}`
      outputImageUrl = await uploadResultToS3(outputKey, imageBuffer, 'image/png')
    } else if (result.output?.task_id) {
      // 异步任务：轮询等待结果
      outputImageUrl = await pollAsyncResult(result.output.task_id)
    }

    if (!outputImageUrl) {
      return R.error('Failed to get output image')
    }

    // 4. 如果结果是临时 URL，下载并保存到 S3
    if (outputImageUrl.startsWith('http') && !outputImageUrl.includes(S3_PUBLIC_PATH)) {
      const response = await fetch(outputImageUrl)
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer())
        const contentType = response.headers.get('content-type') || 'image/png'
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? '.jpg' : '.png'
        const outputKey = `output/${Date.now()}_${imageKey.replace(/[/\\]/g, '_')}${ext}`
        outputImageUrl = await uploadResultToS3(outputKey, buffer, contentType)
      }
    }

    return R.ok({ url: outputImageUrl })
  } catch (error: any) {
    console.error('扩图失败:', error)
    return R.error(error.message || '扩图处理失败')
  }
}

// 轮询异步任务结果
async function pollAsyncResult(taskId: string, maxRetries = 60): Promise<string | null> {
  const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.ALIBABA_API_KEY}`,
      },
    })
    const result = await response.json()

    if (result.output?.task_status === 'SUCCEEDED') {
      return result.output.results?.[0]?.url || result.output.results?.[0]?.image || null
    }
    if (result.output?.task_status === 'FAILED') {
      throw new Error(result.output.message || 'Async task failed')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error('Async task timeout')
}
