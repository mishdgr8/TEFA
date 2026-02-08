import React, { useState } from 'react';
import { X, Loader2, Upload, Trash2, Youtube, Instagram, MessageCircle, ExternalLink, FileVideo } from 'lucide-react';
import { useStore } from '../../data/store';
import { CustomerReview } from '../../types';
import { uploadFile } from '../../lib/storage';

interface ReviewFormProps {
  review?: CustomerReview | null;
  onClose: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ review, onClose }) => {
  const { addReview, updateReview } = useStore();
  const isEditing = !!review;

  const [formData, setFormData] = useState({
    username: review?.username || '',
    thumbnail: review?.thumbnail || '',
    videoUrl: review?.videoUrl || '',
    externalLink: review?.externalLink || '',
    platform: (review?.platform || 'instagram') as 'instagram' | 'tiktok' | 'other',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('Video file is too large. Please upload a video smaller than 50MB.');
      return;
    }

    try {
      const path = `reviews/videos/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path, (progress) => {
        setVideoUploadProgress(progress);
      });
      setFormData(prev => ({ ...prev, videoUrl: url }));
    } catch (error) {
      console.error('Video upload failed:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setVideoUploadProgress(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const path = `reviews/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path, (progress) => {
        setUploadProgress(progress);
      });
      setFormData(prev => ({ ...prev, thumbnail: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload thumbnail. Please try again.');
    } finally {
      setUploadProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!formData.username || !formData.thumbnail) {
      alert('Please provide at least a username and a thumbnail image.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && review) {
        await updateReview(review.id, formData);
      } else {
        await addReview(formData);
      }
      alert('Review saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save review:', error);
      alert('Failed to save review. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Review' : 'Add New Review'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="username">Customer Username *</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g., @tefa_queen"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="other">Other</option>
            </select>
          </div>

          // Re-inserting correct video upload UI later

          <div className="form-group">
            <label>Review Video (MP4) - Optional</label>
            <div className="media-upload-area">
              {formData.videoUrl ? (
                <div className="media-preview">
                  <video src={formData.videoUrl} controls className="preview-video" />
                  <button type="button" className="remove-media" onClick={() => setFormData({ ...formData, videoUrl: '' })}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} hidden />
                  {videoUploadProgress !== null ? (
                    <div className="progress-container">
                      <Loader2 className="animate-spin" />
                      <span>{Math.round(videoUploadProgress)}%</span>
                    </div>
                  ) : (
                    <>
                      <Youtube size={24} />
                      <span>Upload Video</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="externalLink">External Social Link (Optional)</label>
            <div className="input-with-icon">
              <ExternalLink size={18} />
              <input
                id="externalLink"
                type="url"
                value={formData.externalLink}
                onChange={e => setFormData({ ...formData, externalLink: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Review Thumbnail *</label>
            <div className="media-upload-area">
              {formData.thumbnail ? (
                <div className="media-preview">
                  <img src={formData.thumbnail} alt="Thumbnail" />
                  <button type="button" className="remove-media" onClick={() => setFormData({ ...formData, thumbnail: '' })}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
                  {uploadProgress !== null ? (
                    <div className="progress-container">
                      <Loader2 className="animate-spin" />
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span>Upload Thumbnail</span>
                    </>
                  )}
                </label>
              )}
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
                'Save Review'
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
          max-width: 500px;
          max-height: 90vh;
          display: flex; flex-direction: column;
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

        label {
          font-weight: 600;
          font-size: 0.875rem;
          color: #444;
        }

        input, select {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          left: 12px;
          color: #888;
        }

        .input-with-icon input {
          padding-left: 40px;
          width: 100%;
        }

        .media-upload-area {
          height: 200px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          overflow: hidden;
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
        }

        .media-preview {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .media-preview img, .media-preview video {
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
        }

        .submit-btn:hover:not(:disabled) {
          background: #3D2317;
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
