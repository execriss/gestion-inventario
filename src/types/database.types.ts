export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole      = 'admin' | 'operator' | 'viewer'
export type MovementType  = 'ingreso' | 'egreso'
export type OrgPlan       = 'free' | 'pro'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:                string
          full_name:         string | null
          avatar_url:        string | null
          is_platform_admin: boolean
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id:                 string
          full_name?:         string | null
          avatar_url?:        string | null
          is_platform_admin?: boolean
          created_at?:        string
          updated_at?:        string
        }
        Update: {
          full_name?:         string | null
          avatar_url?:        string | null
          is_platform_admin?: boolean
          updated_at?:        string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id:         string
          name:       string
          slug:       string
          logo_url:   string | null
          plan:       OrgPlan
          is_active:  boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:         string
          name:        string
          slug:        string
          logo_url?:   string | null
          plan?:       OrgPlan
          is_active?:  boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?:       string
          slug?:       string
          logo_url?:   string | null
          plan?:       OrgPlan
          is_active?:  boolean
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id:              string
          organization_id: string
          user_id:         string
          role:            UserRole
          invited_by:      string | null
          joined_at:       string
        }
        Insert: {
          id?:              string
          organization_id:  string
          user_id:          string
          role?:            UserRole
          invited_by?:      string | null
          joined_at?:       string
        }
        Update: {
          role?: UserRole
        }
        Relationships: [
          { foreignKeyName: 'organization_members_organization_id_fkey'; columns: ['organization_id']; referencedRelation: 'organizations'; referencedColumns: ['id'] },
          { foreignKeyName: 'organization_members_user_id_fkey'; columns: ['user_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] }
        ]
      }
      organization_invitations: {
        Row: {
          id:              string
          organization_id: string
          role:            UserRole
          token:           string
          label:           string | null
          invited_by:      string | null
          used_by:         string | null
          used_at:         string | null
          expires_at:      string
          max_uses:        number
          use_count:       number
          created_at:      string
        }
        Insert: {
          id?:              string
          organization_id:  string
          role?:            UserRole
          token?:           string
          label?:           string | null
          invited_by?:      string | null
          max_uses?:        number
          expires_at?:      string
          created_at?:      string
        }
        Update: {
          role?:      UserRole
          label?:     string | null
          used_by?:   string | null
          used_at?:   string | null
          use_count?: number
          max_uses?:  number
        }
        Relationships: [
          { foreignKeyName: 'organization_invitations_organization_id_fkey'; columns: ['organization_id']; referencedRelation: 'organizations'; referencedColumns: ['id'] }
        ]
      }
      units: {
        Row: {
          id:              string
          organization_id: string
          name:            string
          abbreviation:    string
          created_at:      string
        }
        Insert: {
          id?:              string
          organization_id:  string
          name:             string
          abbreviation:     string
          created_at?:      string
        }
        Update: {
          name?:         string
          abbreviation?: string
        }
        Relationships: [
          { foreignKeyName: 'units_organization_id_fkey'; columns: ['organization_id']; referencedRelation: 'organizations'; referencedColumns: ['id'] }
        ]
      }
      categories: {
        Row: {
          id:              string
          organization_id: string
          name:            string
          color:           string
          icon:            string
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          organization_id:  string
          name:             string
          color?:           string
          icon?:            string
          created_at?:      string
          updated_at?:      string
        }
        Update: {
          name?:       string
          color?:      string
          icon?:       string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'categories_organization_id_fkey'; columns: ['organization_id']; referencedRelation: 'organizations'; referencedColumns: ['id'] }
        ]
      }
      suppliers: {
        Row: {
          id:              string
          organization_id: string
          name:            string
          contact:         string | null
          email:           string | null
          phone:           string | null
          address:         string | null
          notes:           string | null
          is_active:       boolean
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          organization_id:  string
          name:             string
          contact?:         string | null
          email?:           string | null
          phone?:           string | null
          address?:         string | null
          notes?:           string | null
          is_active?:       boolean
          created_at?:      string
          updated_at?:      string
        }
        Update: {
          name?:       string
          contact?:    string | null
          email?:      string | null
          phone?:      string | null
          address?:    string | null
          notes?:      string | null
          is_active?:  boolean
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'suppliers_organization_id_fkey'; columns: ['organization_id']; referencedRelation: 'organizations'; referencedColumns: ['id'] }
        ]
      }
      products: {
        Row: {
          id:              string
          organization_id: string
          name:            string
          sku:             string | null
          description:     string | null
          category_id:     string
          unit_id:         string
          min_stock:       number
          current_stock:   number
          cost_price:      number | null
          sale_price:      number | null
          image_url:       string | null
          is_active:       boolean
          created_by:      string | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          organization_id:  string
          name:             string
          sku?:             string | null
          description?:     string | null
          category_id:      string
          unit_id:          string
          min_stock?:       number
          current_stock?:   number
          cost_price?:      number | null
          sale_price?:      number | null
          image_url?:       string | null
          is_active?:       boolean
          created_by?:      string | null
          created_at?:      string
          updated_at?:      string
        }
        Update: {
          name?:         string
          sku?:          string | null
          description?:  string | null
          category_id?:  string
          unit_id?:      string
          min_stock?:    number
          cost_price?:   number | null
          sale_price?:   number | null
          image_url?:    string | null
          is_active?:    boolean
          updated_at?:   string
        }
        Relationships: [
          { foreignKeyName: 'products_organization_id_fkey'; columns: ['organization_id']; referencedRelation: 'organizations'; referencedColumns: ['id'] },
          { foreignKeyName: 'products_category_id_fkey'; columns: ['category_id']; referencedRelation: 'categories'; referencedColumns: ['id'] },
          { foreignKeyName: 'products_unit_id_fkey'; columns: ['unit_id']; referencedRelation: 'units'; referencedColumns: ['id'] }
        ]
      }
      inventory_movements: {
        Row: {
          id:              string
          organization_id: string
          type:            MovementType
          product_id:      string
          quantity:        number
          unit_price:      number
          total_price:     number
          supplier_id:     string | null
          reference:       string | null
          notes:           string | null
          created_by:      string | null
          created_at:      string
        }
        Insert: {
          id?:              string
          organization_id:  string
          type:             MovementType
          product_id:       string
          quantity:         number
          unit_price?:      number
          supplier_id?:     string | null
          reference?:       string | null
          notes?:           string | null
          created_by?:      string | null
          created_at?:      string
        }
        Update: {
          // Movimientos son inmutables — no se permite update
          [key: string]: never
        }
        Relationships: [
          { foreignKeyName: 'inventory_movements_organization_id_fkey'; columns: ['organization_id']; referencedRelation: 'organizations'; referencedColumns: ['id'] },
          { foreignKeyName: 'inventory_movements_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] }
        ]
      }
    }
    Views: {
      low_stock_products: {
        Row: {
          id:               string
          organization_id:  string
          name:             string
          sku:              string | null
          current_stock:    number
          min_stock:        number
          image_url:        string | null
          category_name:    string
          category_color:   string
          unit_abbreviation: string
          stock_deficit:    number
        }
        Relationships: []
      }
      today_movements_summary: {
        Row: {
          organization_id: string
          type:            MovementType
          total_movements: number
          total_quantity:  number
          total_value:     number
        }
        Relationships: []
      }
      stock_by_category: {
        Row: {
          organization_id: string
          category_id:     string
          category_name:   string
          color:           string
          icon:            string
          product_count:   number
          total_stock:     number
          total_value:     number
        }
        Relationships: []
      }
    }
    Functions: {
      get_my_org_id: {
        Args:    Record<PropertyKey, never>
        Returns: string
      }
      get_my_org_role: {
        Args:    Record<PropertyKey, never>
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

// ── Tipos derivados convenientes ───────────────────────────────
export type Profile              = Database['public']['Tables']['profiles']['Row']
export type Organization         = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember   = Database['public']['Tables']['organization_members']['Row']
export type OrganizationInvitation = Database['public']['Tables']['organization_invitations']['Row']
export type Unit                 = Database['public']['Tables']['units']['Row']
export type Category             = Database['public']['Tables']['categories']['Row']
export type Supplier             = Database['public']['Tables']['suppliers']['Row']
export type Product              = Database['public']['Tables']['products']['Row']
export type InventoryMovement    = Database['public']['Tables']['inventory_movements']['Row']
export type LowStockProduct      = Database['public']['Views']['low_stock_products']['Row']
export type StockByCategory      = Database['public']['Views']['stock_by_category']['Row']
export type TodayMovementSummary = Database['public']['Views']['today_movements_summary']['Row']

// ── Tipos extendidos con joins ─────────────────────────────────
export type ProductWithRelations = Product & {
  categories: Pick<Category, 'name' | 'color' | 'icon'>
  units:      Pick<Unit, 'name' | 'abbreviation'>
}

export type MovementWithRelations = InventoryMovement & {
  products:  Pick<Product, 'name' | 'sku'>
  suppliers: Pick<Supplier, 'name'> | null
  profiles:  Pick<Profile, 'full_name'> | null
}

export type MemberWithProfile = OrganizationMember & {
  profiles: Pick<Profile, 'full_name' | 'avatar_url'>
}
