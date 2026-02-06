import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image } from 'lucide-react';
import { useStore } from '../../data/store';
import { CATEGORIES } from '../../data/categories';
import { Product, ProductColor } from '../../types';

interface ProductFormProps {
    productId?: string;
    onClose: () => void;
}

interface FormData {
    name: string;
    description: string;
    price: string;
    categoryId: string;
    imageUrl: string;
    tags: string;
    sizes: string;
    colors: ProductColor[];
}

const initialFormData: FormData = {
    name: '',
    description: '',
    price: '',
    categoryId: '1',
    imageUrl: '',
    tags: '',
    sizes: 'S, M, L',
    colors: [{ name: 'Default', hex: '#000000' }],
};

export const ProductForm: React.FC<ProductFormProps> = ({ productId, onClose }) => {
    const { products, addProduct, updateProduct } = useStore();
    const isEditing = !!productId;
    const existingProduct = productId ? products.find(p => p.id === productId) : null;

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (existingProduct) {
            setFormData({
                name: existingProduct.name,
                description: existingProduct.description,
                price: existingProduct.price.toString(),
                categoryId: existingProduct.categoryId,
                imageUrl: existingProduct.images[0] || '',
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
        if (!formData.imageUrl.trim()) {
            newErrors.imageUrl = 'Image URL is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const productData = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: Number(formData.price),
            currency: '₦',
            categoryId: formData.categoryId,
            images: [formData.imageUrl.trim()],
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
            colors: formData.colors.filter(c => c.name.trim()),
        };

        if (isEditing && productId) {
            updateProduct(productId, productData);
        } else {
            addProduct(productData);
        }

        onClose();
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
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="45000"
                                        className={errors.price ? 'error' : ''}
                                    />
                                    {errors.price && <span className="error-text">{errors.price}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select
                                        id="category"
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="form-column">
                            <div className="form-group">
                                <label htmlFor="imageUrl">Image URL *</label>
                                <input
                                    id="imageUrl"
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className={errors.imageUrl ? 'error' : ''}
                                />
                                {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}

                                {formData.imageUrl && (
                                    <div className="image-preview">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            onError={e => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}
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
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            {isEditing ? 'Save Changes' : 'Add Product'}
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
      `}</style>
        </div>
    );
};
