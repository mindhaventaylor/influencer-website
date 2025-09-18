import { NextRequest, NextResponse } from 'next/server';
import { getApiBearerToken } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const bearerToken = getApiBearerToken();
    
    return NextResponse.json({
      success: true,
      hasToken: !!bearerToken,
      tokenLength: bearerToken?.length || 0,
      tokenPreview: bearerToken ? `${bearerToken.substring(0, 10)}...` : 'NOT FOUND',
      environmentVariable: process.env.AI_API_BEARER_TOKEN ? 'SET' : 'NOT SET',
      configValue: bearerToken ? 'LOADED' : 'NOT LOADED'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

