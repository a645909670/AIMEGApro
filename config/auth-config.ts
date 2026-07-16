import { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

const googleClientId =
  process.env.UE_GOOGLE_CLIENT_ID ??
  process.env.AUTH_GOOGLE_ID ??
  process.env.GOOGLE_CLIENT_ID

const googleClientSecret =
  process.env.UE_GOOGLE_CLIENT_SECRET ??
  process.env.AUTH_GOOGLE_SECRET ??
  process.env.GOOGLE_CLIENT_SECRET

export default {
  providers: [
    Google({
      clientId: googleClientId ?? '',
      clientSecret: googleClientSecret ?? '',
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    }
  }

} satisfies NextAuthConfig
