import authConfig from '@/config/auth-config'
import prisma from '@/config/prisma'
import { SessionUser } from '@/framework/types/sessionUser'
import userService from '@/lib/admin/services/UserService'
import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'

const Give_Credit = 5

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  debug:process.env.NODE_ENV !== "production",
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ account, profile }) {
      console.log(`##用户:${profile?.email}登录系统`,profile)
      if (account?.provider === 'google' && profile?.email) {
        return true
      }
      return `This authorization method is not supported`
    },
    /**
     * 将登录用户的数据库 ID 写入 JWT，避免后续会话只能依赖邮箱查询。
     * @param {{ token: Object, user?: Object }} context - NextAuth JWT 回调上下文
     * @returns {Promise<Object>} 写入用户 ID 后的 JWT
     */
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id
      }
      return token
    },
    /**
     * 将 JWT 和数据库用户信息合并为客户端会话。
     * @param {{ session: Object, token: Object }} context - NextAuth session 回调上下文
     * @returns {Promise<Object>} 可供客户端使用的用户会话
     */
    async session({ session, token }) {
      const sessionUser = session.user
      const userId = String(token.userId ?? token.sub ?? '')
      const userEmail = sessionUser?.email ?? token.email ?? ''
      const dbUser = userId
        ? await userService.getById(userId)
        : userEmail
          ? await userService.getByEmail(userEmail)
          : null

      if (!dbUser) {
        session.user = {
          ...sessionUser,
          id: userId || userEmail,
          email: userEmail,
          credit: 0,
        } as SessionUser
        return session
      }
      // 第一次登录赠送点数
      if (dbUser && !dbUser.giveCredit) {
        dbUser.credit = Give_Credit
        dbUser.totalCredit = Give_Credit
        dbUser.giveCredit = true
        console.log(`##用户:${dbUser?.email} 首次登录系统，赠送 ${dbUser.giveCredit} Credit `)
        await  userService.updateByEmail(dbUser,dbUser.email)
      }
      session.user = {
        ...sessionUser,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image:dbUser.image,
        emailVerified: new Date(),
        credit: dbUser.credit ?? 0
      } as SessionUser
      console.log("###获取当前登录用户信息User",session.user)
      return session
    }
  },
  ...authConfig
})
// 获取当前已绑定google的登录用户信息
export const getAuthUser = async () => {
  const session = await auth()
  console.log("session",session)
  return session?.user! as SessionUser
}

