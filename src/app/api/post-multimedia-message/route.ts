import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getClientInfluencerInfo } from '@/lib/clientConfig';

interface MultimediaRequest {
  user_id: string;
  creator_id: string;
  influencer_name: string;
  chat_history: [string, string][];
  msgs_cnt_by_user: number;
  input_media_type: 'text' | 'audio' | 'image';
  user_query?: string;
  image_data?: string;
  audio_data?: string;
  should_generate_tts: boolean;
  elevenlabs_voice_id?: string;
}

interface MultimediaResponse {
  response: string;
  summary_generated: boolean;
  message_summary: string;
  security: {
    security_check_passed: boolean;
    security_flags: string[];
    security_retry_count: number;
    security_check_result: any;
  };
  timings: {
    retrieval?: number;
    generation?: number;
    tts?: number;
    image_processing?: number;
    audio_transcription?: number;
    summarization?: number;
  };
  timings_total: number;
  wall_time: number;
  audio_output?: string | null;
  audio_output_url?: string | null;
  input_media_type: string;
  image_description?: string | null;
  should_generate_tts: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      user_id,
      creator_id,
      influencer_name,
      chat_history,
      msgs_cnt_by_user,
      input_media_type,
      user_query = '',
      image_data,
      audio_data,
      should_generate_tts,
      elevenlabs_voice_id
    }: MultimediaRequest = body;

    // Validate required fields
    if (!user_id || !creator_id || !input_media_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate media-specific requirements
    if (input_media_type === 'image' && !image_data) {
      return NextResponse.json(
        { error: 'image_data is required for image input' },
        { status: 400 }
      );
    }

    if (input_media_type === 'audio' && !audio_data) {
      return NextResponse.json(
        { error: 'audio_data is required for audio input' },
        { status: 400 }
      );
    }

    // Get influencer info
    const clientInfluencer = getClientInfluencerInfo();
    
    // Prepare the request for the external AI service
    const aiRequest = {
      isBase64Encoded: false,
      body: {
        user_id,
        creator_id,
        influencer_name: influencer_name || clientInfluencer.displayName,
        chat_history,
        msgs_cnt_by_user,
        input_media_type,
        user_query,
        should_generate_tts,
        elevenlabs_voice_id: elevenlabs_voice_id || process.env.ELEVENLABS_VOICE_ID,
        ...(image_data && { image_data }),
        ...(audio_data && { audio_data })
      }
    };

    console.log('🚀 Sending multimedia request to AI service:', {
      input_media_type,
      has_image: !!image_data,
      has_audio: !!audio_data,
      should_generate_tts,
      msgs_cnt_by_user
    });

    // Call the external AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    
    if (!aiServiceUrl) {
      console.log('⚠️ AI_SERVICE_URL not configured, returning 503');
      return NextResponse.json(
        { error: 'Multimedia service not configured' },
        { status: 503 }
      );
    }

    let aiResponse;
    try {
      aiResponse = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_SERVICE_TOKEN}`,
        },
        body: JSON.stringify(aiRequest),
      });
    } catch (fetchError) {
      console.error('❌ Failed to connect to AI service:', fetchError);
      return NextResponse.json(
        { error: 'AI service connection failed' },
        { status: 503 }
      );
    }

    if (!aiResponse.ok) {
      console.error('❌ AI service error:', aiResponse.status, aiResponse.statusText);
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 503 }
      );
    }

    const aiResult: { statusCode: number; body: MultimediaResponse } = await aiResponse.json();
    
    if (aiResult.statusCode !== 200) {
      console.error('❌ AI service returned error:', aiResult);
      return NextResponse.json(
        { error: 'AI service error' },
        { status: 500 }
      );
    }

    const { body: aiData } = aiResult;

    // Generate random number between 5-8 for audio responses
    const shouldGenerateRandomAudio = Math.floor(Math.random() * 4) + 5; // 5-8
    const shouldSendAudio = should_generate_tts || (msgs_cnt_by_user % shouldGenerateRandomAudio === 0);

    // Create user message with structured data
    let userMessageContent = '';
    if (input_media_type === 'image' && user_query) {
      // For image with text, store as JSON structure
      userMessageContent = JSON.stringify({
        text: user_query,
        image: image_data,
        hasText: true
      });
    } else {
      userMessageContent = input_media_type === 'image' ? image_data : 
                          input_media_type === 'audio' ? audio_data : 
                          user_query || '';
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      content: userMessageContent,
      type: input_media_type,
      created_at: new Date().toISOString(),
    };

    // Create AI response message
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'influencer' as const,
      content: shouldSendAudio && aiData.audio_output_url ? aiData.audio_output_url : aiData.response,
      type: shouldSendAudio ? 'audio' : 'text',
      created_at: new Date().toISOString(),
    };

    // Save messages to database
    try {
      // Get or create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user_id)
        .eq('influencer_id', creator_id)
        .single();
      
      let conversationId = conversation?.id;
      
      if (convError || !conversationId) {
        // Create new conversation
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert([{
            user_id,
            influencer_id: creator_id,
          }])
          .select('id')
          .single();
        
        if (newConvError) {
          console.error('❌ Error creating conversation:', newConvError);
          return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
          );
        }
        
        conversationId = newConv.id;
      }

      const { error: userError } = await supabase
        .from('chat_messages')
        .insert([{
          user_id,
          influencer_id: creator_id,
          conversation_id: conversationId,
          sender: userMessage.sender,
          content: userMessage.content,
          type: userMessage.type,
        }]);

      if (userError) {
        console.error('❌ Error saving user message:', userError);
      }

      const { error: aiError } = await supabase
        .from('chat_messages')
        .insert([{
          user_id,
          influencer_id: creator_id,
          conversation_id: conversationId,
          sender: aiMessage.sender,
          content: aiMessage.content,
          type: aiMessage.type,
        }]);

      if (aiError) {
        console.error('❌ Error saving AI message:', aiError);
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      // Continue execution even if database save fails
    }

    console.log('✅ Multimedia message processed successfully:', {
      input_type: input_media_type,
      output_type: shouldSendAudio ? 'audio' : 'text',
      has_audio_output: !!aiData.audio_output_url
    });

    return NextResponse.json({
      userMessage,
      aiMessage,
      audioGenerated: shouldSendAudio
    });

  } catch (error) {
    console.error('❌ Error processing multimedia message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
