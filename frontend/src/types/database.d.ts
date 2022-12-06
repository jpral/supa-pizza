
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      client: {
        Row: {
          name: string
          surname: string
          email: string
          phone: string
          avatar_url: string
          id: number
        }
        Insert: {
          name: string
          surname: string
          email: string
          phone: string
          avatar_url: string
          id?: never
        }
        Update: {
          name?: string
          surname?: string
          email?: string
          phone?: string
          avatar_url?: string
          id?: never
        }
      }
      dough: {
        Row: {
          name: string
          description: string
          id: number
        }
        Insert: {
          name: string
          description: string
          id?: never
        }
        Update: {
          name?: string
          description?: string
          id?: never
        }
      }
      ingredient: {
        Row: {
          name: string
          description: string
          id: number
        }
        Insert: {
          name: string
          description: string
          id?: never
        }
        Update: {
          name?: string
          description?: string
          id?: never
        }
      }
      order: {
        Row: {
          client_id: number
          perfect_pizza: boolean
          pizza_id: number | null
          delivered_at: string | null
          delivery_status: Database["public"]["Enums"]["delivery_status"] | null
          created_at: string | null
          id: number
        }
        Insert: {
          client_id: number
          perfect_pizza?: boolean
          pizza_id?: number | null
          delivered_at?: string | null
          delivery_status?:
          | Database["public"]["Enums"]["delivery_status"]
          | null
          created_at?: string | null
          id?: never
        }
        Update: {
          client_id?: number
          perfect_pizza?: boolean
          pizza_id?: number | null
          delivered_at?: string | null
          delivery_status?:
          | Database["public"]["Enums"]["delivery_status"]
          | null
          created_at?: string | null
          id?: never
        }
      }
      order_dough: {
        Row: {
          order_id: number
          dough_id: number
          id: number
        }
        Insert: {
          order_id: number
          dough_id: number
          id?: never
        }
        Update: {
          order_id?: number
          dough_id?: number
          id?: never
        }
      }
      order_ingredient: {
        Row: {
          order_id: number
          ingredient_id: number
          id: number
        }
        Insert: {
          order_id: number
          ingredient_id: number
          id?: never
        }
        Update: {
          order_id?: number
          ingredient_id?: number
          id?: never
        }
      }
      pizza: {
        Row: {
          created_at: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          id?: never
        }
        Update: {
          created_at?: string | null
          id?: never
        }
      }
      stock_dough: {
        Row: {
          dough_id: number
          pizza_id: number | null
          id: number
        }
        Insert: {
          dough_id: number
          pizza_id?: number | null
          id?: never
        }
        Update: {
          dough_id?: number
          pizza_id?: number | null
          id?: never
        }
      }
      stock_ingredient: {
        Row: {
          ingredient_id: number
          pizza_id: number | null
          id: number
        }
        Insert: {
          ingredient_id: number
          pizza_id?: number | null
          id?: never
        }
        Update: {
          ingredient_id?: number
          pizza_id?: number | null
          id?: never
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_get_best_customer: {
        Args: { seconds: number }
        Returns: {
          name: string
          surname: string
          client_id: number
          count: number
        }
      }
      fn_get_most_popular_ingredient: {
        Args: { seconds: number }
        Returns: { name: string; ingredient_id: number; count: number }
      }
      fn_get_ratio_success_deliveries: {
        Args: { seconds: number }
        Returns: {
          label: Database["public"]["Enums"]["delivery_label"]
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          percent: number
          ctorder: number
        }
      }
      fn_get_timed_deliveries: {
        Args: { seconds: number }
        Returns: { count: number; interval_alias: number }
      }
    }
    Enums: {
      delivery_label: "perfect" | "good" | "fail"
      delivery_status: "delivered" | "not delivered"
    }
  }
}