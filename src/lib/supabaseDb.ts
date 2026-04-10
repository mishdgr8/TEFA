// =============================================================
// Supabase Database Operations (replaces firestore.ts)
// =============================================================
import { supabase } from './supabase';
import { Product, Category, CustomerReview, Order } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Slug Generation
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToOrder);
};

// ─── Row → Type Converters ─────────────────────────────────────

const rowToProduct = (row: any): Product => {
    const quantity = row.quantity ?? 0;
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        priceUSD: row.price_usd ? Number(row.price_usd) : undefined,
        salePrice: row.sale_price ? Number(row.sale_price) : undefined,
        currency: row.currency || '₦',
        images: row.images || [],
        galleryImages: row.gallery_images || [],
        videoUrl: row.video_url || '',
        quantity,
        soldOut: row.sold_out || false,
        stockStatus: row.sold_out
            ? 'out_of_stock'
            : quantity === 0
                ? 'out_of_stock'
                : quantity < 5
                    ? 'low_stock'
                    : 'in_stock',
        categoryId: row.category_id || '',
        tags: row.tags || [],
        sizes: row.sizes || [],
        colors: (row.colors as any[]) || [],
        weight: Number(row.weight || 0.65),
        createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
        updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
    };
};

const rowToCategory = (row: any): Category => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    hoverImage: row.hover_image,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
});

const rowToReview = (row: any): CustomerReview => ({
    id: row.id,
    username: row.username,
    thumbnail: row.thumbnail,
    videoUrl: row.video_url,
    externalLink: row.external_link,
    platform: row.platform || 'instagram',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
});

const rowToOrder = (row: any): Order => {
    let parsedInfo: any = {};
    try {
        parsedInfo = row.customer_location ? JSON.parse(row.customer_location) : {};
    } catch (e) {
        // Legacy fallback
        parsedInfo = { address: row.customer_location || '' };
    }

    return {
        id: row.id,
        userId: row.user_id,
        customerInfo: {
            firstName: parsedInfo.firstName || (row.customer_name || '').split(' ')[0] || '',
            lastName: parsedInfo.lastName || (row.customer_name || '').split(' ').slice(1).join(' ') || '',
            email: row.customer_email || '',
            phone: row.customer_phone || '',
            countryCode: parsedInfo.countryCode || '+234',
            city: parsedInfo.city || '',
            country: parsedInfo.country || '',
            address: parsedInfo.address || '',
            postalCode: parsedInfo.postalCode || '',
            note: row.customer_note || '',
        },
        items: (row.order_items || []).map((item: any) => ({
            productId: item.product_id,
            variantId: item.variant_id,
            name: item.name,
            qty: item.qty,
            price: Number(item.price),
            priceUSD: item.price_usd ? Number(item.price_usd) : undefined,
            selectedSize: item.selected_size,
            selectedColor: item.selected_color || '',
            image: item.image || '',
            slug: item.slug || ''
        })),
        subtotal: Number(row.subtotal || row.total || 0),
        shippingPrice: Number(row.shipping_cost || 0),
        discountAmount: Number(row.discount_amount || 0),
        total: Number(row.total),
        totalUSD: row.total_usd ? Number(row.total_usd) : undefined,
        currency: row.currency,
        paymentReference: row.payment_reference || '',
        paymentStatus: row.payment_status,
        orderStatus: row.order_status,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
        updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0,
    };
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToProduct);
};

export const getProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    return rowToProduct(data);
};

/**
 * Subscribe to products in real-time using Supabase Realtime.
 * Returns an unsubscribe function.
 */
export const subscribeToProducts = (
    callback: (products: Product[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    // Initial fetch
    getProducts()
        .then(callback)
        .catch((err) => {
            console.error('Initial products fetch error:', err);
            if (onError) onError(err);
        });

    // Real-time subscription
    const channel: RealtimeChannel = supabase
        .channel('products-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            () => {
                // Re-fetch all on any change (simpler and more reliable for small datasets)
                getProducts()
                    .then(callback)
                    .catch((err) => {
                        console.error('Products realtime refetch error:', err);
                        if (onError) onError(err);
                    });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const addProductToFirestore = async (
    productData: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    console.log('supabaseDb.ts: addProduct started', productData.name);
    const { data, error } = await supabase
        .from('products')
        .insert({
            slug: generateSlug(productData.name),
            name: productData.name,
            description: productData.description,
            price: productData.price,
            price_usd: productData.priceUSD ?? null,
            sale_price: productData.salePrice ?? null,
            currency: productData.currency,
            images: productData.images,
            gallery_images: productData.galleryImages || [],
            video_url: productData.videoUrl || null,
            quantity: productData.quantity,
            sold_out: productData.soldOut || false,
            category_id: productData.categoryId || null,
            tags: productData.tags,
            sizes: productData.sizes,
            colors: productData.colors as any,
            weight: productData.weight || 0.65,
        })
        .select('id')
        .single();

    if (error) {
        console.error('supabaseDb.ts: addProduct error:', error);
        throw error;
    }
    console.log('supabaseDb.ts: addProduct success, ID:', data.id);
    return data.id;
};

export const updateProductInFirestore = async (
    id: string,
    updates: Partial<Product>
): Promise<void> => {
    console.log('supabaseDb.ts: updateProduct started for ID:', id);

    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) {
        updateData.name = updates.name;
        updateData.slug = generateSlug(updates.name);
    }
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.priceUSD !== undefined) updateData.price_usd = updates.priceUSD;
    if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.galleryImages !== undefined) updateData.gallery_images = updates.galleryImages;
    if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.soldOut !== undefined) updateData.sold_out = updates.soldOut;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.sizes !== undefined) updateData.sizes = updates.sizes;
    if (updates.colors !== undefined) updateData.colors = updates.colors as any;
    if (updates.weight !== undefined) updateData.weight = updates.weight;

    const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('supabaseDb.ts: updateProduct error:', error);
        throw error;
    }
    console.log('supabaseDb.ts: updateProduct success');
};

