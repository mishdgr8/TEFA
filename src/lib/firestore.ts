// Firestore Operations for Products
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Category, CustomerReview } from '../types';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const REVIEWS_COLLECTION = 'reviews';
const USERS_COLLECTION = 'users';
const SUBSCRIBERS_COLLECTION = 'subscribers';

// Generate slug from name
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Convert Firestore document to Product
const docToProduct = (doc: any): Product => {
    const data = doc.data();
    const quantity = data.quantity ?? 0;
    return {
        id: doc.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        currency: data.currency || '₦',

        images: data.images || [],
        galleryImages: data.galleryImages || [],
        videoUrl: data.videoUrl || '',
        quantity: quantity,
        soldOut: data.soldOut || false,
        stockStatus: data.soldOut ? 'out_of_stock' : (quantity === 0 ? 'out_of_stock' : quantity < 5 ? 'low_stock' : 'in_stock'),
        categoryId: data.categoryId,
        tags: data.tags || [],
        sizes: data.sizes || [],
        colors: data.colors || [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt
    };
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToProduct);
};

// Get single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docToProduct(docSnap);
    }
    return null;
};

// Subscribe to products list (Real-time)
export const subscribeToProducts = (
    callback: (products: Product[]) => void,
    onError?: (error: Error) => void
) => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(docToProduct);
        callback(products);
    }, (error) => {
        console.error('Products subscription error:', error);
        if (onError) onError(error);
    });
};

// Add new product
export const addProductToFirestore = async (
    productData: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    console.log('firestore.ts: addProductToFirestore started', productData.name);
    try {
        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
            ...productData,
            slug: generateSlug(productData.name),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('firestore.ts: addProductToFirestore success, ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('firestore.ts: addProductToFirestore error:', error);
        throw error;
    }
};

// Update product
export const updateProductInFirestore = async (
    id: string,
    updates: Partial<Product>
): Promise<void> => {
    console.log('firestore.ts: updateProductInFirestore started for ID:', id);
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, id);
        const updateData: any = { ...updates, updatedAt: serverTimestamp() };

        // Update slug if name changed
        if (updates.name) {
            updateData.slug = generateSlug(updates.name);
        }

        // Remove id from updates
        delete updateData.id;

        await updateDoc(docRef, updateData);
        console.log('firestore.ts: updateProductInFirestore success');
    } catch (error) {
        console.error('firestore.ts: updateProductInFirestore error:', error);
        throw error;
    }
};

// Delete product
export const deleteProductFromFirestore = async (id: string): Promise<void> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
};

// Seed initial products (for migration from localStorage)
export const seedProducts = async (products: Product[]): Promise<void> => {
    for (const product of products) {
        const { id, ...productData } = product;
        await setDoc(doc(db, PRODUCTS_COLLECTION, id), {
            ...productData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};
// --- CATEGORY OPERATIONS ---

const docToCategory = (doc: any): Category => {
    const data = doc.data();
    return {
        id: doc.id,
        slug: data.slug,
        name: data.name,
        image: data.image,
        hoverImage: data.hoverImage,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt
    };
};

export const subscribeToCategories = (
    callback: (categories: Category[]) => void,
    onError?: (error: Error) => void
) => {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const categories = snapshot.docs.map(docToCategory);
        callback(categories);
    }, (error) => {
        console.error('Categories subscription error:', error);
        if (onError) onError(error);
    });
};

export const addCategoryToFirestore = async (
    categoryData: Omit<Category, 'id' | 'slug' | 'createdAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
        ...categoryData,
        slug: generateSlug(categoryData.name),
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const updateCategoryInFirestore = async (
    id: string,
    updates: Partial<Category>
): Promise<void> => {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const updateData: any = { ...updates };
    if (updates.name) updateData.slug = generateSlug(updates.name);
    await updateDoc(docRef, updateData);
};

export const deleteCategoryFromFirestore = async (id: string): Promise<void> => {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
};

// --- REVIEW OPERATIONS ---

const docToReview = (doc: any): CustomerReview => {
    const data = doc.data();
    return {
        id: doc.id,
        username: data.username,
        thumbnail: data.thumbnail,
        videoUrl: data.videoUrl,
        platform: data.platform || 'instagram',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt
    };
};

export const subscribeToReviews = (
    callback: (reviews: CustomerReview[]) => void,
    onError?: (error: Error) => void
) => {
    const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map(docToReview);
        callback(reviews);
    }, (error) => {
        console.error('Reviews subscription error:', error);
        if (onError) onError(error);
    });
};

export const addReviewToFirestore = async (
    reviewData: Omit<CustomerReview, 'id' | 'createdAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
        ...reviewData,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const updateReviewInFirestore = async (
    id: string,
    updates: Partial<CustomerReview>
): Promise<void> => {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    await updateDoc(docRef, updates);
};

export const deleteReviewFromFirestore = async (id: string): Promise<void> => {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    await deleteDoc(docRef);
};

// --- SEEDING ---

export const seedCategories = async (categories: Category[]): Promise<void> => {
    for (const cat of categories) {
        const { id, ...data } = cat;
        await setDoc(doc(db, CATEGORIES_COLLECTION, id), {
            ...data,
            createdAt: serverTimestamp()
        });
    }
};

// --- USER PROFILE OPERATIONS ---

export const subscribeToUserProfile = (
    uid: string,
    callback: (userData: any) => void,
    onError?: (error: Error) => void
) => {
    const docRef = doc(db, USERS_COLLECTION, uid);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            // Initial profile if it doesn't exist
            callback({ isAdmin: false });
        }
    }, (error) => {
        console.error('User profile subscription error:', error);
        if (onError) onError(error);
    });
};

export const ensureUserProfile = async (uid: string, email: string | null) => {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        await setDoc(docRef, {
            email,
            isAdmin: false,
            createdAt: serverTimestamp()
        });
    }
};

// --- NEWSLETTER OPERATIONS ---

export const subscribeToNewsletter = async (email: string): Promise<string> => {
    console.log('firestore.ts: subscribeToNewsletter started', email);
    try {
        const docRef = await addDoc(collection(db, SUBSCRIBERS_COLLECTION), {
            email,
            source: 'homepage_modal',
            createdAt: serverTimestamp(),
            discountSent: false
        });
        console.log('firestore.ts: subscribeToNewsletter success, ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('firestore.ts: subscribeToNewsletter error:', error);
        throw error;
    }
};

