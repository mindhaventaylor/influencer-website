import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerConfig, getApiBearerToken } from '@/lib/config';

// Local fallback response generator
function generateLocalFallbackResponse(userMessage: string, influencerName: string): string {
  const responses = [
    `Hey there! Thanks for your message: "${userMessage}". I'm ${influencerName} and I'd love to chat more, but I'm having some technical issues right now. Can you try again in a moment?`,
    `Hi! I'm ${influencerName} and I received your message about "${userMessage}". I'm experiencing some connectivity issues, but I'm here and ready to help once this is sorted out!`,
    `Hello! Thanks for reaching out with "${userMessage}". This is ${influencerName} - I'm having some technical difficulties at the moment, but I'll be back to normal soon!`,
    `Hey! I'm ${influencerName} and I see your message: "${userMessage}". I'm dealing with some system issues right now, but I appreciate you reaching out!`,
    `Hi there! I'm ${influencerName} and I got your message about "${userMessage}". I'm having some connectivity problems, but I'm working on getting back online!`
  ];
  
  // Select a response based on the user message content for variety
  const hash = userMessage.toLowerCase().split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return responses[Math.abs(hash) % responses.length];
}

// Initialize Supabase client with service role key for server-side operations
const config = getInfluencerConfig();
const supabaseUrl = config.database.supabase.url;
const supabaseServiceKey = config.database.supabase.serviceRoleKey;
const supabaseAnonKey = config.database.supabase.anonKey;
const openaiApiKey = config.ai.openaiApiKey;

// Service role client (can bypass RLS) - initialized only when needed
let supabaseService: any;

