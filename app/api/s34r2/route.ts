import { getAuthUser } from '@/auth'
import { R } from '@/framework/utils'
import { createGetSingedUrl, createPutSingedUrl } from '@/framework/utils/s34r2'
import { NextRequest } from 'next/server'

const ALLOWED_UPLOAD_PREFIXES = ['input/origin/']

function isSafeUploadKey(key: string) {
  return (
    !key.startsWith('/') &&
    !key.includes('..') &&
    ALLOWED_UPLOAD_PREFIXES.some((prefix) => key.startsWith(prefix))
  )
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const op = request.nextUrl.searchParams.get('op')
  if (!key) {
    return R.error('key is required')
  }

  const authUser = await getAuthUser()
  if (!authUser) {
    return R.bad('Please Sign In To Continue')
  }

  if ('read' !== op && !isSafeUploadKey(key)) {
    return R.bad('Invalid upload key')
  }

  try {
    if ('read' === op) {
      const url = await createGetSingedUrl(key)
      return R.ok(url)
    }
    const url = await createPutSingedUrl(key)
    return R.ok(url)
  } catch (error) {
    console.log('Create signed URL failed', error)
    return R.error('Create signed URL failed')
  }
}
