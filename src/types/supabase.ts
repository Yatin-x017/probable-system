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
      projects: {
        Row: {
          id: string
          slug: string
          title: string
          summary: string | null
          role: string | null
          type: string[] | null
          cover_image_url: string | null
          video_url: string | null
          problem: string | null
          process: string | null
          outcome: string | null
          tech_stack: string[] | null
          live_url: string | null
          repo_url: string | null
          featured: boolean | null
          published: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          summary?: string | null
          role?: string | null
          type?: string[] | null
          cover_image_url?: string | null
          video_url?: string | null
          problem?: string | null
          process?: string | null
          outcome?: string | null
          tech_stack?: string[] | null
          live_url?: string | null
          repo_url?: string | null
          featured?: boolean | null
          published?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          summary?: string | null
          role?: string | null
          type?: string[] | null
          cover_image_url?: string | null
          video_url?: string | null
          problem?: string | null
          process?: string | null
          outcome?: string | null
          tech_stack?: string[] | null
          live_url?: string | null
          repo_url?: string | null
          featured?: boolean | null
          published?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      project_images: {
        Row: {
          id: string
          project_id: string | null
          image_url: string
          caption: string | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          image_url: string
          caption?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          project_id?: string | null
          image_url?: string
          caption?: string | null
          sort_order?: number | null
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: string | null
          cover_image_url: string | null
          published: boolean | null
          published_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          content?: string | null
          cover_image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string | null
          cover_image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          read?: boolean | null
          created_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          name: string
          email: string
          purpose: string | null
          starts_at: string
          ends_at: string
          google_event_id: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          purpose?: string | null
          starts_at: string
          ends_at: string
          google_event_id?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          purpose?: string | null
          starts_at?: string
          ends_at?: string
          google_event_id?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          client_name: string | null
          project_id: string | null
          amount: number
          currency: string | null
          status: string | null
          invoice_note: string | null
          paid_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          client_name?: string | null
          project_id?: string | null
          amount: number
          currency?: string | null
          status?: string | null
          invoice_note?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          client_name?: string | null
          project_id?: string | null
          amount?: number
          currency?: string | null
          status?: string | null
          invoice_note?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
      }
      site_content: {
        Row: {
          id: string
          content: Json
          updated_at: string | null
        }
        Insert: {
          id: string
          content: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          content?: Json
          updated_at?: string | null
        }
      }
      admin_profile: {
        Row: {
          id: string
          full_name: string | null
          google_calendar_connected: boolean | null
        }
        Insert: {
          id: string
          full_name?: string | null
          google_calendar_connected?: boolean | null
        }
        Update: {
          id?: string
          full_name?: string | null
          google_calendar_connected?: boolean | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
