import { NextRequest } from 'next/server'
import prisma from '@/config/prisma'
import { R } from '@/framework/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    if (!email) {
      return R.bad('Email is required')
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || 'test_user',
        credit: 10,
        totalCredit: 10,
      },
    })

    return R.ok({ id: user.id, email: user.email, name: user.name, credit: user.credit })
  } catch (error: any) {
    console.error('注册失败:', error)
    return R.error(error.message || '注册失败')
  }
}
