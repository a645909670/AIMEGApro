import { forwardRef, useImperativeHandle, useState } from 'react'
import { UeUploadProps, UeUploadRef } from './types'
import type { UploadFile } from 'antd'
import { message, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { UploadChangeParam } from 'antd/es/upload/interface'
import useCos from './useCos'
import useS34R2 from './useS34R2'

const { Dragger } = Upload


export const UeDropzoneUpload = forwardRef<
  UeUploadRef,
  UeUploadProps
>((props, ref) => {
  const { provider = 's34r2', skipAuth, ...uploadProps } = props
  const useProviderHook = 'cos' === provider ? useCos : useS34R2
  const uploadConfig = useProviderHook({ ...uploadProps, skipAuth })
  const [fileList, setFileList] = useState<UploadFile[]>([])

  useImperativeHandle(
    ref,
    () =>
      ({
        clearFileList: () => setFileList(()=>{return []})
      }) as any
  )

  function handleChange({ file, fileList }: UploadChangeParam) {
    const uploadStep = file.status ?? 'unknown'

    try {
      console.info('[upload] onChange received', {
        step: uploadStep,
        fileName: file.name ?? 'unknown',
        response: file.response,
      })

      if ('error' === file.status) {
        const rawError = file.error
        const rawMessage = rawError instanceof Error ? rawError.message : String(rawError ?? '')
        const readableMessage = /qEnA05/i.test(rawMessage)
          ? '图片上传预校验异常，请重新选择图片后再试。'
          : rawMessage || '图片上传失败，请稍后重试。'
        console.error('[upload] onChange upload failed', {
          step: uploadStep,
          fileName: file.name ?? 'unknown',
          rawError,
          response: file.response,
        })
        message.error(readableMessage)
        return
      }

      if ('done' !== file.status) return

      props?.onUploadFinish?.(file)
      // @ts-ignore
      props?.onChangeValue?.(file.extra?.key ?? '', file.extra)
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : String(error ?? '')
      const readableMessage = /qEnA05/i.test(rawMessage)
        ? '图片上传完成后的数据处理异常，请重新选择图片后再试。'
        : rawMessage || '图片上传后的数据处理失败，请稍后重试。'
      console.error('[upload] onChange callback failed', {
        step: uploadStep,
        fileName: file.name ?? 'unknown',
        error,
        response: file.response,
      })
      message.error(readableMessage)
    } finally {
      setFileList(fileList.slice())
    }
  }

  return (
    <Dragger
      ref={ref as any}
      maxCount={1}
      {...uploadProps}
      {...uploadConfig}
      fileList={fileList}
      onChange={handleChange}
    >
      {props?.children ?? <InboxOutlined />}
    </Dragger>
  )
})
UeDropzoneUpload.displayName = 'UeDropzoneUpload'
export default UeDropzoneUpload
