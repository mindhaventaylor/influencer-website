import { NextResponse } from 'next/server';
import { getCurrentInfluencer, resolveCurrentInfluencerId } from '@/lib/influencer-resolver';

export async function GET() {
  try {
    // 🚀 OPTIMIZATION: Get both influencer data and ID in parallel
    const [influencer, influencerId] = await Promise.all([
      getCurrentInfluencer(),
      resolveCurrentInfluencerId()
    ]);
    
    return NextResponse.json({
      influencer,
      influencerId: { id: influencerId }
    });
  } catch (error) {
    console.error('Error fetching combined influencer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencer data' },
      { status: 500 }
    );
  }
}
