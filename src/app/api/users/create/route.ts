import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, username, display_name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the current user from the auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Create user profile in the database
    const { error: insertError } = await supabase
      .from('users')
      .upsert([{ 
        id: user.id, 
        email: user.email,
        username: username || null,
        display_name: display_name || null
      }], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error("Error inserting user into public.users:", insertError);
      return NextResponse.json(
        { error: `Failed to create user profile: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, username, display_name }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

