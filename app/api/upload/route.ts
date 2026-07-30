import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { UPLOAD_CONFIG } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Sign in to upload images' } }, { status: 401 })
  }

  if (profile.is_suspended) {
    return NextResponse.json({ error: { message: 'Your account is suspended' } }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: { message: 'No file provided' } }, { status: 400 })
    }

    if (!UPLOAD_CONFIG.acceptedTypes.includes(file.type)) {
      return NextResponse.json({ error: { message: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP.' } }, { status: 400 })
    }

    if (file.size > UPLOAD_CONFIG.maxSizeBytes) {
      return NextResponse.json({ error: { message: `File size exceeds max limit of ${UPLOAD_CONFIG.maxSizeMB}MB.` } }, { status: 400 })
    }

    const supabase = await createClient()

    // File name: userId/timestamp-filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(UPLOAD_CONFIG.bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      // Fallback: If bucket doesn't exist yet or storage fails in dev, return data URL or object URL message
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(UPLOAD_CONFIG.bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (err) {
    return NextResponse.json({ error: { message: 'Failed to process file upload' } }, { status: 500 })
  }
}
