import { supabase } from '@/lib/supabaseClient';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { createUserFriendlyError } from '@/lib/userFriendlyError';

interface UserData {
  email: string;
  password: string;
  username: string;
  display_name: string;
}

const api = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(userData: UserData) {
    const { email, password, username, display_name } = userData;
    console.log('🔄 API signUp received data:', { email, username, display_name });
    
    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("User not created in auth.");

    // Step 2: Create user profile via API endpoint (server-side with elevated permissions)
    if (authData.session) {
      try {
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.session.access_token}`,
          },
          body: JSON.stringify({
            email: authData.user.email,
            username,
            display_name
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create user profile');
        }
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't throw here - user is created in auth, profile can be created later
      }
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

  async getInfluencerById(influencerId: string) {
    return supabase
      .from('influencers')
      .select('*')
      .eq('id', influencerId)
      .single();
  },

  async getChatThread(influencerId: string, userId: string, limit = 10, offset = 0) {
    return supabase
      .from('chat_messages')
      .select('*')
      .eq('influencer_id', influencerId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 🚀 FIX: Show newest messages first
      .range(offset, offset + limit - 1);
  },

  async postMessage(influencerId: string, content: string, userId: string) {
    // Get the current session to include auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw createUserFriendlyError('Please sign in to continue', 401);
    }

    // Call the serverless function
    const response = await fetch('/api/post-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        influencerId,
        content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Provide user-friendly error messages based on status code
      const errorMessage = getUserFriendlyError({
        message: errorData.error || `HTTP ${response.status}`,
        status: response.status
      });
      throw createUserFriendlyError(errorMessage, response.status);
    }

    // The API now returns an object with both messages
    const { userMessage, aiMessage } = await response.json();
    return { userMessage, aiMessage };
  },

  async markMessagesRead(influencerId: string, userId: string) {
    return supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('influencer_id', influencerId)
      .is('read_at', null)
      .in('sender', ['influencer', 'system']);
  },

  async initializeConversation(influencerId: string) {
    // Get the current session to include auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw createUserFriendlyError('Please sign in to continue', 401);
    }

    // Call the conversation initialization endpoint
    const response = await fetch('/api/conversation/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        influencerId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Provide user-friendly error messages based on status code
      const errorMessage = getUserFriendlyError({
        message: errorData.error || `HTTP ${response.status}`,
        status: response.status
      });
      throw createUserFriendlyError(errorMessage, response.status);
    }

    return await response.json();
  },

  async createConversationForUser(userId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw createUserFriendlyError('Please sign in to continue', 401);
    }
    const response = await fetch('/api/conversation/create-for-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Provide user-friendly error messages based on status code
      const errorMessage = getUserFriendlyError({
        message: errorData.error || `HTTP ${response.status}`,
        status: response.status
      });
      throw createUserFriendlyError(errorMessage, response.status);
    }
    return await response.json();
  },

  // 🚀 FAST MODE: Get AI response immediately without saving to database
  async postMessageFast(influencerId: string, content: string, userId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw createUserFriendlyError('Please sign in to continue', 401);
    }

    const response = await fetch('/api/post-message-fast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        influencerId,
        content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = getUserFriendlyError({
        message: errorData.error || `HTTP ${response.status}`,
        status: response.status
      });
      throw createUserFriendlyError(errorMessage, response.status);
    }

    const { userMessage, aiMessage, isFastMode } = await response.json();
    return { userMessage, aiMessage, isFastMode };
  },

  // 💾 BACKGROUND SAVE: Save messages to database in background
  async saveMessagesBackground(influencerId: string, userMessage: any, aiMessage: any, userId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('No session available for background save');
      return { success: false, error: 'No session' };
    }

    try {
      const response = await fetch('/api/save-messages-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          influencerId,
          userMessage,
          aiMessage,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Background save failed:', errorData.error);
        return { success: false, error: errorData.error };
      }

      const result = await response.json();
      console.log('💾 Messages saved in background successfully');
      return result;
    } catch (error) {
      console.error('Background save error:', error);
      return { success: false, error: error.message };
    }
  },
};

export default api;
