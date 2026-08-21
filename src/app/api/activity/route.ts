import { NextResponse } from 'next/server'
import { getActivity } from '@/lib/board'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await getActivity(20)
  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
