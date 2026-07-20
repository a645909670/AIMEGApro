import { NextRequest, NextResponse } from 'next/server'

const R2_BASE = process.env.UE_S3_PUBLIC_PATH || ''

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const imageUrl = `${R2_BASE}/${key}`
  const resp = await fetch(imageUrl)

  if (!resp.ok) return NextResponse.json({ error: 'image not found' }, { status: 404 })

  const buffer = await resp.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': resp.headers.get('content-type') || 'image/png',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
