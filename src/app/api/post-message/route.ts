import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const openaiApiKey = process.env.OPENAI_API_KEY || '';

// Service role client (can bypass RLS) - initialized only when needed
let supabaseService: any;

async function generateInfluencerReply(influencerModelPreset: any, priorMessages: any[], latestUserMessage: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: influencerModelPreset.system_prompt
        },
        ...priorMessages.map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: latestUserMessage
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
    console.log(`Authenticated user ID: ${userId}`);

    // 1. Get or create conversation
    console.log('Getting or creating conversation...');
    let conversationId;
    
    // First, try to get existing conversation
    const { data: existingConversation, error: conversationError } = await supabaseService
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .single();

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('Error fetching conversation:', conversationError);
      throw new Error(`Failed to fetch conversation: ${conversationError.message}`);
    }

    if (existingConversation) {
      conversationId = existingConversation.id;
      console.log('Using existing conversation:', conversationId);
      
      // Check if user has tokens left
      const { data: conversationData, error: convError } = await supabaseService
        .from('conversations')
        .select('tokens')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('Error fetching conversation tokens:', convError);
        throw new Error(`Failed to fetch conversation data: ${convError.message}`);
      }

      if ((conversationData.tokens || 0) <= 0) {
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
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw new Error(`Failed to create conversation: ${createError.message}`);
      }
      
      conversationId = newConversation.id;
      console.log('Created new conversation:', conversationId);
    }

    // 2. Insert user message (using user client to respect RLS)
    console.log('Attempting to insert user message...');
    const { data: userMessage, error: userMessageError } = await supabaseUser
      .from('chat_messages')
      .insert({
        user_id: userId,
        influencer_id: influencerId,
        conversation_id: conversationId,
        sender: 'user',
        content: content,
      })
      .select()
      .single();

    if (userMessageError) {
      console.error('Error inserting user message:', userMessageError);
      throw new Error(`Failed to insert user message: ${userMessageError.message}`);
    }
    console.log('User message inserted successfully:', userMessage);

    // 2. Fetch influencer data (using service client)
    const { data: influencer, error: influencerError } = await supabaseService
      .from('influencers')
      .select('prompt, model_preset')
      .eq('id', influencerId)
      .single();

    if (influencerError || !influencer?.prompt) {
      console.error('Error fetching influencer:', influencerError);
      throw new Error('Influencer not found or missing system prompt');
    }

    // 3. Fetch prior messages (using service client)
    const { data: priorMessages, error: priorMessagesError } = await supabaseService
      .from('chat_messages')
      .select('sender, content')
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: true });

    if (priorMessagesError) {
      console.error('Error fetching prior messages:', priorMessagesError);
      throw new Error(`Failed to fetch prior messages: ${priorMessagesError.message}`);
    }

    // 4. Generate AI reply
    console.log('Generating AI reply...');
    const influencerReplyContent = await generateInfluencerReply(
      { system_prompt: influencer.prompt, ...influencer.model_preset },
      priorMessages,
      content
    );
    console.log('AI reply generated.');

    // 5. Insert AI message (using service client to bypass RLS)
    console.log('Attempting to insert AI message...');
    const { data: aiMessage, error: aiMessageError } = await supabaseService
      .from('chat_messages')
      .insert({
        user_id: userId,
        influencer_id: influencerId,
        conversation_id: conversationId,
        sender: 'influencer',
        content: influencerReplyContent,
      })
      .select()
      .single();

    if (aiMessageError) {
      console.error('Error inserting AI message:', aiMessageError);
      throw new Error(`Failed to insert AI message: ${aiMessageError.message}`);
    }
    console.log('AI message inserted successfully:', aiMessage);

    // 6. Deduct tokens from conversation (1 token per message sent)
    console.log('Deducting tokens from conversation...');
    const tokensPerMessage = 1; // You can adjust this based on your token pricing
    
    // First get current token count
    const { data: currentConversation, error: fetchError } = await supabaseService
      .from('conversations')
      .select('tokens')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching current tokens:', fetchError);
    } else {
      const newTokenCount = Math.max((currentConversation.tokens || 0) - tokensPerMessage, 0);
      
      const { error: tokenUpdateError } = await supabaseService
        .from('conversations')
        .update({ tokens: newTokenCount })
        .eq('id', conversationId);

      if (tokenUpdateError) {
        console.error('Error updating tokens:', tokenUpdateError);
        // Don't throw here - the message was sent successfully, token update is secondary
      } else {
        console.log(`✅ Deducted ${tokensPerMessage} token(s) from conversation (${currentConversation.tokens} → ${newTokenCount})`);
      }
    }

    return NextResponse.json({
      userMessage,
      aiMessage
    });

  } catch (error: any) {
    console.error('Error in post-message function:', error);
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
