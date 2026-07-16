import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    AUTH_SECRET: process.env.AUTH_SECRET ? `已设置 (${process.env.AUTH_SECRET.substring(0, 10)}...)` : '未设置',
    DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置',
    UE_GOOGLE_CLIENT_ID: process.env.UE_GOOGLE_CLIENT_ID ? '已设置' : '未设置',
    UE_GOOGLE_CLIENT_SECRET: process.env.UE_GOOGLE_CLIENT_SECRET ? '已设置' : '未设置',
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json(checks)
}
