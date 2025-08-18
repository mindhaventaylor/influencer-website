import { supabase } from '../lib/supabaseClient';
import { generateInfluencerReply } from '../lib/llmHelper';

const api = {
  async signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(userData) {
    const { email, password, username, display_name } = userData;
    
    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("User not created in auth.");

    // Step 2: Insert the user profile into the public.users table
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ 
        id: authData.user.id, 
        email: authData.user.email,
        username: username,
        display_name: display_name
      }]);

    if (insertError) {
      console.error("Error inserting user into public.users:", insertError);
      // Optional: Clean up the user from auth if profile insertion fails
      // await supabase.auth.api.deleteUser(authData.user.id);
      throw new Error("Failed to create user profile.");
    }

    return { data: authData, error: null };
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getConversations() {
    return supabase
      .from('conversations')
      .select('*, influencers(*)');
  },

  async getInfluencers() {
    return supabase
      .from('influencers')
      .select('*')
      .eq('is_active', true);
  },

  async getInfluencerById(influencerId) {
    return supabase
      .from('influencers')
      .select('*')
      .eq('id', influencerId)
      .single();
  },

  async getChatThread(influencerId, userId, limit = 20, offset = 0) {
    return supabase
      .from('chat_messages')
      .select('*')
      .eq('influencer_id', influencerId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
  },

  async postMessage(influencerId, content, userId) {
    // 1. Insert user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        influencer_id: influencerId,
        sender: 'user',
        content: content,
      })
      .select()
      .single();

    if (userMessageError) throw new Error(userMessageError.message);

    // 2. Fetch influencer's system prompt and prior messages
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select('prompt, model_preset')
      .eq('id', influencerId)
      .single();

    if (influencerError || !influencer?.prompt) {
      throw new Error('Influencer not found or missing system prompt.');
    }

    const { data: priorMessages, error: priorMessagesError } = await supabase
      .from('chat_messages')
      .select('sender, content')
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: true });

    if (priorMessagesError) throw new Error(priorMessagesError.message);

    // 3. Generate influencer reply using LLM helper
    let influencerReplyContent;
    try {
      const modelPreset = {
        ...influencer.model_preset,
        system_prompt: influencer.prompt,
      };
      influencerReplyContent = await generateInfluencerReply(
        modelPreset,
        priorMessages,
        content
      );
    } catch (llmError) {
      console.error('LLM generation failed:', llmError);
      throw new Error('Failed to generate AI reply.');
    }

    // 4. Insert influencer reply
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        influencer_id: influencerId,
        sender: 'influencer',
        content: influencerReplyContent,
      })
      .select()
      .single();

    if (aiMessageError) throw new Error(aiMessageError.message);

    return aiMessage;
  },

  async markMessagesRead(influencerId, userId) {
    return supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .is('read_at', null)
      .in('sender', ['influencer', 'system']);
  },
};

export default api;


