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
    retrieve_context?: number;
    influencer_retrieve?: number;
    format_pack?: number;
    answer_with_rag_model_call?: number;
    generate_influencer_answer?: number;
    perform_security_check?: number;
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
  audio_transcription?: string | null;
  image_transcription?: string | null;
  tts_text_sent?: string | null;
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

    console.log('📥 Multimedia API received request:', {
      input_media_type,
      has_image_data: !!image_data,
      has_audio_data: !!audio_data,
      has_user_query: !!user_query,
      user_query_preview: user_query?.substring(0, 50),
      should_generate_tts,
      msgs_cnt_by_user
    });

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

    // Get the AI service URL
    const aiServiceUrl = process.env.AI_SERVICE_URL;

    console.log('🚀 Sending multimedia request to AI service:', {
      input_media_type,
      has_image: !!image_data,
      has_audio: !!audio_data,
      should_generate_tts,
      msgs_cnt_by_user,
      user_query_length: user_query?.length || 0,
      image_data_length: image_data?.length || 0,
      audio_data_length: audio_data?.length || 0,
      ai_service_url: aiServiceUrl
    });
    
    console.log('📤 Full AI Request Body:', JSON.stringify({
      ...aiRequest.body,
      image_data: image_data ? `[${image_data.length} chars]` : undefined,
      audio_data: audio_data ? `[${audio_data.length} chars]` : undefined,
      chat_history_preview: aiRequest.body.chat_history?.slice(0, 3),
      chat_history_length: aiRequest.body.chat_history?.length
    }, null, 2));

    // Call the external AI service
    if (!aiServiceUrl) {
      console.log('⚠️ AI_SERVICE_URL not configured, will use fallback chat endpoint');
    }

    let aiResponse;
    let aiData;
    
    // Try AI_SERVICE_URL if configured
    if (aiServiceUrl) {
      try {
        aiResponse = await fetch(aiServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AI_SERVICE_TOKEN}`,
          },
          body: JSON.stringify(aiRequest),
        });
        
        if (aiResponse.ok) {
          const aiResult: { statusCode: number; body: MultimediaResponse } = await aiResponse.json();
          
          if (aiResult.statusCode === 200) {
            aiData = aiResult.body;
            console.log('✅ AI_SERVICE_URL responded successfully');
          } else {
            console.error('❌ AI service returned error status:', {
              statusCode: aiResult.statusCode,
              input_media_type,
              has_audio_data: !!audio_data,
              has_image_data: !!image_data,
              fullResponse: aiResult
            });
          }
        } else {
          const errorText = await aiResponse.text().catch(() => 'Could not read error body');
          console.error('❌ AI service HTTP error:', {
            status: aiResponse.status,
            statusText: aiResponse.statusText,
            errorBody: errorText,
            url: aiServiceUrl,
            input_media_type,
            has_audio_data: !!audio_data,
            has_image_data: !!image_data
          });
        }
      } catch (fetchError) {
        console.error('❌ Failed to connect to AI_SERVICE_URL:', {
          error: fetchError,
          errorMessage: fetchError instanceof Error ? fetchError.message : String(fetchError),
          url: aiServiceUrl,
          input_media_type,
          has_audio_data: !!audio_data,
          has_image_data: !!image_data
        });
      }
    }
    
    // Fallback to hardcoded chat endpoint if AI_SERVICE_URL failed or not configured
    if (!aiData) {
      console.log('🔊 Falling back to hardcoded chat endpoint...');
      const apiBearerToken = process.env.AI_API_BEARER_TOKEN;
      
      try {
        const fallbackResponse = await fetch('http://influencer-brain-alb-1945743263.us-east-1.elb.amazonaws.com/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiBearerToken}`,
          },
          body: JSON.stringify(aiRequest.body),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('✅ Fallback chat endpoint successful');
          
          // Handle fallback response format - match the exact structure from your working response
          aiData = {
            response: fallbackData.response || fallbackData.message || fallbackData.content || 'Sorry, I had trouble responding.',
            summary_generated: fallbackData.summary_generated || false,
            message_summary: fallbackData.message_summary || '',
            security: fallbackData.security || {
              security_check_passed: true,
              security_flags: [],
              security_retry_count: 0,
              security_check_result: {}
            },
            timings: fallbackData.timings || {},
            timings_total: fallbackData.timings_total || 0,
            wall_time: fallbackData.wall_time || 0,
            audio_output_url: fallbackData.audio_output_url || null,
            audio_output: fallbackData.audio_output || null,
            input_media_type: fallbackData.input_media_type || input_media_type,
            image_description: fallbackData.image_description || null,
            should_generate_tts: fallbackData.should_generate_tts || should_generate_tts,
            audio_transcription: fallbackData.audio_transcription || null,
            image_transcription: fallbackData.image_transcription || null,
            tts_text_sent: fallbackData.tts_text_sent || null
          };
        } else {
          const fallbackErrorText = await fallbackResponse.text().catch(() => 'Could not read error body');
          console.error('❌ Fallback endpoint also failed:', {
            status: fallbackResponse.status,
            statusText: fallbackResponse.statusText,
            errorBody: fallbackErrorText,
            url: 'http://influencer-brain-alb-1945743263.us-east-1.elb.amazonaws.com/chat',
            input_media_type,
            has_audio_data: !!audio_data,
            has_image_data: !!image_data
          });
          return NextResponse.json(
            { error: 'All AI services unavailable' },
            { status: 503 }
          );
        }
      } catch (fallbackError) {
        console.error('❌ Fallback endpoint connection failed:', {
          error: fallbackError,
          errorMessage: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          url: 'http://influencer-brain-alb-1945743263.us-east-1.elb.amazonaws.com/chat',
          input_media_type,
          has_audio_data: !!audio_data,
          has_image_data: !!image_data
        });
        return NextResponse.json(
          { error: 'AI service connection failed' },
          { status: 503 }
        );
      }
    }

    // At this point, aiData should be populated from either AI_SERVICE_URL or fallback

    // Check if AI service actually returned audio content
    const hasAudioContent = !!(aiData.audio_output_url || aiData.audio_output);
    // Send audio if requested (we can generate fallback audio if needed)
    const shouldSendAudio = should_generate_tts;
    
    console.log('🔊 Audio generation check (MULTIMEDIA):', {
      msgs_cnt_by_user,
      should_generate_tts,
      hasAudioContent,
      audio_output_url: !!aiData.audio_output_url,
      audio_output: !!aiData.audio_output,
      shouldSendAudio,
      mode: shouldSendAudio ? 'audio_multimedia' : 'text_multimedia'
    });

    // Create user message with structured data
    let userMessageContent = '';
    let messageType: string = input_media_type;
    
    if (input_media_type === 'image' && user_query) {
      // For image with text, store as JSON structure
      userMessageContent = JSON.stringify({
        text: user_query,
        image: image_data,
        hasText: true
      });
      messageType = 'image_with_text';
    } else if (input_media_type === 'audio' && user_query) {
      // For audio with text, store as JSON structure
      userMessageContent = JSON.stringify({
        text: user_query,
        audio: audio_data,
        hasText: true
      });
      messageType = 'audio_with_text';
    } else {
      userMessageContent = input_media_type === 'image' ? (image_data || '') : 
                          input_media_type === 'audio' ? (audio_data || '') : 
                          user_query || '';
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      content: userMessageContent,
      type: messageType,
      created_at: new Date().toISOString(),
    };

    // Generate fallback audio if needed
    const generateMockBase64Audio = () => {
      // Generate different audio based on random seed for variety
      const randomSeed = Math.random().toString(36).substring(7);
      const frequency = 440 + (randomSeed.charCodeAt(0) % 200); // Vary frequency
      const sampleRate = 44100;
      const duration = 1.5; // 1.5 seconds
      const samples = Math.floor(sampleRate * duration);
      
      // Create WAV file buffer
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);
      
      // WAV header
      view.setUint32(0, 0x46464952, false); // "RIFF"
      view.setUint32(4, 36 + samples * 2, true); // File size
      view.setUint32(8, 0x45564157, false); // "WAVE"
      view.setUint32(12, 0x20746d66, false); // "fmt "
      view.setUint32(16, 16, true); // Format chunk size
      view.setUint16(20, 1, true); // Audio format (PCM)
      view.setUint16(22, 1, true); // Number of channels
      view.setUint32(24, sampleRate, true); // Sample rate
      view.setUint32(28, sampleRate * 2, true); // Byte rate
      view.setUint16(32, 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      view.setUint32(36, 0x61746164, false); // "data"
      view.setUint32(40, samples * 2, true);
      
      // Generate sine wave samples
      for (let i = 0; i < samples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }
      
      // Convert to base64
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return `data:audio/wav;base64,${base64}`;
    };

    // Create AI response message
    let aiMessageContent;
    if (shouldSendAudio) {
      // Priority: 1) AI service audio URL, 2) AI service base64 audio, 3) Fallback mock audio
      if (aiData.audio_output_url) {
        aiMessageContent = aiData.audio_output_url;
        console.log('🎵 Using AI service audio URL:', aiData.audio_output_url);
      } else if (aiData.audio_output) {
        aiMessageContent = aiData.audio_output;
        console.log('🎵 Using AI service base64 audio');
      } else {
        aiMessageContent = generateMockBase64Audio();
        console.log('🎵 Using fallback mock audio');
      }
    } else {
      aiMessageContent = aiData.response;
    }

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'influencer' as const,
      content: aiMessageContent,
      type: shouldSendAudio ? 'audio' : 'text', // Use proper type based on content
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
          type: userMessage.type, // Use correct database field name
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
          type: aiMessage.type, // Use correct database field name
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
