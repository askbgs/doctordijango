export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'

export type ConversationStatus = 'active' | 'paused_for_handover' | 'closed'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageType = 'text' | 'image' | 'template' | 'interactive' | 'system'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'
export type Gender = 'men' | 'women' | 'unisex' | 'kids'
export type CartStatus = 'active' | 'checked_out' | 'abandoned'
export type HandoverPriority = 'low' | 'medium' | 'high' | 'urgent'
export type HandoverStatus = 'pending' | 'assigned' | 'resolved' | 'expired'
export type StaffRole = 'admin' | 'manager' | 'staff'
export type Language = 'en' | 'ta' | 'si'
export type MovementType = 'stock_in' | 'reserved' | 'sold' | 'released' | 'adjustment'

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'first_seen_at' | 'last_active_at'> & {
          id?: string; created_at?: string; updated_at?: string; first_seen_at?: string; last_active_at?: string
        }
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'started_at'> & {
          id?: string; created_at?: string; updated_at?: string; started_at?: string
        }
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
          id?: string; created_at?: string; updated_at?: string
        }
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      product_variants: {
        Row: ProductVariant
        Insert: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'> & {
          id?: string; created_at?: string; updated_at?: string
        }
        Update: Partial<Omit<ProductVariant, 'id' | 'created_at'>>
      }
      carts: {
        Row: Cart
        Insert: Omit<Cart, 'id' | 'created_at' | 'updated_at'> & {
          id?: string; created_at?: string; updated_at?: string
        }
        Update: Partial<Omit<Cart, 'id' | 'created_at'>>
      }
      cart_items: {
        Row: CartItem
        Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'> & {
          id?: string; created_at?: string; updated_at?: string
        }
        Update: Partial<Omit<CartItem, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'order_ref' | 'created_at' | 'updated_at'> & {
          id?: string; order_ref?: string; created_at?: string; updated_at?: string
        }
        Update: Partial<Omit<Order, 'id' | 'order_ref' | 'created_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id'> & { id?: string }
        Update: Partial<Omit<OrderItem, 'id'>>
      }
      inventory_movements: {
        Row: InventoryMovement
        Insert: Omit<InventoryMovement, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<InventoryMovement, 'id' | 'created_at'>>
      }
      shop_settings: {
        Row: ShopSetting
        Insert: Omit<ShopSetting, 'id' | 'updated_at'> & { id?: string; updated_at?: string }
        Update: Partial<Omit<ShopSetting, 'id'>>
      }
      staff_users: {
        Row: StaffUser
        Insert: Omit<StaffUser, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Omit<StaffUser, 'id' | 'created_at'>>
      }
      handover_requests: {
        Row: HandoverRequest
        Insert: Omit<HandoverRequest, 'id' | 'created_at' | 'updated_at'> & {
          id?: string; created_at?: string; updated_at?: string
        }
        Update: Partial<Omit<HandoverRequest, 'id' | 'created_at'>>
      }
      processed_webhook_events: {
        Row: ProcessedWebhookEvent
        Insert: Omit<ProcessedWebhookEvent, 'id' | 'processed_at'> & { id?: string; processed_at?: string }
        Update: Partial<Omit<ProcessedWebhookEvent, 'id'>>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>
      }
    }
    Functions: {
      get_or_create_customer: {
        Args: { p_whatsapp_id: string; p_phone: string; p_name: string }
        Returns: string
      }
      reserve_stock: {
        Args: { p_variant_id: string; p_quantity: number }
        Returns: boolean
      }
      release_stock: {
        Args: { p_variant_id: string; p_quantity: number }
        Returns: void
      }
      place_order: {
        Args: { p_order: Json }
        Returns: string
      }
      confirm_order: {
        Args: { p_order_id: string }
        Returns: void
      }
      cancel_order: {
        Args: { p_order_id: string; p_reason: string }
        Returns: void
      }
      search_products: {
        Args: {
          p_category?: string | null
          p_min_price?: number | null
          p_max_price?: number | null
          p_size?: string | null
          p_colour?: string | null
          p_gender?: string | null
          p_keyword?: string | null
          p_limit?: number | null
        }
        Returns: Json[]
      }
    }
    Enums: Record<string, never>
  }
}

export interface Customer {
  id: string
  whatsapp_id: string
  phone_number: string | null
  display_name: string | null
  preferred_language: Language
  first_seen_at: string
  last_active_at: string
  metadata: Json
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  customer_id: string
  status: ConversationStatus
  language: string | null
  context: Json
  started_at: string
  last_message_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  customer_id: string
  direction: MessageDirection
  message_type: MessageType
  content: string | null
  whatsapp_message_id: string | null
  status: MessageStatus | null
  metadata: Json
  created_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  category: string
  brand: string | null
  gender: Gender | null
  base_price: number
  sale_price: number | null
  currency: string
  image_urls: string[]
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  colour: string
  sku: string
  available_quantity: number
  reserved_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Cart {
  id: string
  customer_id: string
  status: CartStatus
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id: string
  quantity: number
  unit_price: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_ref: string
  customer_id: string
  status: OrderStatus
  customer_name: string
  delivery_address: string
  contact_number: string | null
  payment_method: string | null
  subtotal: number
  delivery_charge: number
  discount_amount: number
  total_amount: number
  currency: string
  notes: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  size: string
  colour: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface InventoryMovement {
  id: string
  variant_id: string
  movement_type: MovementType
  quantity: number
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface ShopSetting {
  id: string
  key: string
  value: Json
  description: string | null
  updated_at: string
  updated_by: string | null
}

export interface StaffUser {
  id: string
  email: string
  full_name: string
  role: StaffRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HandoverRequest {
  id: string
  conversation_id: string
  customer_id: string
  reason: string
  priority: HandoverPriority
  status: HandoverStatus
  assigned_to: string | null
  resolved_at: string | null
  resolved_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProcessedWebhookEvent {
  id: string
  event_id: string
  event_type: string
  processed_at: string
  metadata: Json
}

export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  changes: Json
  performed_by: string | null
  ip_address: string | null
  created_at: string
}

export type ProductWithVariants = Product & { product_variants: ProductVariant[] }
export type OrderWithItems = Order & { order_items: OrderItem[] }
export type ConversationWithCustomer = Conversation & { customers: Customer }
export type HandoverWithDetails = HandoverRequest & {
  customers: Customer
  conversations: Conversation
}

export const CATEGORIES = [
  'tshirts', 'shirts', 'trousers', 'jeans', 'dresses',
  'sarees', 'kidswear', 'sportswear', 'accessories',
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  tshirts: 'T-Shirts',
  shirts: 'Shirts',
  trousers: 'Trousers',
  jeans: 'Jeans',
  dresses: 'Dresses',
  sarees: 'Sarees',
  kidswear: 'Kidswear',
  sportswear: 'Sportswear',
  accessories: 'Accessories',
}

export const GENDERS = ['men', 'women', 'unisex', 'kids'] as const

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_confirmation: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  return_requested: 'bg-orange-100 text-orange-800',
}

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'return_requested'],
  delivered: ['return_requested'],
  cancelled: [],
  return_requested: ['processing'],
}
