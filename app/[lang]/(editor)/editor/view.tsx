'use client'
import { Dropdown, DropdownItem, Skeleton, User } from '@nextui-org/react'
import { Dropdown as AntDropDown } from 'antd'
import { UeDropzoneUpload, UeUploadRef } from '@/framework/components'
import GoogleLogin from '@/framework/components/login/GoogleLogin'
import { GoogleLoginRef } from '@/framework/components/login/types'
import Payment from '@/framework/components/paypal/Payment'
import { PaymentRef } from '@/framework/components/paypal/types'
import { AVAILABLE_LOCALES } from '@/framework/locale/locale'
import { SessionUser } from '@/framework/types/sessionUser'

import { t } from '@lingui/macro'
import { signIn, useSession, signOut } from 'next-auth/react'
import {
  Avatar,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Navbar,
  Spinner,
  useDisclosure,
} from '@nextui-org/react'
import { $Enums } from '@prisma/client'
import { message, Spin } from 'antd'
import { FcGoogle } from 'react-icons/fc'
import { FaAngleRight, FaArrowUpFromBracket } from 'react-icons/fa6'
import { fetchGet, fetchPost } from '@/utils'
import {
  ArrowLeft,
  CreditCard,
  Eye,
  RefreshCcw,
  Trash2,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { Image as KonvaImage, Layer, Stage } from 'react-konva'
// import runpodSdk from 'runpod-sdk'
import { siteConfig } from '@/config/site'
import { motion } from 'framer-motion'
import {
  RiAspectRatioLine,
  RiLayoutTopLine,
  RiLayoutBottomLine,
  RiLayoutLeftLine,
  RiLayoutRightLine,
  RiLayoutTopFill,
  RiLayoutBottomFill,
  RiLayoutLeftFill,
  RiLayoutRightFill,
} from 'react-icons/ri'

// 当前仅使用提示词图生图，暂时隐藏扩图相关控件，后续可通过此开关恢复。
const SHOW_OUTPAINT_CONTROLS = false

/**
 * 提示词浮层占用的画布预留高度，避免图片缩放后被输入框遮挡。
 */
const PROMPT_PANEL_RESERVED_HEIGHT = 180

/**
 * 主画布图片相对于可用区域的最大显示比例，保留稳定留白并保持居中。
 */
const CANVAS_IMAGE_SCALE_RATIO = 0.8

/**
 * GPT Image 生成支持的画布比例选项，值会直接传给 right.codes 的 size 参数。
 */
type ImageGenerationSize = '1:1' | '16:9' | '9:16' | '4:3'
const IMAGE_SIZE_OPTIONS: ImageGenerationSize[] = ['1:1', '16:9', '9:16', '4:3']

/**
 * 编辑器支持的图像生成模型。
 */
type ImageGenerationModel = 'gpt-image-2' | 'nano-banana-2-lite' | 'nano-banana-2'

/**
 * 编辑器模型下拉框的可选项。
 */
/**
 * 登录用户当天的图片生成额度，由服务端根据有效任务记录计算。
 */
type DailyGenerationQuota = {
  limit: number
  remaining: number
}

type PersistedGenerationTask = {
  requestId: string
  taskId?: string
  model: ImageGenerationModel
  createdAt: number
}

const ACTIVE_GENERATION_TASK_STORAGE_KEY = 'editor-active-generation-task'
/**
 * 生成任务在当前页面最多持续等待的时间，超时后停止遮罩但保留后台任务。
 */
const MAX_TASK_WAIT_DURATION = 5 * 60 * 1000
const MAX_TASK_RESTORE_DURATION = 30 * 60 * 1000
/**
 * 任务状态正常轮询间隔，使用异步定时器避免阻塞页面交互。
 */
const TASK_POLL_INTERVAL = 2000
/**
 * 轮询请求异常时允许的最大退避间隔。
 */
const MAX_TASK_POLL_RETRY_INTERVAL = 8000

const EditorView: React.FC<{ params: { lang: AVAILABLE_LOCALES } }> = ({
  params,
}) => {
  const router = useRouter()
  const [msg, msgHolder] = message.useMessage()
  const paymentRef = useRef<PaymentRef>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageProps, setImageProps] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  /**
   * 仅在画布尺寸初始化完成后恢复历史生成任务，避免尺寸变化取消图片加载回调。
   */
  const isCanvasReady = canvasSize.width > 0 && canvasSize.height > 0
  const canvasSizeRef = useRef(canvasSize)
  canvasSizeRef.current = canvasSize
  const stageRef = useRef<any>(null)
  const loginRef = useRef<GoogleLoginRef>(null)
  const [selectedModel, setSelectedModel] = useState<ImageGenerationModel>('nano-banana-2-lite')
  const [promptText, setPromptText] = useState('')
  const [selectedImageSize, setSelectedImageSize] = useState<ImageGenerationSize>('1:1')
  const [dailyGenerationQuota, setDailyGenerationQuota] = useState<DailyGenerationQuota | null>(null)
  const [selectedExpandDirection, setSelectedExpandDirection] = useState<
    '16:9' | '9:16' | '1:1'
  >('16:9')
  const [selectedPosition, setSelectedPosition] = useState<
    'Middle' | 'Left' | 'Right' | 'Top' | 'Bottom'
  >('Middle')

  /**
   * 更新提示词方框中的模型选择，供模型按钮统一调用。
   * @param {ImageGenerationModel} model - 用户当前选择的图像生成模型
   * @returns {void}
   */
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  )
  const [isComparing, setIsComparing] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [mobileTopOptionsHeight, setMobileTopOptionsHeight] = useState(0)
  const uploadRef = useRef<UeUploadRef>(null)
  const hasRestoredTaskRef = useRef(false)
  // 原始图片的key
  const [originKey, setOriginKey] = useState<string | null>(null)
  // 添加一个新的 state 来存储 Stage 的样式
  const [stageStyle, setStageStyle] = useState({})
  // 获取当前用户信息
  const { data: session, status, update: updateSession } = useSession()
  const user = session?.user as SessionUser
  const isUnauthenticated = useMemo(
    () => 'unauthenticated' === status,
    [status],
  )
  const isAuthenticated = useMemo(() => 'authenticated' === status, [status])
  const dailyQuotaText = dailyGenerationQuota
    ? `Today: ${dailyGenerationQuota.remaining}/${dailyGenerationQuota.limit} left`
    : ''
  // 当前画布显示的图片对应的pathkey
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null)
  // 当前画布图片在对象存储中的 Key，仅用于下一次提交生成接口。
  const [currentImageKey, setCurrentImageKey] = useState<string | null>(null)
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false)
  const [showOriginalModal, setShowOriginalModal] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitModalMsg, setLimitModalMsg] = useState('')
  const [historyImages, setHistoryImages] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  /**
   * 标记任务是否因前端等待超时，避免页面继续显示不可操作的生成遮罩。
   */
  const [isGenerationTimedOut, setIsGenerationTimedOut] = useState(false)
  const [skipAuth, setSkipAuth] = useState(false) // 跳过登录验证开关
  const isLocalAuthBypass = process.env.NODE_ENV === 'development'
  const skipAuthRef = useRef(skipAuth)
  skipAuthRef.current = skipAuth // 实时同步，供闭包内读取
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [originalFileName, setOriginalFileName] = useState<string | null>(null)

  /**
   * 获取当前登录用户的当日生成额度，并同步到头像信息。
   */
  const refreshDailyGenerationQuota = useCallback(async () => {
    if (!isAuthenticated) {
      setDailyGenerationQuota(null)
      return
    }

    try {
      const quota = await fetchGet<DailyGenerationQuota>('/api/outpaint', { quota: '1' })
      setDailyGenerationQuota(quota)
    } catch (error: any) {
      console.error('Failed to load daily generation quota:', error)
      msg.error('获取今日生成次数失败，请稍后重试')
    }
  }, [isAuthenticated, msg])

  useEffect(() => {
    void refreshDailyGenerationQuota()
  }, [refreshDailyGenerationQuota])

  useEffect(() => {
    const updateCanvasSize = () => {
      const navbarHeight = 64 // Navbar 的高度
      const mobileTopOptionsHeight = 0
      const availableHeight =
        window.innerHeight -
        navbarHeight -
        mobileTopOptionsHeight
      const width = window.innerWidth

      setCanvasSize({ width, height: availableHeight })
      setMobileTopOptionsHeight(mobileTopOptionsHeight)
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  // 跳过登录验证时关闭登录弹窗
  useEffect(() => {
    if (skipAuth) {
      loginRef.current?.close()
    }
  }, [skipAuth])

  // 更新这个 useEffect 来处理 Stage 样式的变化
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setStageStyle({ marginTop: `${mobileTopOptionsHeight}px` })
    } else {
      setStageStyle({})
    }
  }, [mobileTopOptionsHeight])

  const loadAndScaleImage = (imgSrc: string | File) => {
    return new Promise<void>((resolve) => {
      setIsImageLoading(true)
      const img = new Image()

      if (typeof imgSrc === 'string') {
        setCurrentImagePath(imgSrc)
        img.src = `/api/image-proxy?key=${encodeURIComponent(imgSrc)}`
      } else {
        img.src = URL.createObjectURL(imgSrc)
      }

      img.onload = () => {
        const imageAreaHeight = Math.max(
          120,
          canvasSize.height - PROMPT_PANEL_RESERVED_HEIGHT,
        )
        const scale = Math.min(
          (canvasSize.width - 72) / img.width,
          (imageAreaHeight - 72) / img.height,
        ) * CANVAS_IMAGE_SCALE_RATIO
        const width = img.width * scale
        const height = img.height * scale
        const x = (canvasSize.width - width) / 2
        const y = (imageAreaHeight - height) / 2
        setImageProps({ width, height, x, y })
        setImage(img)
        setOriginalImage(img)
        setIsImageLoading(false)
        resolve()
      }
      img.onerror = () => {
        setIsImageLoading(false)
        msg.error(t`Failed to load image. The image URL may be invalid or blocked by CORS.`)
        resolve()
      }
    })
  }

  /**
   * 在执行上传或生成前确认 NextAuth 会话状态。
   * 会话刷新期间 status 会短暂为 loading，此时不能误判为未登录并弹出 Google 登录框。
   * @returns 是否已确认当前用户可以执行需要登录的操作
   */
  const ensureAuthenticated = useCallback((): boolean => {
    if (isLocalAuthBypass && skipAuthRef.current) return true

    if (status === 'loading') {
      msg.info(t`Checking sign-in status. Please try again in a moment.`)
      return false
    }

    if (status === 'authenticated') return true

    msg.warning(t`Please Sign In To Continue`)
    loginRef.current?.open()
    return false
  }, [isLocalAuthBypass, msg, status])

  const handleBeforeUpload = (file: File) => {
    if (!ensureAuthenticated()) return false

    // 限制文件大小 10MB
    if (file.size > 10485760) {
      msg.error(t`File size exceeds 10MB. Please select a smaller file.`)
      return false
    }
    return new Promise<boolean>((resolve) => {
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        const minDim = 64
        const maxDim = 2048
        if (img.width < minDim || img.height < minDim) {
          msg.error(t`Image is too small. Minimum size: 64×64 pixels.`)
          resolve(false)
          return
        }
        if (img.width > maxDim || img.height > maxDim) {
          msg.error(t`Image is too large. Maximum size: 2048×2048 pixels.`)
          resolve(false)
          return
        }
        setOriginalFileName(file.name)
        resolve(true)
      }
      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        setOriginalFileName(file.name)
        resolve(true) // 无法读取尺寸时允许上传
      }
      img.src = URL.createObjectURL(file)
    })
  }

  function handleUploadFinish(e: any) {
    setOriginKey(e.extra.key)
    setCurrentImageKey(e.extra.key)
    loadAndScaleImage(e.extra.key)
    setHistoryImages([]) // 清空历史图片列表，而不是加原始图片
    // 记录上传日志
    fetchPost('/api/upload-log', {
      fileName: e.name || 'unknown',
      fileSize: e.size || 0,
      imageKey: e.extra.key,
    }).catch(() => {})
  }

  function handleUploadRemove() {
    setOriginKey(null)
    setCurrentImageKey(null)
    setImage(null)
    setOriginalImage(null)
  }

  const ExpandDirectionIcon = ({
    direction,
    isSelected,
  }: {
    direction: '16:9' | '9:16' | '1:1'
    isSelected: boolean
  }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {direction === '16:9' ? (
        <>
          <rect
            x="4"
            y="6"
            width="16"
            height="12"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
          <path
            d="M2 12H4M20 12H22"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
          <path
            d="M8 10L6 12L8 14M16 10L18 12L16 14"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
        </>
      ) : direction === '9:16' ? (
        <>
          <rect
            x="6"
            y="4"
            width="12"
            height="16"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
          <path
            d="M12 2V4M12 20V22"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
          <path
            d="M10 8L12 6L14 8M10 16L12 18L14 16"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <rect
            x="6"
            y="6"
            width="12"
            height="12"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
          <path
            d="M2 12H6M18 12H22M12 2V6M12 18V22"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
          <path
            d="M8 8L6 6M16 8L18 6M8 16L6 18M16 16L18 18"
            stroke={isSelected ? 'currentColor' : '#71717A'}
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  )

  const PositionIcon = ({
    position,
    isSelected,
    aspectRatio,
  }: {
    position: 'Middle' | 'Left' | 'Right' | 'Top' | 'Bottom'
    isSelected: boolean
    aspectRatio: '16:9' | '9:16' | '1:1'
  }) => {
    const getOuterPath = () => {
      switch (aspectRatio) {
        case '16:9':
          return 'M2 6h20v12H2V6z'
        case '9:16':
          return 'M6 2h12v20H6V2z'
        case '1:1':
          return 'M4 4h16v16H4V4z'
      }
    }

    const getInnerRect = () => {
      switch (position) {
        case 'Middle':
          return { x: 8, y: 8, width: 8, height: 8 }
        case 'Left':
          return { x: 4, y: 8, width: 8, height: 8 }
        case 'Right':
          return { x: 12, y: 8, width: 8, height: 8 }
        case 'Top':
          return { x: 8, y: 4, width: 8, height: 8 }
        case 'Bottom':
          return { x: 8, y: 12, width: 8, height: 8 }
      }
    }

    const strokeColor = isSelected ? 'currentColor' : '#71717A'
    const fillColor = isSelected ? 'currentColor' : '#A1A1AA' // 更改为更深的灰色

    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={getOuterPath()}
          stroke={strokeColor}
          strokeWidth="2"
          fill="none"
        />
        <rect {...getInnerRect()} fill={fillColor} />
      </svg>
    )
  }

  const getAvailablePositions = (expandDirection: '16:9' | '9:16' | '1:1') => {
    switch (expandDirection) {
      case '16:9':
        return ['Middle', 'Left', 'Right']
      case '9:16':
        return ['Middle', 'Top', 'Bottom']
      case '1:1':
        return ['Middle']
    }
  }

  useEffect(() => {
    const availablePositions = getAvailablePositions(selectedExpandDirection)
    if (!availablePositions.includes(selectedPosition)) {
      setSelectedPosition('Middle')
    }
  }, [selectedExpandDirection, selectedPosition])



  useEffect(() => {
    if (!isCanvasReady) return

    if (!isAuthenticated && !isLocalAuthBypass) {
      hasRestoredTaskRef.current = false
      return
    }
    if (hasRestoredTaskRef.current) return

    hasRestoredTaskRef.current = true

    let isCancelled = false

    const restoreGenerationTask = async () => {
      const storedTaskText = localStorage.getItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)
      if (!storedTaskText) return

      try {
        const persistedTask = JSON.parse(storedTaskText) as PersistedGenerationTask
        const isExpiredTask = Date.now() - persistedTask?.createdAt > MAX_TASK_RESTORE_DURATION
        if (!persistedTask?.requestId || !persistedTask?.createdAt || isExpiredTask) {
          localStorage.removeItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)
          return
        }

        let task = await fetchGet<any>('/api/outpaint', persistedTask.taskId
          ? { taskId: persistedTask.taskId }
          : { requestId: persistedTask.requestId })
        const taskStatus = String(task?.status ?? '').toUpperCase()

        if (taskStatus === 'PENDING' || taskStatus === 'PROCESSING') {
          const taskDeadline = persistedTask.createdAt + MAX_TASK_RESTORE_DURATION
          if (Date.now() >= taskDeadline) {
            setIsGenerationTimedOut(true)
            setIsLoading(false)
            setIsProcessing(false)
            return
          }

          setIsLoading(true)
          setIsProcessing(true)
        }

        if (taskStatus === 'PENDING') {
          // 仅恢复已落库任务的处理，不会重新调用创建/生成接口。
          await fetchPost('/api/outpaint', {
            action: 'process',
            taskId: task.taskId,
            model: persistedTask.model,
          })
        }

        let consecutivePollFailures = 0
        while (!isCancelled && (String(task?.status ?? '').toUpperCase() === 'PENDING' || String(task?.status ?? '').toUpperCase() === 'PROCESSING')) {
          if (Date.now() >= persistedTask.createdAt + MAX_TASK_RESTORE_DURATION) {
            setIsGenerationTimedOut(true)
            setIsLoading(false)
            setIsProcessing(false)
            return
          }

          const pollDelay = Math.min(
            TASK_POLL_INTERVAL * (2 ** Math.min(consecutivePollFailures, 2)),
            MAX_TASK_POLL_RETRY_INTERVAL,
          )
          await new Promise((resolve) => setTimeout(resolve, pollDelay))

          try {
            task = await fetchGet<any>('/api/outpaint', { taskId: task.taskId })
            consecutivePollFailures = 0
            if (typeof task?.progress === 'number') {
              setGenerationProgress(Math.min(100, Math.max(0, task.progress)))
            }
          } catch (error) {
            consecutivePollFailures += 1
            console.error('Failed to poll restored image generation task:', error)
          }
        }

        if (isCancelled) return

        const restoredTaskStatus = String(task?.status ?? '').toUpperCase()
        if (restoredTaskStatus !== 'SUCCEEDED' || !task.resultKey || !task.resultUrl) {
          localStorage.removeItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)
          setIsLoading(false)
          setIsProcessing(false)
          setIsGenerationTimedOut(false)
          setGenerationProgress(0)
          msg.error(task?.errorMessage || t`Image processing failed.`)
          return
        }

        const restoredImage = new Image()
        restoredImage.onload = () => {
          if (isCancelled) return

          const { width: canvasWidth, height: canvasHeight } = canvasSizeRef.current
          const imageAreaHeight = Math.max(120, canvasHeight - PROMPT_PANEL_RESERVED_HEIGHT)
          const scale = Math.min(
            (canvasWidth - 72) / restoredImage.width,
            (imageAreaHeight - 72) / restoredImage.height,
          ) * CANVAS_IMAGE_SCALE_RATIO
          const width = restoredImage.width * scale
          const height = restoredImage.height * scale

          setImageProps({
            width,
            height,
            x: (canvasWidth - width) / 2,
            y: (imageAreaHeight - height) / 2,
          })
          setImage(restoredImage)
          setOriginalImage(restoredImage)
          setCurrentImageKey(task.resultKey)
          setCurrentImagePath(task.resultKey)
          setGeneratedImages((previous) => [...previous, task.resultKey])
          setHistoryImages((previous) => [...previous, task.resultKey])
          setHasGeneratedImage(true)
          setIsGenerationTimedOut(false)
          localStorage.removeItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)
          setIsLoading(false)
          setIsProcessing(false)
        }
        restoredImage.onerror = () => {
          console.error('Failed to restore generated image:', task.resultUrl)
          localStorage.removeItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)
          msg.error(t`Failed to restore generated image.`)
          setIsLoading(false)
          setIsProcessing(false)
        }
        restoredImage.src = `/api/image-proxy?key=${encodeURIComponent(task.resultKey)}`
      } catch (error: any) {
        const errorMessage = typeof error === 'string' ? error : error?.message ?? ''
        if (errorMessage.includes('Task not found')) {
          localStorage.removeItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)
          setIsLoading(false)
          setIsProcessing(false)
          return
        }

        console.error('Failed to restore image generation task:', error)
        msg.error(t`Failed to restore image generation task.`)
        setIsLoading(false)
        setIsProcessing(false)
        setGenerationProgress(0)
      }
    }

    void restoreGenerationTask()

    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, isCanvasReady, isLocalAuthBypass, msg, skipAuth])

  /**
   * 创建并轮询图片生成任务。
   * @param regenerate 是否基于首次上传的原图重新生成；为 false 时使用当前画布图片。
   * @returns 完成后将结果图片写入画布；未登录或服务端额度不足时不创建任务。
   */
  const handleGenerate = async (regenerate: boolean = false) => {
    const normalizedPrompt = promptText.trim()
    if (!normalizedPrompt) {
      msg.warning(t`Please enter a prompt before starting.`)
      return
    }

    if (!ensureAuthenticated()) return

    setIsLoading(true)
    setIsProcessing(true)
    setIsGenerationTimedOut(false)
    setGenerationProgress(0)

    try {
      const imageKey = regenerate ? originKey : currentImageKey
      if (!imageKey) {
        throw new Error(t`Please upload an image first.`)
      }

      // 2. 提交扩图任务到队列
      // 每次用户主动生成均创建独立幂等键；刷新恢复会在后续步骤复用该值。
      const requestId = crypto.randomUUID()
      const taskCreatedAt = Date.now()
      let task = await fetchPost('/api/outpaint', {
        requestId,
        imageKey,
        model: selectedModel,
        expandDirection: selectedImageSize,
        alignment: selectedPosition,
        prompt: normalizedPrompt,
      }) as any

      if (!task || !task.taskId) {
        throw new Error(t`Failed to submit task.`)
      }

      /**
       * 只有服务端成功创建任务并返回 taskId 后，才持久化恢复信息，避免失败请求留下无效缓存。
       */
      localStorage.setItem(
        ACTIVE_GENERATION_TASK_STORAGE_KEY,
        JSON.stringify({ requestId, taskId: task.taskId, model: selectedModel, createdAt: taskCreatedAt }),
      )

      await refreshDailyGenerationQuota()

      // 3. 异步触发处理（不等待完成，由轮询获取结果）
      await fetchPost('/api/outpaint', {
        action: 'process',
        taskId: task.taskId,
        model: selectedModel,
      })

      // 4. 轮询等待结果
      task = task as any
      const taskDeadline = taskCreatedAt + MAX_TASK_WAIT_DURATION
      let consecutivePollFailures = 0
      while (String(task?.status ?? '').toUpperCase() === 'PENDING' || String(task?.status ?? '').toUpperCase() === 'PROCESSING') {
        if (Date.now() >= taskDeadline) {
          setIsLoading(false)
          setIsProcessing(false)
          setIsGenerationTimedOut(true)
          return
        }
        const pollDelay = Math.min(
          TASK_POLL_INTERVAL * (2 ** Math.min(consecutivePollFailures, 2)),
          MAX_TASK_POLL_RETRY_INTERVAL,
        )
        await new Promise(resolve => setTimeout(resolve, pollDelay))
        if (Date.now() >= taskDeadline) {
          setIsLoading(false)
          setIsProcessing(false)
          setIsGenerationTimedOut(true)
          return
        }
        try {
          const res = await fetch(`/api/outpaint?taskId=${task.taskId}`)
          if (!res.ok) {
            throw new Error(`Task polling failed with status ${res.status}`)
          }
          const json = await res.json()
          task = json.data ?? json
          consecutivePollFailures = 0
          if (typeof task?.progress === 'number') {
            setGenerationProgress(Math.min(100, Math.max(0, task.progress)))
          }
        } catch (error) {
          consecutivePollFailures += 1
          console.error('Failed to poll image generation task:', error)
        }
      }

      const taskStatus = String(task.status ?? '').toUpperCase()
      if (taskStatus !== 'SUCCEEDED' || !task.resultKey || !task.resultUrl) {
        localStorage.removeItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)
        throw new Error(task.errorMessage || t`Image processing failed.`)
      }
      const resultImageKey = task.resultKey
      const resultImageUrl = `/api/image-proxy?key=${encodeURIComponent(resultImageKey)}`
      setGenerationProgress(100)

      // 5. 显示在画布上
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image()
        nextImage.onload = () => resolve(nextImage)
        nextImage.onerror = () => reject(new Error(t`Failed to load image. The image URL may be invalid or blocked by CORS.`))
        nextImage.src = resultImageUrl
      })

      setGeneratedImages((prev) => [...prev, resultImageKey])
      setHistoryImages((prev) => [...prev, resultImageKey])
      setCurrentImageKey(resultImageKey)
      setCurrentImagePath(resultImageKey)
      setHasGeneratedImage(true)

      const imageAreaHeight = Math.max(
        120,
        canvasSize.height - PROMPT_PANEL_RESERVED_HEIGHT,
      )
      const scale = Math.min(
        (canvasSize.width - 72) / img.width,
        (imageAreaHeight - 72) / img.height,
      ) * CANVAS_IMAGE_SCALE_RATIO
      const width = img.width * scale
      const height = img.height * scale
      const x = (canvasSize.width - width) / 2
      const y = (imageAreaHeight - height) / 2
      setImageProps({ width, height, x, y })
      setImage(img)
      setOriginalImage(img)
      /**
       * 图片已成功加载并写入画布后，再清理任务缓存，保证断网时仍可刷新恢复。
       */
      localStorage.removeItem(ACTIVE_GENERATION_TASK_STORAGE_KEY)

      setIsLoading(false)
      setIsProcessing(false)
      setIsGenerationTimedOut(false)
      setGenerationProgress(0)

    } catch (error: any) {
      const msgText = typeof error === 'string' ? error : (error?.message || '')
      if (msgText.includes('Daily generation limit reached')) {
        setLimitModalMsg(msgText)
        setShowLimitModal(true)
        setIsLoading(false)
        setIsProcessing(false)
        setGenerationProgress(0)
        console.error('Image generation limit reached:', error)
        return
      }

      if (msgText.includes('今日免费扩图次数已用完')) {
        setLimitModalMsg(msgText)
        setShowLimitModal(true)
      } else {
        msg.error(msgText || t`An error occurred while processing the image.`)
      }
      setIsLoading(false)
      setIsProcessing(false)
      console.error("扩图失败:", error)
    }
  }


  const handleCompareOriginal = (isComparing: boolean) => {
    setIsComparing(isComparing)
    if (isComparing && originalImage) {
      setImage(originalImage)
    } else if (!isComparing && image) {
      setImage(image)
    }
  }

  const handleClearCanvas = () => {
    onOpen() // 打开
  }

  const confirmClearCanvas = () => {
    setImage(null)
    setOriginalImage(null)
    setImageProps({ width: 0, height: 0, x: 0, y: 0 })
    setGeneratedImages([])
    onClose() // 关闭确认对话框
  }

  const handleDownload = () => {
    if (image) {
      const link = document.createElement('a')
      link.href = image.src
      link.target = '_blank'

      // 使用原始文件名，如果没有则使用默认名称
      const fileName = originalFileName || 'expanded_image.png'

      // 确保文件扩展名正确
      const fileExtension = fileName.split('.').pop()?.toLowerCase()
      const downloadFileName =
        fileExtension === 'png' ? fileName : `${fileName}.png`

      link.download = downloadFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const AspectRatioButton = ({
    ratio,
    label,
  }: {
    ratio: '16:9' | '9:16' | '1:1'
    label: string
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
        selectedExpandDirection === ratio
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => setSelectedExpandDirection(ratio)}
    >
      <ExpandDirectionIcon
        direction={ratio}
        isSelected={selectedExpandDirection === ratio}
      />
      <span className="ml-2 text-sm">{label}</span>
    </motion.button>
  )

  const PositionButton = ({
    position,
    isMobile = false,
  }: {
    position: 'Middle' | 'Left' | 'Right' | 'Top' | 'Bottom'
    isMobile?: boolean
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
        selectedPosition === position
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${isMobile ? 'flex-1' : ''}`}
      onClick={() => setSelectedPosition(position)}
    >
      <PositionIcon
        position={position}
        isSelected={selectedPosition === position}
        aspectRatio={selectedExpandDirection}
      />
      <span className={`ml-2 text-sm ${isMobile ? 'text-xs' : ''}`}>
        {position === 'Middle'
          ? t`Middle`
          : position === 'Left'
            ? t`Left`
            : position === 'Right'
              ? t`Right`
              : position === 'Top'
                ? t`Top`
                : t`Bottom`}
      </span>
    </motion.button>
  )

  // 图片缩略图辅助函数（兼容完整 URL 和 S3 相对路径）
  const imgUrl = (key: string) =>
    key.startsWith('http://') || key.startsWith('https://') ? key : `/api/image-proxy?key=${encodeURIComponent(key)}`
  const isCurrentImage = (key: string) => image?.src === imgUrl(key)

  const switchToImage = (imgPath: string) => {
    const img = new Image()
    img.src = imgUrl(imgPath)
    img.onload = () => {
      const imageAreaHeight = Math.max(
        120,
        canvasSize.height - PROMPT_PANEL_RESERVED_HEIGHT,
      )
      setImage(img)
      const scale = Math.min(
        (canvasSize.width - 40) / img.width,
        (imageAreaHeight - 40) / img.height,
      ) * CANVAS_IMAGE_SCALE_RATIO
      setImageProps({
        width: img.width * scale,
        height: img.height * scale,
        x: (canvasSize.width - img.width * scale) / 2,
        y: (imageAreaHeight - img.height * scale) / 2,
      })
    }
  }

  /**
   * 处理主画布图片点击，复用缩略图的图片切换行为。
   * @returns {void}
   */
  const handleCanvasImageClick = (): void => {
    if (!image) return
    switchToImage(currentImagePath ?? image.src)
    setPreviewImageSrc((isComparing ? originalImage : image)?.src ?? image.src)
    setShowImagePreview(true)
  }

  const Thumbnail = ({ imgPath, isActive, onClick }: { imgPath: string; isActive: boolean; onClick: () => void }) => (
    <div
      className={`min-w-14 w-14 h-14 rounded border bg-cover bg-center cursor-pointer ${
        isActive ? 'border-blue-500 border-2' : 'border-gray-300'
      }`}
      style={{ backgroundImage: `url(${imgUrl(imgPath)})` }}
      onClick={onClick}
    />
  )

  return (
    <div className="relative h-screen">
      {isProcessing && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden rounded-[20px] bg-[#080a07]/55">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(190, 255, 0, 0.08) 0, rgba(190, 255, 0, 0.08) 2px, transparent 2px, transparent 6px)',
            }}
          />
          <div className="relative z-10 flex w-64 flex-col items-center text-center">
            <div className="mb-5 rounded-2xl border-2 border-[#2f9da0] px-6 py-2 text-3xl font-black tracking-wide text-[#2f9da0] shadow-[0_0_18px_rgba(215,255,39,0.35)]">
              {t`Generating`}
            </div>
            <div className="h-3 w-44 overflow-hidden rounded-full border-2 border-[#2f9da0] bg-[#171b0e]">
              <div
                className="h-full rounded-full bg-[#2f9da0] shadow-[0_0_10px_rgba(215,255,39,0.9)] transition-[width] duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="mt-2 text-sm font-semibold text-gray-300">
              {t`Processing...`} {generationProgress}%
            </div>
            <div className="mt-5 flex gap-2">
              {['progress-a', 'progress-b', 'progress-c', 'progress-d', 'progress-e'].map((segment) => (
                <span
                  key={segment}
                  className="h-7 w-5 animate-pulse rounded border border-[#39420f] bg-[#151a0c]"
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {isGenerationTimedOut && !isProcessing && (
        <div className="absolute left-1/2 top-20 z-[90] w-[min(92vw,520px)] -translate-x-1/2 rounded-xl border border-[#2f9da0]/70 bg-[#101510] px-4 py-3 text-center shadow-lg">
          <p className="text-sm text-gray-200">
            {t`This image is still being generated in the background. You can leave now and check back later.`}
          </p>
          <Button
            as={Link}
            href={`/${params.lang}/`}
            size="sm"
            color="primary"
            variant="flat"
            className="mt-3"
            startContent={<ArrowLeft size={16} />}
          >
            {t`Return Home`}
          </Button>
        </div>
      )}
      <div className="h-screen flex flex-col">
        <GoogleLogin ref={loginRef} />
        {msgHolder}
        <Payment ref={paymentRef} locale={params?.lang} />
        <Navbar isBordered className="h-16" maxWidth="full">
          <div className="flex items-center">
            <Button
              as={Link}
              href={`/${params.lang}/`}
              variant="light"
              startContent={<ArrowLeft />}
            >
              {t`Back`}
            </Button>
          </div>

          <div className="flex-grow justify-center items-center space-x-4 hidden md:flex">
            {SHOW_OUTPAINT_CONTROLS && <div className="flex items-center space-x-2">
              <span className="text-sm whitespace-nowrap">{t`Expansion Direction:`}</span>
              <div className="flex space-x-2">
                <AspectRatioButton ratio="16:9" label={t`Horizontal`} />
                <AspectRatioButton ratio="9:16" label={t`Vertical`} />
                <AspectRatioButton ratio="1:1" label={t`Square`} />
              </div>
            </div>}

            {SHOW_OUTPAINT_CONTROLS && <div className="flex items-center space-x-2">
              <span className="text-sm whitespace-nowrap">{t`Original Image Position:`}</span>
              <div className="flex space-x-2">
                {getAvailablePositions(selectedExpandDirection).map((pos) => (
                  <PositionButton key={pos} position={pos as any} />
                ))}
              </div>
            </div>}
          </div>

          <div className="flex max-w-[420px] items-center gap-1 overflow-x-auto">
            {originKey && (
              <div
                className={`min-w-14 w-14 h-14 rounded border bg-cover bg-center cursor-pointer ${
                  isCurrentImage(originKey) ? 'border-blue-500 border-2' : 'border-gray-300'
                }`}
                style={{ backgroundImage: `url(${imgUrl(originKey)})` }}
                onClick={() => setShowOriginalModal(true)}
                title="Original"
              />
            )}
            {historyImages.map((imgPath, index) => (
              <Thumbnail
                key={index}
                imgPath={imgPath}
                isActive={isCurrentImage(imgPath)}
                onClick={() => switchToImage(imgPath)}
              />
            ))}
            <Button size="sm" color="default" onClick={handleClearCanvas} isDisabled={!image || isProcessing}>
              <Trash2 size={18} />
              <span className="ml-1 hidden sm:inline">{t`Clear Canvas`}</span>
            </Button>
            <Button size="sm" color="default" onClick={handleDownload} isDisabled={!image || isProcessing}>
              <Download size={18} />
              <span className="ml-1 hidden sm:inline">{t`Download`}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {isUnauthenticated && siteConfig.showLogin ? (
              <>
                <div className="hidden sm:block">
                  <Button
                    color={'primary'}
                    variant="flat"
                    startContent={<FcGoogle size="1em" color="white" />}
                    onClick={() => signIn('google')}
                  >{t`Sign In With Google`}</Button>
                </div>
                <div className="sm:hidden">
                  <Button
                    color={'primary'}
                    variant="flat"
                    startContent={<FcGoogle size="1em" color="white" />}
                    onClick={() => signIn('google')}
                  >{t`Sign In`}</Button>
                </div>
              </>
            ) : (
              <AntDropDown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      className: 'h-14 gap-2',
                      disabled: true,
                      label: (
                        <>
                          <p className="font-semibold">{user?.email ?? ''}</p>
                          {dailyQuotaText && <p className="font-semibold">{dailyQuotaText}</p>}
                        </>
                      ),
                    },
                    {
                      key: 'logout',
                      itemIcon: <FaArrowUpFromBracket />,
                      label: t`Log Out`,
                      onClick: () => signOut(),
                    },
                  ],
                }}
              >
                <Skeleton isLoaded={isAuthenticated} className="rounded-lg">
                  {user?.image && (
                    <User
                      name={user?.name ?? ''}
                      description={dailyQuotaText || undefined}
                      className="cursor-pointer"
                      avatarProps={{
                        lang: params.lang,
                        src: user?.image ?? '#',
                      }}
                    ></User>
                  )}
                </Skeleton>
              </AntDropDown>
            )}

            {/* Purchase 按钮暂时隐藏 */}

          </div>
        </Navbar>

        <div className="flex-grow flex flex-col relative">
          <div className="flex-grow relative">
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              ref={stageRef}
            >
              <Layer>
                {(isComparing ? originalImage : image) && (
                  <KonvaImage
                    image={
                      (isComparing ? originalImage : image) as CanvasImageSource
                    }
                    {...imageProps}
                    opacity={isComparing ? 0.5 : 1}
                    onClick={handleCanvasImageClick}
                    onTap={handleCanvasImageClick}
                  />
                )}
              </Layer>
            </Stage>

            {!image && (
              <div className="absolute inset-0 max-w-xl mx-auto flex items-center justify-center">
                <Spin
                  spinning={isLoading || isImageLoading}
                  tip={isLoading ? t`Uploading...` : t`Loading image...`}
                  className="bg-mask-200 rounded-xl"
                >
                  <div className="relative md:py-5 border-primary border-dashed border-2 rounded-xl p-5">
                    <UeDropzoneUpload
                      ref={uploadRef}
                      accept={'image/*'}
                      listType="picture"
                      dir={'/input/origin'}
                      withTimestamp={true}
                      keepOriginName={true}
                      skipAuth={isLocalAuthBypass && skipAuth}
                      onBeforeUpload={handleBeforeUpload}
                      onUploadFinish={handleUploadFinish}
                      onRemove={handleUploadRemove}
                    >
                      <div className="md:py-10">
                        <div className="flex justify-center text-6xl text-primary">
                          <AiOutlineCloudUpload />
                        </div>
                        <div className="text-gray-600">{t`Please click or drag the image to upload it.`}</div>
                      </div>
                    </UeDropzoneUpload>
                  </div>
                </Spin>
              </div>
            )}

            {/* 提示词输入浮层：固定在画布区域底部居中，避免占用顶部工具栏空间。 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4 sm:bottom-8">
                <div className="pointer-events-auto w-full max-w-5xl rounded-[28px] border border-gray-200 bg-white/95 px-5 py-3 shadow-xl backdrop-blur-sm sm:px-7 sm:py-4">
                  <div className="mb-2 border-b border-gray-100 pb-2">
                    <label htmlFor="editor-prompt" className="sr-only">
                      {t`Prompt:`}
                    </label>
                    <textarea
                      id="editor-prompt"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder={t`Describe what you want to generate...`}
                      rows={2}
                      className="min-h-[64px] w-full resize-none border-0 bg-transparent text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 sm:text-base"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="order-2 flex flex-wrap items-center gap-2">

                      {hasGeneratedImage && <Button size="sm" color="secondary" onClick={() => handleGenerate(true)} isLoading={isLoading} isDisabled={!image || isProcessing}>
                        <RefreshCcw size={18} />
                        <span className="ml-1 hidden sm:inline">{t`Regenerate`}</span>
                      </Button>}
                      <Button size="sm" color="primary" onClick={() => handleGenerate(false)} isLoading={isLoading} isDisabled={!image || isProcessing}>
                        {isLoading ? <Spinner size="sm" /> : null}
                        <span className="ml-1 flex items-center">
                          {isLoading ? t`Expanding` : hasGeneratedImage ? t`Continue Generating` : 'Start'}
                        </span>
                      </Button>
                      {/* {isLocalAuthBypass && <Button size="sm" color={skipAuth ? 'warning' : 'default'} variant="flat" onClick={() => setSkipAuth(!skipAuth)}>
                      {skipAuth ? t`Auth Off` : t`Auth`}
                    </Button>} */}
                    </div>
                    <div className="order-1 flex flex-wrap items-center gap-2">
                      {IMAGE_SIZE_OPTIONS.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedImageSize(size)}
                          aria-pressed={selectedImageSize === size}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors sm:text-sm ${
                            selectedImageSize === size
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <div>
            <div>
                {/* 暂时隐藏授权功能 */}
            </div>
          </div>
        </div>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>{t`Confirm Clear Canvas`}</ModalHeader>
            <ModalBody>
              {t`Are you sure you want to clear the current canvas? This will delete all generated images and the current editing state.`}
            </ModalBody>
            <ModalFooter>
              <Button color="default" onClick={onClose}>
                {t`Cancel`}
              </Button>
              <Button color="danger" onClick={confirmClearCanvas}>
                {t`Confirm Clear`}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* 原始图片查看模态框 */}
        <Modal
          isOpen={showOriginalModal}
          onClose={() => setShowOriginalModal(false)}
          size="xl"
        >
          <ModalContent>
            <ModalHeader>{t`Original Image`}</ModalHeader>
            <ModalBody>
              <img
                src={`/api/image-proxy?key=${encodeURIComponent(originKey || '')}`}
                alt="Original"
                className="w-full h-auto"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => setShowOriginalModal(false)}
              >{t`Close`}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* 每日次数用完提示弹窗 */}
        <Modal
          isOpen={showImagePreview}
          onClose={() => setShowImagePreview(false)}
          size="full"
          className="bg-black/90"
        >
          <ModalContent className="bg-black/90 shadow-none">
            <ModalBody className="flex min-h-screen items-center justify-center p-4 sm:p-8">
              {previewImageSrc && (
                <img
                  src={previewImageSrc}
                  alt="Image preview"
                  className="max-h-[90vh] max-w-full object-contain"
                />
              )}
            </ModalBody>
            <ModalFooter className="justify-center border-t border-white/10">
              <Button
                color="default"
                variant="flat"
                onClick={() => setShowImagePreview(false)}
              >{t`Close`}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)}>
          <ModalContent>
            <ModalHeader className="flex flex-col items-center text-warning">
              ⚠️ {t`Daily limit reached`}
            </ModalHeader>
            <ModalBody className="text-center py-4">
              <p className="text-lg font-semibold">{limitModalMsg}</p>
              <p className="text-gray-500 mt-2">Daily generation limit: 3 uses</p>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-3">
              <Button color="danger" variant="light" onPress={() => setShowLimitModal(false)}>
                {t`Close`}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}

export default EditorView
