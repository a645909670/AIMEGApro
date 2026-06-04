import {  fetchChat, fetchStreamChat } from './utils'
import {ChatModel} from './types'

export default function createChatModel(model: string): ChatModel {
  const QWEN_API_URL =
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
  const QWEN_API_KEY =
    process.env.UE_QWEN_API_KEY ?? ''

  function chat(data: Record<string, any>) {
    return fetchChat(QWEN_API_URL, QWEN_API_KEY, {
      model,
      input: data,
      parameters: {},
    })
  }

  function streamChat(data: Record<string, any>) {
    return fetchStreamChat(QWEN_API_URL, QWEN_API_KEY, {
      model,
      input: data,
      parameters: {},
    })
  }

  return {
    chat,
    streamChat,
  }
}
