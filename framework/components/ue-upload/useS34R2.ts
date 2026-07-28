import { createUploadFileKey } from '@/framework/components/ue-upload/utils'
import { UeUploadProps } from '@/framework/components'
import { useRef, useState } from 'react'
import type { UploadProps } from 'antd'
import { t } from '@lingui/macro'

/**
 * 创建单次上传的浏览器侧追踪编号。
 * 编号只用于关联浏览器控制台与 Vercel Runtime Logs，不包含用户、文件名或登录凭据。
 * @returns {String} 单次上传请求的追踪编号
 */
function createUploadTraceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 将未知异常统一转换为包含可读信息的 Error，防止上传组件展示第三方内部错误标识。
 * @param {unknown} error - fetch、响应解析或回调阶段抛出的原始异常
 * @param {String} traceId - 当前上传请求的追踪编号
 * @returns {Error} 可传递给 Ant Design Upload 的标准错误对象
 */
function createUploadError(error: unknown, traceId: string): Error {
  const rawMessage = error instanceof Error ? error.message : String(error ?? '')
  const isMinifiedUploadError = /qEnA05/i.test(rawMessage)
  const readableMessage = isMinifiedUploadError
    ? '图片预校验失败，请重新选择图片后再试。'
    : rawMessage || '图片上传失败，请稍后重试。'

  if (error instanceof Error) {
    return new Error(`${readableMessage} (追踪编号: ${traceId})`)
  }

  return new Error(`${readableMessage} (追踪编号: ${traceId})`)
}

export default function useS34R2(props: UeUploadProps): Partial<UploadProps> {
  const skipAuthRef = useRef(props.skipAuth ?? false)
  skipAuthRef.current = props.skipAuth ?? false

  function uploadFile(url: string,
                      file: File,
                      onProgress: (event: ProgressEvent<EventTarget>) => void,
                      onSuccess: (ret: any, xhr: any) => void,
                      onError: (err: Error, ret: any) => void
  ) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onSuccess(xhr.response, xhr)
      } else {
        onError(new Error(t`Failed to upload file: ${xhr.statusText}`), xhr.response)
      }
    }
    xhr.onerror = () => {
      onError(new Error(t`Network error or CORS issue.`), null)
    }
    xhr.upload.onprogress = onProgress
    xhr.setRequestHeader('Content-Type', file.type)
    // 对文件进行压缩
    xhr.send(file)
    return {
      abort: () => xhr.abort()
    }
  }

  const compressImage = (file:File, callback:Function) => {
    const reader = new FileReader();

    reader.onload = (event:ProgressEvent<FileReader>) => {
      const img:HTMLImageElement = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        let scaleRatio = 0.5;
        if (img.width > 1024) {
          scaleRatio = 0.3;
        }
        const maxWidth = img.width * scaleRatio; // Dynamic maxWidth based on original width
        const maxHeight = img.height * scaleRatio; // Dynamic maxHeight maintaining aspect ratio

        let width = img.width;
        let height = img.height;

        // Calculate the new width and height
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height)

        // Compress the image
        canvas.toBlob((blob) => {
          if(blob){
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            callback(compressedFile);
          }else{
            callback(file)
          }
        }, 'image/jpeg', 0.6); // Adjust compression quality here
      };
      if(event.target && event.target.result){
        if (typeof event.target.result === 'string') {
          img.src = event.target.result
        }
      }
    };

    reader.readAsDataURL(file);
  };


  /**
   * 通过站内接口上传图片，并在每一阶段输出可关联的诊断信息。
   * @param {{ file: File, onSuccess: Function, onError: Function }} options - Ant Design Upload 的自定义请求参数
   * @returns {Promise<void>} 上传完成后通过回调通知组件状态
   */
  async function customRequest({ file, onSuccess, onError }: any): Promise<void> {
    const traceId = createUploadTraceId()

    try {
      const formData = new FormData()
      formData.append('file', file)
      console.info('[upload] request started', {
        traceId,
        fileSize: file.size,
        fileType: file.type || 'unknown',
      })
      const resp = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-Upload-Trace-Id': traceId,
          ...(skipAuthRef.current ? { 'X-Local-Skip-Auth': 'true' } : {}),
        },
      })
      const responseText = await resp.text()
      const responseTraceId = resp.headers.get('x-upload-trace-id') || traceId
      let result: { code?: number; message?: string; data?: { key?: string } } = {}

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch (error) {
        console.error('[upload] response was not JSON', {
          traceId: responseTraceId,
          status: resp.status,
          contentType: resp.headers.get('content-type'),
          error,
        })
        throw new Error(`Upload service returned an invalid response (${resp.status}).`)
      }

      if (!resp.ok || result.code !== 200) {
        throw new Error(result.message || `Upload failed (${resp.status}).`)
      }

      const uploadKey = result.data?.key
      if (!uploadKey) {
        throw new Error('Upload service did not return an image key.')
      }

      file.extra = { key: uploadKey, action: '' }
      console.info('[upload] request completed', { traceId: responseTraceId, uploadKey })
      onSuccess(result, null as any)
    } catch (error: unknown) {
      const uploadError = createUploadError(error, traceId)
      console.error('[upload] request failed', { traceId, error: uploadError })
      onError(uploadError, null)
    }
  }

  async function handleBeforeUpload(file: any, files: any[]) {
    const traceId = createUploadTraceId()

    try {
      const key = createUploadFileKey(file?.name ?? '', props, true)
      file.extra = { key, action: '' }
      console.info('[upload] beforeUpload started', {
        traceId,
        fileName: file?.name ?? 'unknown',
        fileSize: file?.size ?? 0,
      })

      if (!props.onBeforeUpload) return file

      const result = await props.onBeforeUpload(file, files)
      console.info('[upload] beforeUpload completed', { traceId, allowed: result !== false })
      return result
    } catch (error: unknown) {
      const uploadError = createUploadError(error, traceId)
      console.error('[upload] beforeUpload failed', {
        traceId,
        fileName: file?.name ?? 'unknown',
        error: uploadError,
        rawError: error,
      })
      throw uploadError
    }
  }

  const [uploadConfig, setUploadConfig] = useState<UploadProps>({
    action: '',
    method: 'PUT',
    multiple: false,
    maxCount: 1,
    name: 'data',
    customRequest,
    beforeUpload: handleBeforeUpload
  })


  return uploadConfig
}
