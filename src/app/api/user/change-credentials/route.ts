import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { currentEmail, newEmail, currentPassword, newPassword } = await request.json();

    if (!currentEmail || !currentPassword) {
      return NextResponse.json(
        { error: 'Current email and password are required' },
        { status: 400 }
      );
    }

    // Verify current credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid current credentials' },
        { status: 401 }
      );
    }

    const updates: any = {};

    // Update email if provided
    if (newEmail && newEmail !== currentEmail) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (emailError) {
        return NextResponse.json(
          { error: 'Failed to update email: ' + emailError.message },
          { status: 400 }
        );
      }
    }

    // Update password if provided
    if (newPassword) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        return NextResponse.json(
          { error: 'Failed to update password: ' + passwordError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ 
      message: 'Credentials updated successfully' 
    });

  } catch (error) {
    console.error('Error in change-credentials API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
