import { createUploadFileKey } from '@/framework/components/ue-upload/utils'
import { UeUploadProps } from '@/framework/components'
import { useState } from 'react'
import type { UploadProps } from 'antd'
import { t } from '@lingui/macro'

export default function useS34R2(props: UeUploadProps): Partial<UploadProps> {


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
   /* compressImage(file, (compressedFile:File) => {
      console.log('Compressed file size:', compressedFile.size);
      xhr.send(compressedFile)
    });*/
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
   * 通过站内接口上传图片，统一由服务端完成 R2 写入。
   * Vercel 开启尾斜杠规则后，/api/upload 会先返回 308；multipart 请求直接访问
   * /api/upload/ 可避免重定向导致上传组件得到非 JSON 响应并显示无意义错误标识。
   * @param {{ file: File, onSuccess: Function, onError: Function }} options - Ant Design Upload 的自定义请求参数
   * @returns {Promise<void>} 上传完成后通过回调通知组件状态
   */
  async function customRequest({ file, onSuccess, onError }: any): Promise<void> {
    // 通过服务器代理上传（避免浏览器 CORS 限制）
    try {
      const formData = new FormData()
      formData.append('file', file)
      const resp = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      const responseText = await resp.text()
      let result: { code?: number; message?: string; data?: { key?: string } } = {}

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch (error) {
        console.error('Failed to parse upload response:', error)
        throw new Error(`Upload service returned an invalid response (${resp.status}).`)
      }

      if (!resp.ok) {
        throw new Error(result.message || `Upload failed (${resp.status}).`)
      }
      const uploadKey = result.data?.key
      if (result.code === 200 && uploadKey) {
        file.extra = { key: uploadKey, action: '' }
        onSuccess(result, null as any)
        return
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (e: any) {
      console.error('Image upload request failed:', e)
      onError(e, null)
    }
  }

  async function handleBeforeUpload(file: any, files: any[]) {
    const key = createUploadFileKey(file!.name, props, true)
    file.extra = { key, action: '' }
    if (props.onBeforeUpload) {
      return props.onBeforeUpload(file, files)
    }
    return file
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
