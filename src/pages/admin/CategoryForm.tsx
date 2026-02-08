import React, { useState } from 'react';
import { X, Loader2, Upload, Trash2 } from 'lucide-react';
import { useStore } from '../../data/store';
import { Category } from '../../types';
import { uploadFile } from '../../lib/storage';

interface CategoryFormProps {
    category?: Category | null;
    onClose: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose }) => {
    const { addCategory, updateCategory } = useStore();
    const isEditing = !!category;

    const [formData, setFormData] = useState({
        name: category?.name || '',
        image: category?.image || '',
        hoverImage: category?.hoverImage || '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'hoverImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const path = `categories/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path, (progress) => {
                setUploadProgress(prev => ({ ...prev, [field]: progress }));
            });
            setFormData(prev => ({ ...prev, [field]: url }));
        } catch (error) {
            console.error(`Upload failed for ${field}:`, error);
            alert(`Failed to upload ${field}. Please try again.`);
        } finally {
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        if (!formData.name || !formData.image) {
            alert('Please provide at least a name and a main image.');
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing && category) {
                await updateCategory(category.id, formData);
            } else {
                await addCategory(formData);
            }
            alert('Category saved successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Failed to save category. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form-content">
                    <div className="form-group">
                        <label htmlFor="name">Category Name *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Bubu Gowns"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Main Image *</label>
                            <div className="media-upload-area">
                                {formData.image ? (
                                    <div className="media-preview">
                                        <img src={formData.image} alt="Main" />
                                        <button type="button" className="remove-media" onClick={() => setFormData({ ...formData, image: '' })}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-placeholder">
                                        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image')} hidden />
                                        {uploadProgress['image'] !== undefined ? (
                                            <div className="progress-container">
                                                <Loader2 className="animate-spin" />
                                                <span>{Math.round(uploadProgress['image'])}%</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} />
                                                <span>Upload Image</span>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Hover Image (Optional)</label>
                            <div className="media-upload-area">
                                {formData.hoverImage ? (
                                    <div className="media-preview">
                                        <img src={formData.hoverImage} alt="Hover" />
                                        <button type="button" className="remove-media" onClick={() => setFormData({ ...formData, hoverImage: '' })}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-placeholder">
                                        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'hoverImage')} hidden />
                                        {uploadProgress['hoverImage'] !== undefined ? (
                                            <div className="progress-container">
                                                <Loader2 className="animate-spin" />
                                                <span>{Math.round(uploadProgress['hoverImage'])}%</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} />
                                                <span>Upload Image</span>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="button" className="cancel-btn" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Saving...
                                </>
                            ) : (
                                'Save Category'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fdfaf7;
        }

        .modal-header h2 {
          font-family: 'LC SAC', sans-serif;
          color: #2C1810;
          margin: 0;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #2C1810;
        }

        .form-content {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        label {
          font-weight: 600;
          font-size: 0.875rem;
          color: #444;
        }

        input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #CE870D;
        }

        .media-upload-area {
          height: 150px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .upload-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          color: #888;
          transition: background 0.2s;
        }

        .upload-placeholder:hover {
          background: #f9f9f9;
        }

        .media-preview {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .media-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-media {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
          color: #ff4444;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-footer {
          padding: 24px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #fdfaf7;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: none;
          border: 1px solid #ddd;
          border-radius: 6px;
          color: #666;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 140px;
          padding: 12px 24px;
          background: #2C1810;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: #3D2317;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .progress-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #CE870D;
        }
      `}</style>
        </div>
    );
};
