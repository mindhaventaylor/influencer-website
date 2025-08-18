import { supabase } from '../lib/supabaseClient';

const api = {
  async signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(userData) {
    const response = await fetch(`/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Sign up failed');
    }
    return { data, error: null };
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

  async postMessage(influencerId, content, token) {
    // For local development, this points to your local backend.
    // For production, you should replace this with your deployed backend URL.
    const response = await fetch(
      `/api/conversations/${influencerId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to post message");
    }
    return data;
  },

  async markMessagesRead(influencerId) {
    return supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('influencer_id', influencerId)
      .is('read_at', null)
      .in('sender', ['influencer', 'system']);
  },
};

export default api;