export const deleteProductFromFirestore = async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
};

export const seedProducts = async (products: Product[]): Promise<void> => {
    const rows = products.map((p) => ({
        slug: p.slug || generateSlug(p.name),
        name: p.name,
        description: p.description,
        price: p.price,
        price_usd: (p as any).priceUSD ?? null,
        sale_price: p.salePrice ?? null,
        currency: p.currency,
        images: p.images,
        gallery_images: p.galleryImages || [],
        video_url: p.videoUrl || null,
        quantity: p.quantity,
        sold_out: p.soldOut || false,
        category_id: p.categoryId || null,
        tags: p.tags,
        sizes: p.sizes,
        colors: p.colors as any,
        weight: p.weight || 0.65,
    }));

    const { error } = await supabase.from('products').insert(rows);
    if (error) throw error;
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY OPERATIONS
// ═══════════════════════════════════════════════════════════════

const getCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(rowToCategory);
};

export const subscribeToCategories = (
    callback: (categories: Category[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    getCategories()
        .then(callback)
        .catch((err) => {
            console.error('Initial categories fetch error:', err);
            if (onError) onError(err);
        });

    const channel: RealtimeChannel = supabase
        .channel('categories-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'categories' },
            () => {
                getCategories().then(callback).catch(console.error);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const addCategoryToFirestore = async (
    categoryData: Omit<Category, 'id' | 'slug' | 'createdAt'>
): Promise<string> => {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: categoryData.name,
            slug: generateSlug(categoryData.name),
            image: categoryData.image,
            hover_image: categoryData.hoverImage || null,
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
};

export const updateCategoryInFirestore = async (
    id: string,
    updates: Partial<Category>
): Promise<void> => {
    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) {
        updateData.name = updates.name;
        updateData.slug = generateSlug(updates.name);
    }
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.hoverImage !== undefined) updateData.hover_image = updates.hoverImage;

    const { error } = await supabase.from('categories').update(updateData).eq('id', id);
    if (error) throw error;
};

export const deleteCategoryFromFirestore = async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
};

export const seedCategories = async (categories: Category[]): Promise<void> => {
    const rows = categories.map((c) => ({
        name: c.name,
        slug: c.slug || generateSlug(c.name),
        image: c.image,
        hover_image: c.hoverImage || null,
    }));

    const { error } = await supabase.from('categories').insert(rows);
    if (error) throw error;
};

// ═══════════════════════════════════════════════════════════════
// REVIEW OPERATIONS
// ═══════════════════════════════════════════════════════════════

const getReviews = async (): Promise<CustomerReview[]> => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToReview);
};