async function generateInfluencerReply(influencerModelPreset: any, priorMessages: any[], latestUserMessage: string, userId: string, influencerName: string, conversationId: string) {
  // --- ensure we don't mutate priorMessages ---
  const chronological = priorMessages.slice().reverse();
  
  // chat history pairs for backend - filter out multimedia messages to avoid base64 data
  const chatHistory = [...chronological, { sender: 'user', content: latestUserMessage }]
    .filter((msg: any) => {
      // Only include text messages, exclude image and audio messages
      const messageType = msg.type || 'text';
      return messageType === 'text' || messageType === 'image_with_text';
    })
    .slice(-10) // Limit to last 10 messages
    .map((msg: any) => {
      // For image_with_text messages, extract only the text part
      if (msg.type === 'image_with_text' && typeof msg.content === 'string') {
        try {
          const parsed = JSON.parse(msg.content);
          return [msg.sender === 'user' ? 'user' : 'assistant', parsed.text || msg.content];
        } catch {
          return [msg.sender === 'user' ? 'user' : 'assistant', msg.content];
        }
      }
      return [msg.sender === 'user' ? 'user' : 'assistant', msg.content];
    });

  // Get authoritative user message count for the whole conversation from DB
  const { count: userMsgCount, error: countError } = await supabaseService
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('sender', 'user');

  if (countError) {
    console.error('Failed to count user messages, falling back to local count:', countError);
  }

  // Use DB count if available, otherwise fallback to computed length
  const msgsCntByUser = typeof userMsgCount === 'number' ? userMsgCount : chatHistory.filter((m: any) => m[0] === 'user').length;

  // NEW: total message count for the whole conversation
  const { count: totalMsgCount, error: totalCntError } = await supabaseService
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId);

  if (totalCntError) {
    console.error('Failed to count total messages, falling back:', totalCntError);
  }

  // +1 to include this new user message that's about to be added
  const msgsCntTotal = typeof totalMsgCount === 'number'
    ? totalMsgCount + 1
    : chatHistory.length + 1;

  console.info('msgs_cnt_by_user ->', msgsCntByUser);
  console.info('msgs_cnt_total ->', msgsCntTotal);
  console.info('conversation_id used for count ->', conversationId);

  // Use the personality prompt from the database (passed from the main function)
  const personalityPrompt = influencerModelPreset.system_prompt || `You are ${influencerName}, a helpful AI assistant.`;

  // Configure audio generation - Always generate audio for every response
  const shouldGenerateAudio = true;
  console.log('🔊 Audio generation check (FAST MODE):', {
    msgs_cnt_by_user: msgsCntByUser,
    should_generate_tts: shouldGenerateAudio,
    shouldSendAudio: true,
    mode: 'always_audio_fast'
  });

  const requestBody = {
    user_id: userId,
    creator_id: config.ai.creator_id, // Use AI creator_id from config
    influencer_name: influencerName,
    influencer_personality_prompt: personalityPrompt,
    chat_history: chatHistory,
    msgs_cnt_by_user: msgsCntByUser,
    msgs_cnt_total: msgsCntTotal, // NEW
    input_media_type: 'text',
    user_query: latestUserMessage,
    should_generate_tts: shouldGenerateAudio,
    elevenlabs_voice_id: process.env.ELEVENLABS_VOICE_ID,
  };

  // Log the request being sent to AI for debugging
  console.log('🤖 AI REQUEST DEBUG (FAST MODE):');
  console.log('📝 User ID:', userId);
  console.log('🎭 Influencer Name:', influencerName);
  console.log('💬 Chat History:', JSON.stringify(chatHistory, null, 2));
  console.log('📊 Messages Count:', msgsCntByUser);
  console.log('🔊 Audio Generation:', shouldGenerateAudio);
  console.log('🎯 Full Request Body:', JSON.stringify(requestBody, null, 2));

  const apiBearerToken = getApiBearerToken();
  console.log('🔑 Using API Bearer Token:', apiBearerToken ? `${apiBearerToken.substring(0, 10)}...` : 'NOT FOUND');
  
  // Try multimedia endpoint first (for audio generation)
  const aiServiceUrl = process.env.AI_SERVICE_URL;
  let response;
  let data;

  if (aiServiceUrl) {
    try {
      console.log('🔊 Attempting multimedia endpoint for audio generation...');
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout (increased)
      
      response = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          isBase64Encoded: false,
          body: requestBody
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        data = await response.json();
        console.log('✅ Multimedia endpoint successful');
        
        // Handle the multimedia response format
        if (data.statusCode === 200 && data.body) {
          const { body } = data;
          console.log('🎵 AI Service Response Body:', {
            hasResponse: !!body.response,
            hasAudioUrl: !!body.audio_output_url,
            hasBase64Audio: !!body.audio_base64,
            hasAudioData: !!body.audio_data,
            responseKeys: Object.keys(body),
            audioUrlPreview: body.audio_output_url?.substring(0, 50),
            base64Preview: body.audio_base64?.substring(0, 50)
          });
          
          return {
            response: body.response || body.message || body.content || 'Sorry, I had trouble responding.',
            audio_output_url: body.audio_output_url,
            audio_base64: body.audio_base64 || body.audio_data || body.base64_audio,
            shouldGenerateAudio: shouldGenerateAudio
          };
        }
      } else {
        console.log('⚠️ Multimedia endpoint failed, falling back to chat endpoint');
      }
    } catch (multimediaError: any) {
      if (multimediaError.name === 'AbortError') {
        console.log('⏰ Multimedia endpoint timeout (45s), falling back to chat endpoint');
      } else {
        console.log('⚠️ Multimedia endpoint error, falling back to chat endpoint:', multimediaError.message);
      }
    }
  }

  // Fallback to regular chat endpoint
  console.log('🔊 Using fallback chat endpoint...');
  
  // Create AbortController for fallback timeout
  const fallbackController = new AbortController();
  const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 25000); // 25 second timeout for fallback (increased)
  
  try {
    response = await fetch('http://influencer-brain-alb-1945743263.us-east-1.elb.amazonaws.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiBearerToken}`,
      },
      body: JSON.stringify(requestBody),
      signal: fallbackController.signal
    });
    
    clearTimeout(fallbackTimeoutId);
  } catch (fallbackError: any) {
    clearTimeout(fallbackTimeoutId);
    if (fallbackError.name === 'AbortError') {
      console.error('⏰ Fallback chat endpoint timeout (25s)');
      // Provide a local fallback response instead of throwing an error
      console.log('🔄 AI service completely unavailable, providing local fallback response');
      
      // Generate a local response based on the user's message
      const localResponse = generateLocalFallbackResponse(latestUserMessage, influencerName);
      
      return {
        response: localResponse,
        audio_output_url: null,
        shouldGenerateAudio: false
      };
    } else {
      throw fallbackError;
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🚨 External API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      url: 'http://influencer-brain-alb-1945743263.us-east-1.elb.amazonaws.com/chat',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiBearerToken ? `${apiBearerToken.substring(0, 10)}...` : 'NOT FOUND'}`,
      }
    });
    throw new Error(`Custom API error: ${response.statusText} (${response.status}) - ${errorText}`);
  }

  data = await response.json();
  
  // Chat endpoint doesn't support audio, so return text response
  return {
    response: data.response || data.message || data.content || 'Sorry, I had trouble responding.',
    audio_output_url: null,
    shouldGenerateAudio: false
  };
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase service client
    if (!supabaseService) {
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Missing required environment variables' }, { status: 500 });
      }
      supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    }
    
    const { influencerId, content } = await request.json();

    if (!influencerId || !content) {
      return NextResponse.json({ error: 'Missing influencerId or content' }, { status: 400 });
    }

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Create user client to verify authentication
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const userId = user.id;
    console.log(`🚀 FAST MODE: Authenticated user ID: ${userId}`);

    // Get or create conversation (like regular mode) to ensure we have a valid conversation ID
    console.log('🚀 FAST MODE: Getting or creating conversation...');
    let conversationId;
    let conversation;
    
    // First, try to get existing conversation
    const { data: existingConversation, error: conversationError } = await supabaseService
      .from('conversations')
      .select('id, tokens')
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .single();

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('Error fetching conversation:', conversationError);
      throw new Error(`Failed to fetch conversation: ${conversationError.message}`);
    }

    if (existingConversation) {
      conversationId = existingConversation.id;
      conversation = existingConversation;
      console.log('🚀 FAST MODE: Using existing conversation:', conversationId);
      
      // Check if user has tokens left
      if ((conversation.tokens || 0) <= 0) {
        return NextResponse.json({ 
          error: 'No tokens remaining. Please purchase a plan to continue chatting.' 
        }, { status: 402 }); // 402 Payment Required
      }
    } else {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabaseService
        .from('conversations')
        .insert({
          user_id: userId,
          influencer_id: influencerId,
          tokens: 100 // Give user some initial tokens
        })
        .select('id, tokens')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw new Error(`Failed to create conversation: ${createError.message}`);
      }
      
      conversationId = newConversation.id;
      conversation = newConversation;
      console.log('🚀 FAST MODE: Created new conversation:', conversationId);
    }

    // Get influencer data for AI prompt
    console.log('🚀 FAST MODE: Fetching influencer data...');
    const { data: influencer, error: influencerError } = await supabaseService
      .from('influencers')
      .select('id, name, prompt, model_preset')
      .eq('id', influencerId)
      .eq('is_active', true)
      .single();

    if (influencerError || !influencer?.prompt) {
      console.error('Error fetching influencer:', influencerError);
      throw new Error(`Failed to fetch influencer: ${influencerError?.message || 'Missing prompt'}`);
    }

    // Get prior messages for context (limit to last messages)
    console.log('🚀 FAST MODE: Fetching prior messages...');
    const { data: priorMessages, error: priorMessagesError } = await supabaseService
      .from('chat_messages')
      .select('sender, content, type')
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false })
      .limit(20); // Get last 20 messages, then we'll take the last ones in the function

    if (priorMessagesError) {
      console.error('Error fetching prior messages:', priorMessagesError);
      throw new Error(`Failed to fetch prior messages: ${priorMessagesError.message}`);
    }

    // Generate AI reply (FAST - no database operations)
    console.log('🚀 FAST MODE: Generating AI reply...');
    
    // Add random delay to simulate realistic response time (1-4 seconds)
    const randomDelay = Math.random() * 3000 + 1000; // 1-4 seconds
    console.log(`🚀 FAST MODE: Adding ${Math.round(randomDelay)}ms delay...`);
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    const aiReplyResult = await generateInfluencerReply(
      { system_prompt: influencer.prompt, ...influencer.model_preset },
      priorMessages,
      content,
      userId,
      influencer.name,
      conversationId // Use the real conversation ID
    );
    console.log('🚀 FAST MODE: AI reply generated successfully!');

    // VARIABLE RESPONSE: Randomly choose between text and audio responses
    const shouldSendAudio = Math.random() <= 0.4; // 40% chance of audio, 60% text (balanced for stability)
    console.log(`🎲 Random response type: ${shouldSendAudio ? 'AUDIO' : 'TEXT'} (${Math.random().toFixed(2)})`);
    
    // Generate base64 audio content for testing
    const generateMockBase64Audio = () => {
      // Generate different audio based on random seed for variety
      const randomSeed = Math.random().toString(36).substring(7);
      console.log(`🎵 Generating mock audio with seed: ${randomSeed}`);
      
      // Generate a simple beep sound as base64 WAV
      // This is a 1-second 440Hz sine wave at 44.1kHz sample rate
      const sampleRate = 44100;
      const duration = 1; // 1 second
      const frequency = 440; // A4 note
      const samples = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + samples * 2); // WAV header + samples
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
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
    
    let aiMessageContent;
    let responseType;
    
    if (shouldSendAudio) {
      // Priority: 1) Base64 from API, 2) URL from API, 3) Mock base64
      if (aiReplyResult.audio_base64) {
        aiMessageContent = aiReplyResult.audio_base64;
        responseType = 'audio';
        console.log('🎵 Using REAL AI base64 audio from API response');
      } else if (aiReplyResult.audio_output_url) {
        aiMessageContent = aiReplyResult.audio_output_url;
        responseType = 'audio';
        console.log('🎵 Using REAL AI audio URL:', aiReplyResult.audio_output_url);
      } else {
        aiMessageContent = generateMockBase64Audio();
        responseType = 'audio';
        console.log('🎵 AI audio not available, using mock base64 audio');
      }
    } else {
      aiMessageContent = aiReplyResult.response || 'Hello! This is a text response.';
      responseType = 'text';
    }
    
    const aiMessageType = shouldSendAudio ? 'audio' : 'text'; // Use proper type based on content

    console.log('🔊 FAST MODE AI message configuration:', {
      shouldSendAudio,
      hasRealAudioUrl: !!aiReplyResult.audio_output_url,
      hasRealBase64Audio: !!aiReplyResult.audio_base64,
      messageType: aiMessageType,
      responseType: responseType,
      contentLength: aiMessageContent?.length,
      isMockAudio: !aiReplyResult.audio_output_url && !aiReplyResult.audio_base64,
      isBase64Audio: aiMessageContent?.startsWith('data:audio/'),
      isHttpAudio: aiMessageContent?.startsWith('http'),
      contentPreview: aiMessageContent?.substring(0, 50),
      hasContent: !!aiMessageContent,
      audioSource: aiReplyResult.audio_base64 ? 'API_BASE64' : 
                   aiReplyResult.audio_output_url ? 'API_URL' : 'MOCK_BASE64'
    });

    // Create temporary message objects (not saved to database yet)
    const tempUserMessage = {
      id: `temp_user_${Date.now()}`,
      user_id: userId,
      influencer_id: influencerId,
      conversation_id: conversationId, // Include the real conversation ID
      sender: 'user',
      content: content,
      type: 'text',
      created_at: new Date().toISOString(),
      is_temp: true
    };

    const tempAiMessage = {
      id: `temp_ai_${Date.now()}`,
      user_id: userId,
      influencer_id: influencerId,
      conversation_id: conversationId, // Include the real conversation ID
      sender: 'influencer',
      content: aiMessageContent,
      type: aiMessageType,
      created_at: new Date().toISOString(),
      is_temp: true
    };

    console.log('🚀 FAST MODE: Returning temporary messages (not saved to DB yet)');

    return NextResponse.json({
      userMessage: tempUserMessage,
      aiMessage: tempAiMessage,
      isFastMode: true,
      audioGenerated: shouldSendAudio,
      responseType: responseType,
      isMockAudio: shouldSendAudio && !aiReplyResult.audio_output_url
    });

  } catch (error: any) {
    console.error('Error in post-message-fast function:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

