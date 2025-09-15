import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerConfig, getInfluencerInfo } from '@/lib/config';

// Initialize Supabase client with service role key for server-side operations
const config = getInfluencerConfig();
const supabaseUrl = config.database.supabase.url;
const supabaseServiceKey = config.database.supabase.serviceRoleKey;
const supabaseAnonKey = config.database.supabase.anonKey;

// Service role client (can bypass RLS) - initialized only when needed
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
    
    const { influencerId } = await request.json();

    if (!influencerId) {
      return NextResponse.json({ error: 'Missing influencerId' }, { status: 400 });
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
    console.log(`Initializing conversation for user: ${userId}, influencer: ${influencerId}`);

    // Check if conversation already exists
    const { data: existingConversation, error: conversationError } = await supabaseService
      .from('conversations')
      .select('id, tokens')
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .single();

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('Error checking existing conversation:', conversationError);
      throw new Error(`Failed to check conversation: ${conversationError.message}`);
    }

    if (existingConversation) {
      // Conversation already exists, return it
      console.log('Conversation already exists:', existingConversation.id);
      return NextResponse.json({
        conversationId: existingConversation.id,
        tokens: existingConversation.tokens || 0,
        isNew: false
      });
    }

    // Create new conversation with initial tokens
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
    
    console.log('Created new conversation:', newConversation.id);
    return NextResponse.json({
      conversationId: newConversation.id,
      tokens: newConversation.tokens || 0,
      isNew: true
    });

  } catch (error: any) {
    console.error('Error in conversation initialization:', error);
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
