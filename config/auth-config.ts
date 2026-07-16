import { NextAuthConfig } from 'next-auth'

export default {
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: process.env.UE_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.UE_GOOGLE_CLIENT_SECRET!,
      authorization: 'https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20email%20profile&prompt=consent&access_type=offline&response_type=code',
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
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
