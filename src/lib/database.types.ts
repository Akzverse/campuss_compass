export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: string
          name: string
          code: string
          type: string
          description: string | null
          image_url: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          type: string
          description?: string | null
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          type?: string
          description?: string | null
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      floors: {
        Row: {
          id: string
          building_id: string
          floor_number: number
          name: string
          map_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          building_id: string
          floor_number: number
          name: string
          map_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          floor_number?: number
          name?: string
          map_image_url?: string | null
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          floor_id: string
          name: string
          type: string
          room_number: string | null
          description: string | null
          role_access: string[]
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          floor_id: string
          name: string
          type: string
          room_number?: string | null
          description?: string | null
          role_access?: string[]
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          floor_id?: string
          name?: string
          type?: string
          room_number?: string | null
          description?: string | null
          role_access?: string[]
          image_url?: string | null
          created_at?: string
        }
      }
      waypoints: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          building_id: string
          floor_id: string | null
          waypoint_type: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          building_id: string
          floor_id?: string | null
          waypoint_type: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          building_id?: string
          floor_id?: string | null
          waypoint_type?: string
          created_at?: string
        }
      }
      navigation_steps: {
        Row: {
          id: string
          from_location_id: string
          to_location_id: string
          step_number: number
          waypoint_id: string
          instruction: string
          created_at: string
        }
        Insert: {
          id?: string
          from_location_id: string
          to_location_id: string
          step_number: number
          waypoint_id: string
          instruction: string
          created_at?: string
        }
        Update: {
          id?: string
          from_location_id?: string
          to_location_id?: string
          step_number?: number
          waypoint_id?: string
          instruction?: string
          created_at?: string
        }
      }
    }
  }
}

export type Building = Database['public']['Tables']['buildings']['Row'];
export type Floor = Database['public']['Tables']['floors']['Row'];
export type Location = Database['public']['Tables']['locations']['Row'];
export type Waypoint = Database['public']['Tables']['waypoints']['Row'];
export type NavigationStep = Database['public']['Tables']['navigation_steps']['Row'];
