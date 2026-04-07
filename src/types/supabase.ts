// =============================================================
// Supabase Database Types (auto-generated style)
// Maps the Postgres schema to TypeScript
// =============================================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    image: string;
                    hover_image: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    image: string;
                    hover_image?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    image?: string;
                    hover_image?: string | null;
                    created_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    slug: string;
                    name: string;
                    description: string;
                    price: number;
                    price_usd: number | null;
                    sale_price: number | null;
                    currency: string;
                    images: string[];
                    gallery_images: string[];
                    video_url: string | null;
                    quantity: number;
                    sold_out: boolean;
                    category_id: string | null;
                    tags: string[];
                    sizes: string[];
                    colors: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    slug: string;
                    name: string;
                    description?: string;
                    price?: number;
                    price_usd?: number | null;
                    sale_price?: number | null;
                    currency?: string;
                    images?: string[];
                    gallery_images?: string[];
                    video_url?: string | null;
                    quantity?: number;
                    sold_out?: boolean;
                    category_id?: string | null;
                    tags?: string[];
                    sizes?: string[];
                    colors?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    slug?: string;
                    name?: string;
                    description?: string;
                    price?: number;
                    price_usd?: number | null;
                    sale_price?: number | null;
                    currency?: string;
                    images?: string[];
                    gallery_images?: string[];
                    video_url?: string | null;
                    quantity?: number;
                    sold_out?: boolean;
                    category_id?: string | null;
                    tags?: string[];
                    sizes?: string[];
                    colors?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone: string | null;
                    country: string | null;
                    is_admin: boolean;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    first_name?: string | null;
                    last_name?: string | null;
                    phone?: string | null;
                    country?: string | null;
                    is_admin?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    first_name?: string | null;
                    last_name?: string | null;
                    phone?: string | null;
                    country?: string | null;
                    is_admin?: boolean;
                    created_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    username: string;
                    thumbnail: string;
                    video_url: string | null;
                    external_link: string | null;
                    platform: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    username: string;
                    thumbnail?: string;
                    video_url?: string | null;
                    external_link?: string | null;
                    platform?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string;
                    thumbnail?: string;
                    video_url?: string | null;
                    external_link?: string | null;
                    platform?: string;
                    created_at?: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    user_id: string | null;
                    customer_name: string;
                    customer_email: string;
                    customer_phone: string;
                    customer_location: string;
                    customer_note: string;
                    total: number;
                    total_usd: number | null;
                    currency: string;
                    payment_status: string;
                    order_status: string;
                    payment_method: string | null;
                    payment_reference: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    customer_name?: string;
                    customer_email?: string;
                    customer_phone?: string;
                    customer_location?: string;
                    customer_note?: string;
                    total?: number;
                    total_usd?: number | null;
                    currency?: string;
                    payment_status?: string;
                    order_status?: string;
                    payment_method?: string | null;
                    payment_reference?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    customer_name?: string;
                    customer_email?: string;
                    customer_phone?: string;
                    customer_location?: string;
                    customer_note?: string;
                    total?: number;
                    total_usd?: number | null;
                    currency?: string;
                    payment_status?: string;
                    order_status?: string;
                    payment_method?: string | null;
                    payment_reference?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    product_id: string;
                    variant_id: string;
                    name: string;
                    qty: number;
                    price: number;
                    price_usd: number | null;
                    selected_size: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    product_id: string;
                    variant_id: string;
                    name: string;
                    qty?: number;
                    price: number;
                    price_usd?: number | null;
                    selected_size?: string;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    product_id?: string;
                    variant_id?: string;
                    name?: string;
                    qty?: number;
                    price?: number;
                    price_usd?: number | null;
                    selected_size?: string;
                };
            };
            subscribers: {
                Row: {
                    id: string;
                    email: string;
                    source: string;
                    discount_sent: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    source?: string;
                    discount_sent?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    source?: string;
                    discount_sent?: boolean;
                    created_at?: string;
                };
            };
            chats: {
                Row: {
                    id: string;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                };
            };
            chat_messages: {
                Row: {
                    id: string;
                    chat_id: string;
                    text: string;
                    is_user: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    chat_id: string;
                    text: string;
                    is_user?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    chat_id?: string;
                    text?: string;
                    is_user?: boolean;
                    created_at?: string;
                };
            };
            wa_mappings: {
                Row: {
                    wa_message_id: string;
                    chat_id: string;
                    created_at: string;
                };
                Insert: {
                    wa_message_id: string;
                    chat_id: string;
                    created_at?: string;
                };
                Update: {
                    wa_message_id?: string;
                    chat_id?: string;
                    created_at?: string;
                };
            };
        };
        Functions: {
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
        };
    };
}
