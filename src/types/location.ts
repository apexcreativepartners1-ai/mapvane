export interface Location {
  id: string
  user_id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string | null
  website?: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type CreateLocationInput = Omit<Location, 'id' | 'user_id' | 'created_at' | 'updated_at'>