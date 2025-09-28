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
    // Validate inputs
    if (!influencerId || !userId || influencerId.trim() === '' || userId.trim() === '') {
      console.error('Invalid parameters for getChatThread:', { 
        influencerId: influencerId, 
        userId: userId, 
        influencerIdType: typeof influencerId,
        userIdType: typeof userId,
        influencerIdIsEmpty: influencerId === '',
        userIdIsEmpty: userId === '',
        influencerIdIsNull: influencerId === null,
        userIdIsNull: userId === null,
        influencerIdIsUndefined: influencerId === undefined,
        userIdIsUndefined: userId === undefined
      });
      return { data: null, error: { message: `Invalid parameters: influencerId=${influencerId}, userId=${userId}` } };
    }

      console.log('🔄 API getChatThread called with:', { 
        influencerId, 
        userId, 
        limit, 
        offset,
        influencerIdType: typeof influencerId,
        userIdType: typeof userId,
        influencerIdLength: influencerId?.length,
        userIdLength: userId?.length
      });
    
    try {
      // Note: This is a client-side function, so we assume the session is already available
      // The session should be managed by the useAuth hook in the component
      console.log('🔍 getChatThread called with:', { influencerId, userId });

      console.log('✅ Session found, proceeding with query...');
      
      // Test basic table access first
      console.log('🔍 Testing table access...');
      const tableTest = await supabase
        .from('chat_messages')
        .select('count')
        .limit(1);
      
      console.log('📋 Table access test:', {
        hasData: !!tableTest.data,
        hasError: !!tableTest.error,
        error: tableTest.error
      });
      
      if (tableTest.error) {
        console.error('❌ Table access failed:', tableTest.error);
        return { data: null, error: { message: 'Database access failed' } };
      }
      
      // First, let's try a simple query without range to see if the basic query works
      console.log('🔍 Testing basic query first...', {
        influencerId,
        userId,
        influencerIdType: typeof influencerId,
        userIdType: typeof userId,
        influencerIdLength: influencerId?.length,
        userIdLength: userId?.length
      });
      
      const basicResult = await supabase
        .from('chat_messages')
        .select('*')
        .eq('influencer_id', influencerId)
        .eq('user_id', userId)
        .limit(5);
      
      console.log('📋 Basic query result:', { 
        dataLength: basicResult.data?.length, 
        error: basicResult.error,
        errorType: typeof basicResult.error,
        errorKeys: basicResult.error ? Object.keys(basicResult.error) : 'no error',
        hasData: !!basicResult.data
      });
      
      if (basicResult.error) {
        // Check if error is an empty object
        const errorKeys = basicResult.error ? Object.keys(basicResult.error) : [];
        const isEmptyError = errorKeys.length === 0;
        
        console.error('❌ Basic query failed:', {
          error: basicResult.error,
          errorCode: basicResult.error?.code,
          errorMessage: basicResult.error?.message,
          errorDetails: basicResult.error?.details,
          errorHint: basicResult.error?.hint,
          isEmptyError,
          errorKeys
        });
        return basicResult;
      }
      
      // If basic query works, try with ordering and range
      console.log('🔍 Testing with ordering and range...');
      const result = await supabase
        .from('chat_messages')
        .select('*')
        .eq('influencer_id', influencerId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      console.log('📋 Full query result:', { 
        dataLength: result.data?.length, 
        error: result.error,
        hasData: !!result.data,
        firstMessage: result.data?.[0],
        queryParams: { influencerId, userId, offset, limit }
      });
      
      if (result.error) {
        console.error('❌ Full query failed:', result.error);
        // Return the basic result if the full query fails
        return basicResult;
      }
      
      return result;
    } catch (error) {
      console.error('❌ API getChatThread exception:', error);
      return { data: null, error: { message: (error as Error).message || 'Unknown error occurred' } };
    }
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
      return { success: false, error: (error as Error).message };
    }
  },
};

export default api;
