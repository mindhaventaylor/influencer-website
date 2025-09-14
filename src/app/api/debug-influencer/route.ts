import { NextResponse } from 'next/server';
import { getInfluencerInfo } from '@/lib/config';
import { postgres } from '@/lib/db';

export async function GET() {
  try {
    const configInfluencer = getInfluencerInfo();
    console.log('Config influencer name:', configInfluencer.name);
    
    const sql = postgres;
    const dbInfluencer = await sql`
      SELECT id, name, prompt, model_preset, is_active, created_at
      FROM influencers 
      WHERE name = ${configInfluencer.name} AND is_active = true
      LIMIT 1
    `;
    
    console.log('Database query result:', dbInfluencer);
    
    return NextResponse.json({
      configInfluencer,
      dbInfluencer,
      found: dbInfluencer.length > 0
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
