import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerConfig } from '@/lib/config';

const config = getInfluencerConfig();
const supabaseUrl = config.database.supabase.url;
const supabaseServiceKey = config.database.supabase.serviceRoleKey;
const supabaseAnonKey = config.database.supabase.anonKey;

let supabaseService: any;

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase service client
    if (!supabaseService) {
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Missing required environment variables' }, { status: 500 });
      }
      supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    }
    
    const { influencerId, userMessage, aiMessage, userId } = await request.json();

    if (!influencerId || !userMessage || !aiMessage || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    console.log(`💾 BACKGROUND SAVE: Starting background save for user ${userId}`);

    // 1. Get or create conversation
    let conversationId;
    
    // First, try to get existing conversation
    const { data: existingConversation, error: conversationError } = await supabaseService
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .single();

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('Error checking existing conversation:', conversationError);
      throw new Error(`Failed to check conversation: ${conversationError.message}`);
    }

    if (existingConversation) {
      conversationId = existingConversation.id;
      console.log('💾 BACKGROUND SAVE: Using existing conversation:', conversationId);
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
      console.log('💾 BACKGROUND SAVE: Created new conversation:', conversationId);
    }

    // 2. Insert user message (using user client to respect RLS)
    console.log('💾 BACKGROUND SAVE: Inserting user message...');
    const { data: savedUserMessage, error: userMessageError } = await supabaseUser
      .from('chat_messages')
      .insert({
        user_id: userId,
        influencer_id: influencerId,
        conversation_id: conversationId,
        sender: 'user',
        content: userMessage.content,
        type: userMessage.type || 'text', // Use correct database field name
      })
      .select()
      .single();

    if (userMessageError) {
      console.error('Error inserting user message:', userMessageError);
      throw new Error(`Failed to insert user message: ${userMessageError.message}`);
    }
    console.log('💾 BACKGROUND SAVE: User message saved successfully');

    // 3. Insert AI message (using service client to bypass RLS)
    console.log('💾 BACKGROUND SAVE: Inserting AI message...');
    const { data: savedAiMessage, error: aiMessageError } = await supabaseService
      .from('chat_messages')
      .insert({
        user_id: userId,
        influencer_id: influencerId,
        conversation_id: conversationId,
        sender: 'influencer',
        content: aiMessage.content,
        type: aiMessage.type || 'text', // Use correct database field name
      })
      .select()
      .single();

    if (aiMessageError) {
      console.error('Error inserting AI message:', aiMessageError);
      throw new Error(`Failed to insert AI message: ${aiMessageError.message}`);
    }
    console.log('💾 BACKGROUND SAVE: AI message saved successfully');

    // 4. Deduct tokens from conversation (1 token per message sent)
    console.log('💾 BACKGROUND SAVE: Updating tokens...');
    const tokensPerMessage = 1;
    
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
        console.log(`💾 BACKGROUND SAVE: Deducted ${tokensPerMessage} token(s) from conversation (${currentConversation.tokens} → ${newTokenCount})`);
      }
    }

    console.log('💾 BACKGROUND SAVE: All messages saved successfully!');

    return NextResponse.json({
      success: true,
      savedUserMessage,
      savedAiMessage,
      conversationId,
      message: 'Messages saved successfully in background'
    });

  } catch (error: any) {
    console.error('Error in background save function:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
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

