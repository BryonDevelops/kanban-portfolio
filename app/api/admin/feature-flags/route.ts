import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getFeatureFlagService } from '@/lib/dependencyContainer'

// GET /api/admin/feature-flags - Get all feature flags
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const featureFlagService = getFeatureFlagService()

    const flags = await featureFlagService.getFeatureFlags()

    return NextResponse.json({ flags })
  } catch (error) {
    console.error('Error in GET /api/admin/feature-flags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/feature-flags - Update feature flag
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, enabled } = body

    if (!id || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const featureFlagService = getFeatureFlagService()

    const flag = await featureFlagService.updateFeatureFlag(id, { enabled })

    return NextResponse.json({ flag })
  } catch (error) {
    console.error('Error in POST /api/admin/feature-flags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}