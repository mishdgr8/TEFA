// Cloudinary Storage Operations (Replaces Firebase Storage for billing optimization)
// To use this, create an 'Unsigned Upload Preset' in your Cloudinary Dashboard
// with the name matching VITE_CLOUDINARY_UPLOAD_PRESET (default: tefa_products)

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'tefa_products';

/**
 * Upload a file to Cloudinary
 * @param file - The file to upload
 * @param _path - (Optional) Path for backward compatibility with Firebase Storage
 * @param onProgress - Optional callback for progress percentage (0-100)
 * @returns The secure URL of the uploaded file
 */
export const uploadFile = async (
    file: File,
    _path?: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    if (!CLOUD_NAME) {
        throw new Error('Cloudinary Cloud Name is not configured in .env.local');
    }

    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        // Optional: Add folder/tag info derived from the legacy 'path'
        if (_path) {
            const folder = _path.substring(0, _path.lastIndexOf('/')) || 'uploads';
            formData.append('folder', `TEFA/${folder}`);
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = (event.loaded / event.total) * 100;
                onProgress(progress);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('☁️ Cloudinary Success:', response.secure_url);
                    resolve(response.secure_url);
                } catch (e) {
                    console.error('❌ Failed to parse Cloudinary response:', xhr.responseText);
                    reject(new Error('Invalid response from Cloudinary.'));
                }
            } else {
                let errorMsg = 'Upload failed';
                try {
                    const error = JSON.parse(xhr.responseText);
                    errorMsg = error.error?.message || errorMsg;
                    console.error('❌ Cloudinary Error:', error);
                } catch (e) {
                    console.error('❌ Cloudinary Error (Raw):', xhr.responseText);
                }
                reject(new Error(errorMsg));
            }
        };

        xhr.onerror = () => {
            console.error('❌ Network Error while uploading to Cloudinary');
            reject(new Error('Network error during upload. Please check your connection or CORS settings.'));
        };

        xhr.send(formData);
    });
};

/**
 * Upload a product image
 * @param file - The image file
 * @param productId - Optional product ID
 * @param onProgress - Optional progress callback
 * @returns The secure URL
 */
export const uploadProductImage = async (
    file: File,
    productId?: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const folder = productId || 'new_products';
    const path = `products/${folder}`;
    return uploadFile(file, path, onProgress);
};

/**
 * Upload a product video
 * @param file - The video file
 * @param productId - Optional product ID
 * @param onProgress - Optional progress callback
 * @returns The secure URL
 */
export const uploadProductVideo = async (
    file: File,
    productId?: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const folder = productId || 'new_products';
    const path = `products/${folder}/videos`;
    return uploadFile(file, path, onProgress);
};

/**
 * Delete a file (Note: Cloudinary requires Admin API or a server-side signature to delete files)
 * Since this is currently frontend-only, simple URL deletion isn't possible.
 * We'll just leave this as a no-op to prevent breaking the build.
 */
export const deleteFileByUrl = async (_url: string): Promise<void> => {
    console.warn('Direct Cloudinary deletion not supported from frontend for security reason.');
};

// Legacy Export for potential reuse of Firebase features
export const storage = null; 
