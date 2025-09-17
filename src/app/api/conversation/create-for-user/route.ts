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
    console.log('🔄 Create conversation for user endpoint called');
    
    if (!supabaseService) {
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing required environment variables');
        return NextResponse.json({ error: 'Missing required environment variables' }, { status: 500 });
      }
      supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    }

    const { userId } = await request.json();
    console.log('📝 Received userId:', userId);

    if (!userId) {
      console.error('❌ Missing userId in request');
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('❌ Invalid authentication:', userError);
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }
    console.log('✅ User authenticated:', user.id);

    // Ensure user exists in the users table (upsert for better performance)
    const { error: userUpsertError } = await supabaseService
      .from('users')
      .upsert([{ 
        id: user.id, 
        email: user.email,
        username: user.email?.split('@')[0] || null,
        display_name: user.email?.split('@')[0] || null
      }], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (userUpsertError) {
      console.error('Error upserting user:', userUpsertError);
      throw new Error(`Failed to ensure user exists: ${userUpsertError.message}`);
    }
    console.log('✅ User profile ensured');

    // Get the influencer ID from the database by name
    const { data: influencer, error: influencerError } = await supabaseService
      .from('influencers')
      .select('id')
      .eq('name', config.influencer.name)
      .eq('is_active', true)
      .single();

    if (influencerError || !influencer) {
      console.error('Error fetching influencer:', influencerError);
      throw new Error(`Failed to fetch influencer: ${influencerError?.message || 'Influencer not found'}`);
    }

    const influencerId = influencer.id;

    // Check if conversation already exists first
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

    let conversation;
    if (existingConversation) {
      // Conversation already exists, use it
      console.log('Conversation already exists:', existingConversation.id);
      conversation = existingConversation;
    } else {
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
      conversation = newConversation;
    }

    console.log('Conversation ensured for user:', conversation.id);
    return NextResponse.json({
      conversationId: conversation.id,
      tokens: conversation.tokens,
      message: 'Conversation ensured successfully.'
    });
  } catch (error: any) {
    console.error('Error in create-conversation-for-user function:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
