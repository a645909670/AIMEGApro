import { Messages } from '@lingui/core'
import { AVAILABLE_LOCALES, DEFAULT_LOCALE } from './locale'
// 导入已编译的翻译文件（lingui compile --typescript 生成），直接使用无需转换
import { messages as enMessages } from '@/translations/en/messages'
import { messages as csMessages } from '@/translations/cs/messages'
import { messages as frMessages } from '@/translations/fr/messages'
import { messages as deMessages } from '@/translations/de/messages'
import { messages as esMessages } from '@/translations/es/messages'
import { messages as itMessages } from '@/translations/it/messages'
import { messages as jaMessages } from '@/translations/ja/messages'
import { messages as koMessages } from '@/translations/ko/messages'
import { messages as nlMessages } from '@/translations/nl/messages'
import { messages as ptBRMessages } from '@/translations/pt-BR/messages'
import { messages as ruMessages } from '@/translations/ru/messages'
import { messages as ukMessages } from '@/translations/uk/messages'
import { messages as viMessages } from '@/translations/vi/messages'
import { messages as zhTWMessages } from '@/translations/zh-TW/messages'
import { messages as ptMessages } from '@/translations/pt/messages'
import { messages as daMessages } from '@/translations/da/messages'
import { messages as elMessages } from '@/translations/el/messages'
import { messages as noMessages } from '@/translations/no/messages'
import { messages as fiMessages } from '@/translations/fi/messages'
import { messages as svMessages } from '@/translations/sv/messages'
import { messages as thMessages } from '@/translations/th/messages'
import { messages as idMessages } from '@/translations/id/messages'
import { messages as hiMessages } from '@/translations/hi/messages'
import { messages as bnMessages } from '@/translations/bn/messages'
import { messages as msMessages } from '@/translations/ms/messages'
import { messages as trMessages } from '@/translations/tr/messages'

// 创建 messagesMap，直接使用已编译的 Messages 对象
export const messagesMap: Record<string, Messages> = {
  "en": enMessages,
  "cs": csMessages,
  "fr": frMessages,
  "de": deMessages,
  "es": esMessages,
  "it": itMessages,
  "ja": jaMessages,
  "ko": koMessages,
  "nl": nlMessages,
  "pt-BR": ptBRMessages,
  "ru": ruMessages,
  "uk": ukMessages,
  "vi": viMessages,
  "zh-TW": zhTWMessages,
  "pt": ptMessages,
  "da": daMessages,
  "el": elMessages,
  "no": noMessages,
  "fi": fiMessages,
  "sv": svMessages,
  "th": thMessages,
  "id": idMessages,
  "hi": hiMessages,
  "bn": bnMessages,
  "ms": msMessages,
  "tr": trMessages,
}

export const loadTranslationMessagesOnServerSide = async (
  locale: AVAILABLE_LOCALES,
): Promise<Messages> => {
  return messagesMap[locale] || messagesMap[DEFAULT_LOCALE];
}
