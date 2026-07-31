import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const trimmedEmail = (email || '').trim().toLowerCase()

    if (!trimmedEmail || !password) {
      return NextResponse.json(
        { error: { message: 'Email and password are required.' } },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: { message: 'Password must be at least 6 characters.' } },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Create user via admin auth API — bypasses client SMTP / Hook 500 errors
    const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        email_domain: trimmedEmail.split('@')[1],
      },
    })

    if (createError) {
      return NextResponse.json(
        { error: { message: createError.message } },
        { status: 400 }
      )
    }

    // Ensure profile row exists
    if (userData?.user) {
      await (adminSupabase
        .from('profiles')
        .upsert(
          { id: userData.user.id, email: userData.user.email } as never,
          { onConflict: 'id' }
        ) as any)
    }

    return NextResponse.json({ success: true, user: userData.user })
  } catch (err) {
    return NextResponse.json(
      { error: { message: err instanceof Error ? err.message : 'Server error creating account' } },
      { status: 500 }
    )
  }
}
