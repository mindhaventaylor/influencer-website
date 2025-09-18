import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete all conversations for the user
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    if (conversationsError) {
      console.error('Error deleting conversations:', conversationsError);
      return NextResponse.json(
        { error: 'Failed to delete conversations' },
        { status: 500 }
      );
    }

    // Delete all messages for the user
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('user_id', userId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to delete messages' },
        { status: 500 }
      );
    }

    // Log the deletion for analytics
    console.log('Chat history deleted for user:', {
      userId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ 
      message: 'Chat history deleted successfully' 
    });

  } catch (error) {
    console.error('Error in delete-chat-history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

