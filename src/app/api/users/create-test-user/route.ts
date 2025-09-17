import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const sql = postgres;

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser) {
      return NextResponse.json({
        user: {
          id: existingUser.id,
          email: email,
          displayName: displayName || 'Test User'
        }
      });
    }

    // Create new user
    const [newUser] = await sql`
      INSERT INTO users (
        email, display_name, created_at, updated_at
      ) VALUES (
        ${email}, ${displayName || 'Test User'}, now(), now()
      )
      RETURNING id, email, display_name
    `;

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name
      }
    });

  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
