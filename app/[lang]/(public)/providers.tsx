import * as React from 'react'
import AppWithTranslation from '@/framework/locale/AppWithTranslation'
import { NextUIProvider } from '@nextui-org/react'
import { ServerSideGeneratedI18nNamespace } from '@/framework/locale/types'
import withTheme from '@/framework/theme/antdWithTheme'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
export interface ProvidersProps {
  children: React.ReactNode
  params: { i18n: ServerSideGeneratedI18nNamespace },
}

/**
 * 初始化应用级 Provider，并将服务端 NextAuth 会话注入客户端。
 * @param {ProvidersProps} props - Provider 的子节点和国际化参数
 * @returns {Promise<React.ReactElement>} 包裹全局上下文后的 React 节点
 */
export async function Providers({ children, params }: ProvidersProps) {
  const session = await auth()

  return (
    <GoogleOAuthProvider clientId={process.env.UE_GOOGLE_CLIENT_ID!}>
      <SessionProvider session={session}>
        <NextUIProvider locale={params.i18n.locale}>
          <AppWithTranslation i18n={params.i18n}>
              {withTheme(children)}
          </AppWithTranslation>
        </NextUIProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  )
}
