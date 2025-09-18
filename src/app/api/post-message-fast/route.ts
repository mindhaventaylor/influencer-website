import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerConfig, getApiBearerToken } from '@/lib/config';

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
  
  // chat history pairs for backend
  const chatHistory = [...chronological, { sender: 'user', content: latestUserMessage }]
    .map((msg: any) => [msg.sender === 'user' ? 'user' : 'assistant', msg.content]);

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

  console.info('msgs_cnt_by_user ->', msgsCntByUser);
  console.info('conversation_id used for count ->', conversationId);

  // Use the personality prompt from the database (passed from the main function)
  const personalityPrompt = influencerModelPreset.system_prompt || `You are ${influencerName}, a helpful AI assistant.`;

  const requestBody = {
    user_id: userId,
    creator_id: config.ai.creator_id, // Use AI creator_id from config
    influencer_name: influencerName,
    influencer_personality_prompt: personalityPrompt,
    chat_history: chatHistory,
    msgs_cnt_by_user: msgsCntByUser,
  };

  // Log the request being sent to AI for debugging
  console.log('🤖 AI REQUEST DEBUG (FAST MODE):');
  console.log('📝 User ID:', userId);
  console.log('🎭 Influencer Name:', influencerName);
  console.log('💬 Chat History:', JSON.stringify(chatHistory, null, 2));
  console.log('📊 Messages Count:', msgsCntByUser);
  console.log('🎯 Full Request Body:', JSON.stringify(requestBody, null, 2));

  const apiBearerToken = getApiBearerToken();
  console.log('🔑 Using API Bearer Token:', apiBearerToken ? `${apiBearerToken.substring(0, 10)}...` : 'NOT FOUND');
  
  const response = await fetch('http://influencer-brain-alb-1945743263.us-east-1.elb.amazonaws.com/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiBearerToken}`,
    },
    body: JSON.stringify(requestBody)
  });

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

  const data = await response.json();
  return data.response || data.message || data.content || 'Sorry, I had trouble responding.';
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
      .select('sender, content')
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
    const influencerReplyContent = await generateInfluencerReply(
      { system_prompt: influencer.prompt, ...influencer.model_preset },
      priorMessages,
      content,
      userId,
      influencer.name,
      conversationId // Use the real conversation ID
    );
    console.log('🚀 FAST MODE: AI reply generated successfully!');

    // Create temporary message objects (not saved to database yet)
    const tempUserMessage = {
      id: `temp_user_${Date.now()}`,
      user_id: userId,
      influencer_id: influencerId,
      conversation_id: conversationId, // Include the real conversation ID
      sender: 'user',
      content: content,
      created_at: new Date().toISOString(),
      is_temp: true
    };

    const tempAiMessage = {
      id: `temp_ai_${Date.now()}`,
      user_id: userId,
      influencer_id: influencerId,
      conversation_id: conversationId, // Include the real conversation ID
      sender: 'influencer',
      content: influencerReplyContent,
      created_at: new Date().toISOString(),
      is_temp: true
    };

    console.log('🚀 FAST MODE: Returning temporary messages (not saved to DB yet)');

    return NextResponse.json({
      userMessage: tempUserMessage,
      aiMessage: tempAiMessage,
      isFastMode: true
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

