import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Image, Upload, Video, Loader2 } from 'lucide-react';
import { useStore } from '../../data/store';
import { Product, ProductColor } from '../../types';
import { uploadProductImage, uploadProductVideo } from '../../lib/storage';

interface ProductFormProps {
  productId?: string;
  onClose: () => void;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  discountPercentage: string;
  categoryId: string;


  imageUrl: string;
  galleryImages: string[];
  videoUrl: string;
  quantity: string;
  soldOut: boolean;
  tags: string;
  sizes: string;
  colors: ProductColor[];
}

const initialFormData: FormData = {
  name: '',
  description: '',
  price: '',
  salePrice: '',
  discountPercentage: '',
  categoryId: '1',


  imageUrl: '',
  galleryImages: [],
  videoUrl: '',
  quantity: '10',
  soldOut: false,
  tags: '',
  sizes: 'S, M, L',
  colors: [{ name: 'Default', hex: '#000000' }],
};

export const ProductForm: React.FC<ProductFormProps> = ({ productId, onClose }) => {
  const { products, categories, addProduct, updateProduct } = useStore();
  const isEditing = !!productId;
  const existingProduct = productId ? products.find(p => p.id === productId) : null;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mainProgress, setMainProgress] = useState(0);
  const [galleryProgress, setGalleryProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64 data URL (for local preview only)
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMain(true);
    setMainProgress(0);
    try {
      const downloadUrl = await uploadProductImage(file, existingProduct?.id, (p) => setMainProgress(Math.round(p)));
      setFormData({ ...formData, imageUrl: downloadUrl });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingMain(false);
      setMainProgress(0);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setGalleryProgress(0);
    try {
      const newImages: string[] = [];
      const fileArray = Array.from(files) as File[];
      for (const [index, file] of fileArray.entries()) {
        const downloadUrl = await uploadProductImage(file, existingProduct?.id, (p) => {
          const totalProgress = ((index / fileArray.length) * 100) + (p / fileArray.length);
          setGalleryProgress(Math.round(totalProgress));
        });
        newImages.push(downloadUrl);
      }
      setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...newImages] });
    } catch (error) {
      console.error('Failed to upload gallery images:', error);
      alert('Failed to upload gallery images. Please try again.');
    } finally {
      setUploadingGallery(false);
      setGalleryProgress(0);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      const downloadUrl = await uploadProductVideo(file, existingProduct?.id, (p) => setVideoProgress(Math.round(p)));
      setFormData({ ...formData, videoUrl: downloadUrl });
    } catch (error) {
      console.error('Failed to upload video:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  };

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price.toString(),
        salePrice: existingProduct.salePrice ? existingProduct.salePrice.toString() : '',
        discountPercentage: existingProduct.salePrice
          ? Math.round(((existingProduct.price - existingProduct.salePrice) / existingProduct.price) * 100).toString()
          : '',
        categoryId: existingProduct.categoryId,


        imageUrl: existingProduct.images[0] || '',
        galleryImages: existingProduct.galleryImages || [],
        videoUrl: existingProduct.videoUrl || '',
        quantity: (existingProduct.quantity ?? 0).toString(),
        soldOut: !!existingProduct.soldOut,
        tags: existingProduct.tags.join(', '),
        sizes: existingProduct.sizes.join(', '),
        colors: existingProduct.colors.length > 0 ? existingProduct.colors : [{ name: 'Default', hex: '#000000' }],
      });
    }
  }, [existingProduct]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.salePrice && (isNaN(Number(formData.salePrice)) || Number(formData.salePrice) < 0)) {
      newErrors.discountPercentage = 'Valid discount is required';
    }
    if (formData.salePrice && Number(formData.salePrice) >= Number(formData.price)) {
      newErrors.discountPercentage = 'Discount must result in lower price';
    }

    if (!formData.imageUrl.trim()) {

      newErrors.imageUrl = 'Image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSaving) return;

    setIsSaving(true);
    try {
      const productData: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        currency: '₦',

        categoryId: formData.categoryId,
        images: [formData.imageUrl.trim()],
        galleryImages: formData.galleryImages.filter(url => url.trim()),
        videoUrl: formData.videoUrl.trim(),
        quantity: Number(formData.quantity) || 0,
        soldOut: formData.soldOut,
        stockStatus: formData.soldOut ? 'out_of_stock' : (Number(formData.quantity) < 5 ? 'low_stock' : 'in_stock'),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.filter(c => c.name.trim()),
      };

      if (isEditing && productId) {
        console.log('Updating product:', productId, productData);
        await updateProduct(productId, productData);
      } else {
        console.log('Adding new product:', productData);
        await addProduct(productData);
      }



      console.log('Product saved successfully, closing form.');
      alert('Product saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', hex: '#888888' }],
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const updateColor = (index: number, field: keyof ProductColor, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Indigo Flow Kaftan"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (₦) *</label>
                  <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={e => {
                      const newPrice = e.target.value;
                      const pct = formData.discountPercentage;
                      let newSalePrice = formData.salePrice;

                      if (pct && !isNaN(Number(pct)) && newPrice && !isNaN(Number(newPrice))) {
                        newSalePrice = Math.round(Number(newPrice) * (1 - Number(pct) / 100)).toString();
                      }

                      setFormData({
                        ...formData,
                        price: newPrice,
                        salePrice: newSalePrice
                      });
                    }}
                    placeholder="45000"
                    className={errors.price ? 'error' : ''}
                  />

                  {errors.price && <span className="error-text">{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="discountPercentage">Discount (%) <span style={{ fontWeight: 'normal', color: '#666' }}>(Optional)</span></label>
                  <input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="99"
                    value={formData.discountPercentage}
                    onChange={e => {
                      const pct = e.target.value;
                      const price = Number(formData.price);
                      let newSalePrice = '';

                      if (pct && !isNaN(Number(pct)) && price) {
                        newSalePrice = Math.round(price * (1 - Number(pct) / 100)).toString();
                      }

                      setFormData({
                        ...formData,
                        discountPercentage: pct,
                        salePrice: newSalePrice
                      });
                    }}
                    placeholder="e.g. 20"
                    className={errors.discountPercentage ? 'error' : ''}
                  />
                  {formData.salePrice && (
                    <span className="helper-text" style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '4px', display: 'block' }}>
                      Sale Price: ₦{Number(formData.salePrice).toLocaleString()}
                    </span>
                  )}
                  {errors.discountPercentage && <span className="error-text">{errors.discountPercentage}</span>}
                </div>


                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="imageUrl">Main Image *</label>
                <div className="upload-section">
                  <input
                    id="imageUrl"
                    type="text"
                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Paste URL or upload from device..."
                    className={errors.imageUrl ? 'error' : ''}
                  />
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => mainImageInputRef.current?.click()}
                    disabled={uploadingMain}
                  >
                    <Upload size={16} />
                    {uploadingMain ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {uploadingMain && (
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar" style={{ width: `${mainProgress}%` }} />
                    <span className="upload-progress-text">{mainProgress}%</span>
                  </div>
                )}
                {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}

                {formData.imageUrl && (
                  <div className="image-preview">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                    {formData.imageUrl.startsWith('data:') && (
                      <span className="upload-badge">Uploaded from device</span>
                    )}
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="form-group">
                <label>Gallery Images (Additional Views)</label>
                <div className="gallery-list">
                  {formData.galleryImages.map((url, index) => (
                    <div key={index} className="gallery-row">
                      {url.startsWith('data:') ? (
                        <div className="gallery-preview-inline">
                          <img src={url} alt={`Gallery ${index + 1}`} />
                          <span>Uploaded image</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={url}
                          onChange={e => {
                            const newGallery = [...formData.galleryImages];
                            newGallery[index] = e.target.value;
                            setFormData({ ...formData, galleryImages: newGallery });
                          }}
                          placeholder="https://..."
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newGallery = formData.galleryImages.filter((_, i) => i !== index);
                          setFormData({ ...formData, galleryImages: newGallery });
                        }}
                        className="remove-gallery-btn"
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {uploadingGallery && (
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar" style={{ width: `${galleryProgress}%` }} />
                    <span className="upload-progress-text">{galleryProgress}%</span>
                  </div>
                )}

                <div className="gallery-actions">
                  <input
                    ref={galleryImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="add-gallery-btn"
                    onClick={() => galleryImageInputRef.current?.click()}
                    disabled={uploadingGallery}
                  >
                    <Plus size={16} />
                    {uploadingGallery ? 'Uploading Gallery...' : 'Add Gallery Images'}
                  </button>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="form-group">
              <label htmlFor="videoUrl">Video (Optional)</label>
              <div className="upload-section">
                <input
                  id="videoUrl"
                  type="text"
                  value={formData.videoUrl.startsWith('data:') ? '' : formData.videoUrl}
                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="Paste YouTube URL or upload video..."
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                >
                  <Video size={16} />
                  {uploadingVideo ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadingVideo && (
                <div className="upload-progress-container">
                  <div className="upload-progress-bar" style={{ width: `${videoProgress}%` }} />
                  <span className="upload-progress-text">{videoProgress}%</span>
                </div>
              )}
              {formData.videoUrl.startsWith('data:') && (
                <span className="upload-badge" style={{ marginTop: '8px' }}>Video uploaded from device</span>
              )}
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label htmlFor="quantity">Stock Quantity</label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="10"
                disabled={formData.soldOut}
              />
            </div>

            {/* Sold Out Toggle */}
            <div className="form-group sold-out-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.soldOut}
                  onChange={e => setFormData({
                    ...formData,
                    soldOut: e.target.checked,
                    quantity: e.target.checked ? '0' : formData.quantity
                  })}
                />
                <span className="toggle-slider" />
                <span className="toggle-text">
                  {formData.soldOut ? '🔴 SOLD OUT' : '🟢 In Stock'}
                </span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Best Seller, New Arrival"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sizes">Sizes (comma-separated)</label>
              <input
                id="sizes"
                type="text"
                value={formData.sizes}
                onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL"
              />
            </div>

            <div className="form-group">
              <label>Colors</label>
              <div className="colors-list">
                {formData.colors.map((color, index) => (
                  <div key={index} className="color-row">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={e => updateColor(index, 'hex', e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={color.name}
                      onChange={e => updateColor(index, 'name', e.target.value)}
                      placeholder="Color name"
                      className="color-name"
                    />
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="color-remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addColor} className="add-color-btn">
                  <Plus size={16} /> Add Color
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSaving || uploadingMain || uploadingGallery || uploadingVideo}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }

        .modal-content {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          background: white;
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--color-nude-light);
        }

        .modal-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          font-style: italic;
        }

        .modal-close {
          padding: var(--space-2);
          background: none;
          border: none;
          color: var(--color-brown);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--color-cream-dark);
        }

        .product-form {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-6);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }

        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-group label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-brown-dark);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: var(--space-3) var(--space-4);
          background: var(--color-cream-dark);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.9375rem;
          color: var(--color-text);
          outline: none;
          transition: all var(--transition-fast);
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          background: white;
          border-color: var(--color-coral);
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #DC2626;
          background: #FEF2F2;
        }

        .error-text {
          font-size: 0.75rem;
          color: #DC2626;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .image-preview {
          margin-top: var(--space-2);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-cream-dark);
        }

        .image-preview img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .colors-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .color-picker {
          width: 40px;
          height: 40px;
          padding: 2px;
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .color-name {
          flex: 1;
        }

        .color-remove {
          padding: var(--space-2);
          background: #FEE2E2;
          color: #DC2626;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .add-color-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--color-cream-dark);
          color: var(--color-brown);
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: var(--space-2);
        }

        .add-color-btn:hover {
          background: var(--color-nude-light);
        }

        .gallery-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .gallery-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .gallery-row input {
          flex: 1;
        }

        .gallery-remove {
          padding: var(--space-2);
          background: #FEE2E2;
          color: #DC2626;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          flex-shrink: 0;
        }

        .gallery-remove:hover {
          background: #FECACA;
        }

        .add-gallery-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--color-cream-dark);
          color: var(--color-brown);
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
        }

        .add-gallery-btn:hover {
          background: var(--color-nude-light);
        }

        .add-gallery-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gallery-actions {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-2);
          flex-wrap: wrap;
        }

        .upload-gallery-btn {
          background: var(--color-coral);
          color: white;
        }

        .upload-gallery-btn:hover:not(:disabled) {
          background: var(--color-coral-dark);
        }

        .upload-section {
          display: flex;
          gap: var(--space-2);
        }

        .upload-section input {
          flex: 1;
        }

        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-4);
          background: var(--color-coral);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .upload-btn:hover:not(:disabled) {
          background: var(--color-coral-dark);
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-badge {
          display: inline-block;
          padding: var(--space-1) var(--space-2);
          background: #D1FAE5;
          color: #065F46;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          margin-top: var(--space-2);
        }

        .gallery-preview-inline {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          padding: var(--space-2);
          background: var(--color-cream-dark);
          border-radius: var(--radius-md);
        }

        .gallery-preview-inline img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }

        .gallery-preview-inline span {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-nude-light);
          margin-top: var(--space-6);
        }

        .cancel-btn {
          padding: var(--space-3) var(--space-6);
          background: none;
          color: var(--color-text-muted);
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .cancel-btn:hover {
          background: var(--color-cream-dark);
        }

        .submit-btn {
          padding: var(--space-3) var(--space-6);
          background: var(--color-coral);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .submit-btn:hover {
          background: var(--color-coral-dark);
        }

        /* Progress Bar Styles */
        .upload-progress-container {
          width: 100%;
          height: 6px;
          background: var(--color-nude-light);
          border-radius: 3px;
          margin-top: 10px;
          overflow: hidden;
        }

        .upload-progress-bar {
          height: 100%;
          background: var(--color-coral);
          transition: width 0.3s ease;
        }

        .upload-progress-text {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 4px;
          display: block;
          text-align: right;
        }

        /* Sold Out Toggle Styles */
        .sold-out-toggle {
          margin-top: var(--space-2);
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          cursor: pointer;
          user-select: none;
        }

        .toggle-label input {
          display: none;
        }

        .toggle-slider {
          position: relative;
          width: 44px;
          height: 22px;
          background: var(--color-nude);
          border-radius: 22px;
          transition: background 0.3s ease;
        }

        .toggle-slider:before {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          left: 2px;
          bottom: 2px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        input:checked + .toggle-slider {
          background: var(--color-coral);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .toggle-text {
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Quicksand', sans-serif;
          color: var(--color-brown);
        }
      `}</style>
    </div >
  );
};
