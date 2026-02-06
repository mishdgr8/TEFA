// Firestore Operations for Products
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';

const PRODUCTS_COLLECTION = 'products';

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
    return {
        id: doc.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency || '₦',
        images: data.images || [],
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

// Add new product
export const addProductToFirestore = async (
    productData: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        slug: generateSlug(productData.name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
};

// Update product
export const updateProductInFirestore = async (
    id: string,
    updates: Partial<Product>
): Promise<void> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const updateData: any = { ...updates, updatedAt: serverTimestamp() };

    // Update slug if name changed
    if (updates.name) {
        updateData.slug = generateSlug(updates.name);
    }

    // Remove id from updates
    delete updateData.id;

    await updateDoc(docRef, updateData);
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
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
            ...productData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};
