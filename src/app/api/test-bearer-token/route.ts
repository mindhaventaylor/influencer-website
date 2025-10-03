import { NextRequest, NextResponse } from 'next/server';
import { getApiBearerToken } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const bearerToken = getApiBearerToken();
    
    // Test audio URL accessibility
    const testAudioUrl = 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';
    let audioUrlAccessible = false;
    let audioUrlError = null;
    
    try {
      const response = await fetch(testAudioUrl, { method: 'HEAD' });
      audioUrlAccessible = response.ok;
    } catch (error) {
      audioUrlError = (error as Error).message;
    }
    
    return NextResponse.json({
      success: true,
      hasToken: !!bearerToken,
      tokenLength: bearerToken?.length || 0,
      tokenPreview: bearerToken ? `${bearerToken.substring(0, 10)}...` : 'NOT FOUND',
      environmentVariable: process.env.AI_API_BEARER_TOKEN ? 'SET' : 'NOT SET',
      configValue: bearerToken ? 'LOADED' : 'NOT LOADED',
      audioTest: {
        url: testAudioUrl,
        accessible: audioUrlAccessible,
        error: audioUrlError
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

