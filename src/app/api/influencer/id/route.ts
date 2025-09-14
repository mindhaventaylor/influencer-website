import { NextResponse } from 'next/server';
import { getInfluencerInfo } from '@/lib/config';
import { postgres } from '@/lib/db';

export async function GET() {
  try {
    const configInfluencer = getInfluencerInfo();
    const sql = postgres;
    
    const dbInfluencer = await sql`
      SELECT id FROM influencers 
      WHERE name = ${configInfluencer.name} AND is_active = true
      LIMIT 1
    `;
    
    if (dbInfluencer.length > 0) {
      return NextResponse.json({ id: dbInfluencer[0].id });
    }
    
    // Fallback to config ID if not found in database
    return NextResponse.json({ id: configInfluencer.id });
  } catch (error) {
    console.error('Error getting influencer ID:', error);
    const configInfluencer = getInfluencerInfo();
    return NextResponse.json({ id: configInfluencer.id });
  }
}
