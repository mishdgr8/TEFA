// Firebase Storage Operations
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './firebase';

// Initialize Storage
const storage = getStorage(app);

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param file - The file to upload
 * @param path - The storage path
 * @param onProgress - Optional callback for progress percentage (0-100)
 * @returns The download URL of the uploaded file
 */
export const uploadFile = async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error('Upload failed:', error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};

/**
 * Upload a product image
 * @param file - The image file
 * @param productId - Optional product ID
 * @param onProgress - Optional progress callback
 * @returns The download URL
 */
export const uploadProductImage = async (
    file: File,
    productId?: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = productId || 'new';
    const path = `products/${folder}/${timestamp}_${safeName}`;
    return uploadFile(file, path, onProgress);
};

/**
 * Upload a product video
 * @param file - The video file
 * @param productId - Optional product ID
 * @param onProgress - Optional progress callback
 * @returns The download URL
 */
export const uploadProductVideo = async (
    file: File,
    productId?: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = productId || 'new';
    const path = `products/${folder}/videos/${timestamp}_${safeName}`;
    return uploadFile(file, path, onProgress);
};

/**
 * Delete a file from Firebase Storage
 * @param url - The download URL of the file to delete
 */
export const deleteFileByUrl = async (url: string): Promise<void> => {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Failed to delete file:', error);
    }
};

export { storage };
