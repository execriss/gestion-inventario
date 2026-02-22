export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'operator' | 'viewer'
export type MovementType = 'ingreso' | 'egreso'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          id: string
          name: string
          abbreviation: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          abbreviation: string
          created_at?: string
        }
        Update: {
          name?: string
          abbreviation?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          color?: string
          icon?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact: string | null
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          contact?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string | null
          description: string | null
          category_id: string
          unit_id: string
          min_stock: number
          current_stock: number
          cost_price: number | null
          sale_price: number | null
          image_url: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku?: string | null
          description?: string | null
          category_id: string
          unit_id: string
          min_stock?: number
          current_stock?: number
          cost_price?: number | null
          sale_price?: number | null
          image_url?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          sku?: string | null
          description?: string | null
          category_id?: string
          unit_id?: string
          min_stock?: number
          cost_price?: number | null
          sale_price?: number | null
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: string
          type: MovementType
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          supplier_id: string | null
          reference: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: MovementType
          product_id: string
          quantity: number
          unit_price?: number
          supplier_id?: string | null
          reference?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          // Movimientos son inmutables — no se permite update
          [key: string]: never
        }
        Relationships: []
      }
    }
    Views: {
      low_stock_products: {
        Row: {
          id: string
          name: string
          sku: string | null
          current_stock: number
          min_stock: number
          image_url: string | null
          category_name: string
          category_color: string
          unit_abbreviation: string
          stock_deficit: number
        }
        Relationships: []
      }
      today_movements_summary: {
        Row: {
          type: MovementType
          total_movements: number
          total_quantity: number
          total_value: number
        }
        Relationships: []
      }
      stock_by_category: {
        Row: {
          category_id: string
          category_name: string
          color: string
          icon: string
          product_count: number
          total_stock: number
          total_value: number
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: UserRole
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos derivados convenientes
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Unit = Database['public']['Tables']['units']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type InventoryMovement = Database['public']['Tables']['inventory_movements']['Row']
export type LowStockProduct = Database['public']['Views']['low_stock_products']['Row']
export type StockByCategory = Database['public']['Views']['stock_by_category']['Row']
export type TodayMovementSummary = Database['public']['Views']['today_movements_summary']['Row']

// Tipos extendidos con joins
export type ProductWithRelations = Product & {
  categories: Pick<Category, 'name' | 'color' | 'icon'>
  units: Pick<Unit, 'name' | 'abbreviation'>
}

export type MovementWithRelations = InventoryMovement & {
  products: Pick<Product, 'name' | 'sku'>
  suppliers: Pick<Supplier, 'name'> | null
  profiles: Pick<Profile, 'full_name'> | null
}
