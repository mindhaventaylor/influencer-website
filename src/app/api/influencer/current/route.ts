import { NextResponse } from 'next/server';
import { getCurrentInfluencer } from '@/lib/influencer-resolver';

export async function GET() {
  try {
    const influencer = await getCurrentInfluencer();
    return NextResponse.json(influencer);
  } catch (error) {
    console.error('Error fetching current influencer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current influencer' },
      { status: 500 }
    );
  }
}
