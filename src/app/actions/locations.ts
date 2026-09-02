'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Location, CreateLocationInput } from '@/types/location'

async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handled in middleware
          }
        },
      },
    }
  )
}

export async function getLocations(): Promise<Location[]> {
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching locations:', error.message)
    return []
  }

  return data as Location[]
}

export async function addLocation(formData: CreateLocationInput) {
  const supabase = await getSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('locations')
    .insert([
      {
        ...formData,
        user_id: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  return data
}

export async function deleteLocation(id: string) {
  const supabase = await getSupabaseServerClient()
  
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}