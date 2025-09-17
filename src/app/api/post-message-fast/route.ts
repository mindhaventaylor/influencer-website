import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerConfig } from '@/lib/config';

// Initialize Supabase client with service role key for server-side operations
const config = getInfluencerConfig();
const supabaseUrl = config.database.supabase.url;
const supabaseServiceKey = config.database.supabase.serviceRoleKey;
const supabaseAnonKey = config.database.supabase.anonKey;
const openaiApiKey = config.ai.openaiApiKey;

// Service role client (can bypass RLS) - initialized only when needed
let supabaseService: any;

async function generateInfluencerReply(influencerModelPreset: any, priorMessages: any[], latestUserMessage: string, userId: string, influencerName: string) {
  // Reverse the messages to get chronological order (oldest first)
  const reversedMessages = priorMessages.reverse();
  
  // Get the last messages (including the current one) for chat history
  const allMessages = [...reversedMessages, { sender: 'user', content: latestUserMessage }];
  
  // Convert messages to the format expected by the custom API
  const chatHistory = allMessages.map((msg: any) => [
    msg.sender === 'user' ? 'user' : 'assistant',
    msg.content
  ]);

  // Count messages by user
  const msgsCntByUser = allMessages.filter((msg: any) => msg.sender === 'user').length;

  // Create the personality prompt based on the influencer's prompt
  const personalityPrompt = `You are ${influencerName}. Message the user as their close companion Personality: ${influencerName} 1. Core temperament Earnestly sincere & empathetic – privileges authenticity above looks or status; defines beauty as "sincerity" and cherishes people's quirks Playfully bubbly – quick squeals ("This is the best day ever!"), dramatic superlatives, delighted gasps, light self-deprecation Curious creative Hard-working realist 2. Speech rhythm & verbal tics Sentences often cascade into mini-lists ("funny, happy, sad, you know, going through a rough time"). Frequent fillers & hedges: "like," "you know," "I mean," "kinda," "literally," soft laughs: "haha" in mid-sentence. Uses story-lets ("So I was in an airport bathroom, writing on a paper towel…") Rhetorical questions to draw listeners in. Sprinkles vivid images & metaphors (e.g., guitars "with koi fish swimming up the neck"). Enthusiastic reactions: gasps, "oh my gosh," playful sound effects Keeps a conversational back-and-forth cadence—asks the listener tiny questions, checks their reaction, then continues. 3. Favorite go-to subjects & motifs Songwriting craft - writing anywhere, characters & narrative arcs Friends & gratitude – Friend stories, gifting stories Cats & cozy life - cat pets; cat puns Pop-culture fandom - Crime shows (CSI, SVU) binge-watching History & reading - Obsesses over presidents, Kennedys, museums 4. Lexicon cheat-sheet (not limited to this) Core fillers: like, you know, I mean, kinda, honestly, literally Sparkle words: magical, amazing, ridiculous(ly), best-thing-ever, adorable Self-refs: "when I was 15…", "I'm such a cat-person" Mini sounds: giggles, sighs, little gasp, "uh-oh", "hahaha".`;

  const requestBody = {
    user_id: userId,
    creator_id: config.ai.creator_id, // Use AI creator_id from config
    influencer_name: influencerName,
    influencer_personality_prompt: personalityPrompt,
    chat_history: chatHistory,
    msgs_cnt_by_user: msgsCntByUser,
    is_summary_turn: false
  };

  // Log the request being sent to AI for debugging
  console.log('🤖 AI REQUEST DEBUG (FAST MODE):');
  console.log('📝 User ID:', userId);
  console.log('🎭 Influencer Name:', influencerName);
  console.log('💬 Chat History:', JSON.stringify(chatHistory, null, 2));
  console.log('📊 Messages Count:', msgsCntByUser);
  console.log('🎯 Full Request Body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('http://influencer-brain-alb-1945743263.us-east-1.elb.amazonaws.com/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.statusText}`);
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
      influencer.name
    );
    console.log('🚀 FAST MODE: AI reply generated successfully!');

    // Create temporary message objects (not saved to database yet)
    const tempUserMessage = {
      id: `temp_user_${Date.now()}`,
      user_id: userId,
      influencer_id: influencerId,
      sender: 'user',
      content: content,
      created_at: new Date().toISOString(),
      is_temp: true
    };

    const tempAiMessage = {
      id: `temp_ai_${Date.now()}`,
      user_id: userId,
      influencer_id: influencerId,
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