export const subscribeToReviews = (
    callback: (reviews: CustomerReview[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    getReviews()
        .then(callback)
        .catch((err) => {
            console.error('Initial reviews fetch error:', err);
            if (onError) onError(err);
        });

    const channel: RealtimeChannel = supabase
        .channel('reviews-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reviews' },
            () => {
                getReviews().then(callback).catch(console.error);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const addReviewToFirestore = async (
    reviewData: Omit<CustomerReview, 'id' | 'createdAt'>
): Promise<string> => {
    const { data, error } = await supabase
        .from('reviews')
        .insert({
            username: reviewData.username,
            thumbnail: reviewData.thumbnail,
            video_url: reviewData.videoUrl || null,
            external_link: reviewData.externalLink || null,
            platform: reviewData.platform,
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
};

export const updateReviewInFirestore = async (
    id: string,
    updates: Partial<CustomerReview>
): Promise<void> => {
    const updateData: Record<string, any> = {};
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
    if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl;
    if (updates.externalLink !== undefined) updateData.external_link = updates.externalLink;
    if (updates.platform !== undefined) updateData.platform = updates.platform;

    const { error } = await supabase.from('reviews').update(updateData).eq('id', id);
    if (error) throw error;
};

export const deleteReviewFromFirestore = async (id: string): Promise<void> => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
};

// ═══════════════════════════════════════════════════════════════
// USER PROFILE OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const subscribeToUserProfile = (
    uid: string,
    callback: (userData: any) => void,
    onError?: (error: Error) => void
): (() => void) => {
    console.log('DEBUG: Subscribing to profile for UID:', uid);
    // Initial fetch
    supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()
        .then(({ data, error }) => {
            console.log('DEBUG: Profile Fetch response:', { data, error });
            if (error || !data) {
                callback({ isAdmin: false });
            } else {
                const profile = data as any;
                callback({
                    ...profile,
                    isAdmin: profile.is_admin || false
                });
            }
        })
        .catch((err) => {
            if (onError) onError(err);
        });

    // Real-time updates on the specific profile
    const channel: RealtimeChannel = supabase
        .channel(`profile-${uid}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${uid}`,
            },
            (payload) => {
                const newData = payload.new as any;
                callback({
                    ...newData,
                    isAdmin: newData?.is_admin || false
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const ensureUserProfile = async (uid: string, email: string | null, metadata?: any) => {
    // The database trigger `handle_new_user` auto-creates profiles on signup.
    // This is a safety-net for edge cases (e.g., OAuth users).
    const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', uid)
        .single();

    if (!data) {
        await supabase.from('profiles').insert({
            id: uid,
            email,
            first_name: metadata?.first_name || null,
            last_name: metadata?.last_name || null,
            phone: metadata?.phone || null,
            country: metadata?.country || null,
            is_admin: false,
        } as any);
    }
};

// ═══════════════════════════════════════════════════════════════
// ORDER OPERATIONS
// ═══════════════════════════════════════════════════════════════

const getOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToOrder);
};

export const subscribeToOrders = (
    callback: (orders: Order[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    getOrders()
        .then(callback)
        .catch((err) => {
            console.error('Initial orders fetch error:', err);
            if (onError) onError(err);
        });

    const channel: RealtimeChannel = supabase
        .channel('orders-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
                getOrders().then(callback).catch(console.error);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const createOrder = async (orderData: Partial<Order>): Promise<string> => {
    // Basic conversion for DB
    const orderInsert = {
        user_id: orderData.userId || null,
        customer_name: `${orderData.customerInfo?.firstName} ${orderData.customerInfo?.lastName}`.trim(),
        customer_email: orderData.customerInfo?.email || '',
        customer_phone: orderData.customerInfo?.phone ? `${orderData.customerInfo.countryCode} ${orderData.customerInfo.phone}`.trim() : '',
        customer_location: JSON.stringify(orderData.customerInfo || {}),
        customer_note: orderData.customerInfo?.note || '',
        subtotal: orderData.subtotal || 0,
        shipping_cost: orderData.shippingPrice || 0,
        discount_amount: orderData.discountAmount || 0,
        total: orderData.total || 0,
        total_usd: orderData.totalUSD || 0,
        currency: orderData.currency || 'NGN',
        payment_reference: orderData.paymentReference || '',
        payment_status: orderData.paymentStatus || 'success',
        order_status: orderData.orderStatus || 'new',
        payment_method: 'paystack'
    };

    const { data: newOrderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsert as any)
        .select('id')
        .single();

    const newOrder = newOrderData as any;

    if (orderError) throw orderError;

    if (orderData.items && orderData.items.length > 0) {
        const itemsToInsert = orderData.items.map(item => ({
            order_id: newOrder.id,
            product_id: item.productId,
            variant_id: item.variantId,
            name: item.name,
            qty: item.qty,
            price: item.price,
            price_usd: item.priceUSD || null,
            selected_size: item.selectedSize,
            selected_color: item.selectedColor || null,
            image: item.image || null
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert as any);

        if (itemsError) throw itemsError;
    }

    return newOrder.id;
};

export const updateOrderStatusInFirestore = async (
    id: string,
    status: Order['orderStatus']
): Promise<void> => {
    const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', id);

    if (error) throw error;
};

export const deleteOrderFromFirestore = async (id: string): Promise<void> => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
};

export const updateUserProfile = async (uid: string, updates: any) => {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', uid);
    if (error) throw error;
};

// ═══════════════════════════════════════════════════════════════
// NEWSLETTER OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const subscribeToNewsletter = async (email: string): Promise<string> => {
    console.log('supabaseDb.ts: subscribeToNewsletter started', email);
    const { data, error } = await supabase
        .from('subscribers')
        .insert({
            email,
            source: 'homepage_modal',
            discount_sent: false,
        })
        .select('id')
        .single();

    if (error) {
        console.error('supabaseDb.ts: subscribeToNewsletter error:', error);
        throw error;
    }

    if (!data) throw new Error('Failed to subscribe');

    console.log('supabaseDb.ts: subscribeToNewsletter success, ID:', data.id);
    return data.id;
};
