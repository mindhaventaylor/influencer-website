import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, influencer_id, conversation_id, sender, content, type } = body;

    console.log('🔍 Chat-messages API received:', {
      user_id: user_id ? 'present' : 'missing',
      influencer_id: influencer_id ? 'present' : 'missing', 
      conversation_id: conversation_id ? 'present' : 'missing',
      sender,
      content_length: content?.length || 0,
      type,
      content_preview: content?.substring(0, 100) + '...'
    });

    // Validate required fields
    if (!user_id || !influencer_id || !conversation_id || !sender || !content || !type) {
      console.error('❌ Missing required fields:', {
        user_id: !!user_id,
        influencer_id: !!influencer_id,
        conversation_id: !!conversation_id,
        sender: !!sender,
        content: !!content,
        type: !!type
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save message to database
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        user_id,
        influencer_id,
        conversation_id,
        sender,
        content,
        type  // Database actually uses 'type' field, not 'content_type'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving message:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        insertData: {
          user_id,
          influencer_id,
          conversation_id,
          sender,
          content_length: content?.length,
          type
        }
      });
      return NextResponse.json(
        { error: 'Failed to save message', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: data 
    });

  } catch (error) {
    console.error('❌ Error in chat-messages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
