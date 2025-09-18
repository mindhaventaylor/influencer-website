import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getInfluencerConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { email, password, reason } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get Supabase configuration
    const config = getInfluencerConfig();
    const supabaseUrl = config.database.supabase.url;
    const supabaseServiceKey = config.database.supabase.serviceRoleKey;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user credentials using service client
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Log the deletion request (optional - for analytics)
    console.log('Account deletion requested:', {
      userId: authData.user.id,
      email,
      reason,
      timestamp: new Date().toISOString(),
    });

    const userId = authData.user.id;

    // Step 1: Delete all user-related data from database tables
    try {
      // Delete chat messages
      const { error: messagesError } = await supabaseAdmin
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);
      
      if (messagesError) {
        console.error('Error deleting chat messages:', messagesError);
      }

      // Delete conversations
      const { error: conversationsError } = await supabaseAdmin
        .from('conversations')
        .delete()
        .eq('user_id', userId);
      
      if (conversationsError) {
        console.error('Error deleting conversations:', conversationsError);
      }

      // Delete user preferences
      const { error: preferencesError } = await supabaseAdmin
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);
      
      if (preferencesError) {
        console.error('Error deleting user preferences:', preferencesError);
      }

      // Delete user profile
      const { error: userError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (userError) {
        console.error('Error deleting user profile:', userError);
      }

      console.log('Successfully cleaned up user data from database');
    } catch (dbError) {
      console.error('Error cleaning up user data:', dbError);
      // Continue with auth deletion even if DB cleanup fails
    }

    // Step 2: Delete the user account from Supabase Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user account:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    });

  } catch (error) {
    console.error('Error in delete-account API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

