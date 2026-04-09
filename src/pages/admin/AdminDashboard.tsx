import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Grid3X3,
  Settings,
  Home,
  ChevronRight,
  Loader2,
  Lock,
  MessageSquare,
  Trash2,
  Edit,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../data/store';
import { CategoryForm } from './CategoryForm';
import { ReviewForm } from './ReviewForm';
import { AdminOrders } from './AdminOrders';
import { Category, CustomerReview } from '../../types';
import { OptimizedImage } from '../../components/OptimizedImage';

interface AdminDashboardProps {
  onOpenProductForm: (productId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenProductForm
}) => {
  const navigate = useNavigate();
  const {
    products,
    categories,
    reviews,
    deleteProduct,
    deleteCategory,
    deleteReview,
    orders,
    user,
    loading,
    authLoading
  } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'products' | 'categories' | 'reviews' | 'orders') || 'products';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modals for Categories and Reviews
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      setDeletingId(id);
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"? Products in this category will become uncategorized.`)) {
      setDeletingId(id);
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete review from "${name}"?`)) {
      setDeletingId(id);
      try {
        await deleteReview(id);
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('Failed to delete review.');
      } finally {
        setDeletingId(null);
      }
    }
  };



  const openCategoryForm = (category?: Category) => {
    setEditingCategory(category || null);
    setIsCategoryFormOpen(true);
  };

  const openReviewForm = (review?: CustomerReview) => {
    setEditingReview(review || null);
    setIsReviewFormOpen(true);
  };

  if (authLoading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-auth-required">
          <Lock size={48} />
          <h2>Admin Access Required</h2>
          <p>Please sign in to access the admin dashboard.</p>
          <button onClick={() => navigate('/')} className="admin-back-home">
            Go to Homepage
          </button>
        </div>
        <style>{`
          .admin-auth-required {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            text-align: center;
            padding: 32px;
          }
          .admin-auth-required svg {
            color: #ff7f50;
            margin-bottom: 24px;
          }
          .admin-auth-required h2 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.75rem;
            font-style: italic;
            margin-bottom: 8px;
          }
          .admin-auth-required p {
            color: #666;
            margin-bottom: 24px;
          }
          .admin-back-home {
            padding: 12px 24px;
            background: #ff7f50;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-auth-required">
          <Lock size={48} />
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin dashboard.</p>
          <button onClick={() => navigate('/')} className="admin-back-home">
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <Loader2 size={32} className="spin" />
          <p>Loading products...</p>
        </div>
        <style>{`
          .admin-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 16px;
          }
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title-area">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-header-actions">
            <button onClick={() => navigate('/')} className="admin-back-btn">
              <Home size={18} /> <span>Store</span>
            </button>
            <button onClick={() => onOpenProductForm()} className="admin-add-btn">
              <Plus size={18} /> <span>Product</span>
            </button>
          </div>
        </div>

        {/* Tabs - Mobile Dropdown / Desktop List */}
        <div className="admin-tabs-container">
          <div className="admin-tabs-mobile">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="admin-tab-select"
            >
              <option value="products">📦 Products</option>
              <option value="categories">🗂️ Categories</option>
              <option value="reviews">💬 Customer Reviews</option>
              <option value="orders">🛍️ Orders</option>
            </select>
          </div>

          <div className="admin-tabs-desktop">
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={18} />
              Products
            </button>
            <button
              className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <Grid3X3 size={18} />
              Categories
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={18} />
              Customer Reviews
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={18} />
              Orders
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>All Products ({products.length})</h2>
              <button onClick={() => onOpenProductForm()} className="section-add-btn">
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="products-table">
              <div className="table-header">
                <span className="col-image">Image</span>
                <span className="col-name">Name</span>
                <span className="col-category">Category</span>
                <span className="col-price">Price (NGN)</span>
                <span className="col-price-usd">Price (USD)</span>
                <span className="col-actions">Actions</span>
              </div>

              <div className="table-body">
                {products.map(product => (
                  <div key={product.id} className="table-row">
                    <div className="col-image">
                      <OptimizedImage src={product.images[0]} alt={product.name} />
                    </div>
                    <div className="col-name">
                      <span className="product-name">{product.name}</span>
                      <span className="product-tags">
                        {product.tags.join(', ')}
                      </span>
                    </div>
                    <div className="col-category">
                      {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                    </div>
                    <div className="col-price">
                      ₦{product.price.toLocaleString()}
                    </div>
                    <div className="col-price-usd">
                      {product.priceUSD ? `$${product.priceUSD.toFixed(2)}` : 'Auto'}
                    </div>
                    <div className="col-actions">
                      <button onClick={() => onOpenProductForm(product.id)} className="action-btn edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id, product.name)} className="action-btn delete" disabled={deletingId === product.id}>
                        {deletingId === product.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="table-empty">
                    <p>No products yet. Add your first product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>All Categories ({categories.length})</h2>
              <button onClick={() => openCategoryForm()} className="section-add-btn">
                <Plus size={16} /> Add Category
              </button>
            </div>

            <div className="products-table">
              <div className="table-header cat-grid">
                <span className="col-image">Image</span>
                <span className="col-name">Name</span>
                <span className="col-slug">Slug</span>
                <span className="col-actions">Actions</span>
              </div>

              <div className="table-body">
                {categories.map(cat => (
                  <div key={cat.id} className="table-row cat-grid">
                    <div className="col-image"><OptimizedImage src={cat.image} alt={cat.name} /></div>
                    <div className="col-name"><span className="product-name">{cat.name}</span></div>
                    <div className="col-slug"><code>{cat.slug}</code></div>
                    <div className="col-actions">
                      <button onClick={() => openCategoryForm(cat)} className="action-btn edit"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="action-btn delete" disabled={deletingId === cat.id}>
                        {deletingId === cat.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Customer Reviews ({reviews.length})</h2>
              <button onClick={() => openReviewForm()} className="section-add-btn">
                <Plus size={16} /> Add Review
              </button>
            </div>

            <div className="products-table">
              <div className="table-header review-grid">
                <span className="col-image">Thumb</span>
                <span className="col-name">User</span>
                <span className="col-platform">Platform</span>
                <span className="col-actions">Actions</span>
              </div>

              <div className="table-body">
                {reviews.map(review => (
                  <div key={review.id} className="table-row review-grid">
                    <div className="col-image"><OptimizedImage src={review.thumbnail} alt={review.username} /></div>
                    <div className="col-name">
                      <span className="product-name">{review.username}</span>
                      {review.videoUrl && (
                        <a href={review.videoUrl} target="_blank" rel="noopener noreferrer" className="review-link">
                          View Video <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="col-platform" style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>
                      {review.platform}
                    </div>
                    <div className="col-actions">
                      <button onClick={() => openReviewForm(review)} className="action-btn edit"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteReview(review.id, review.username)} className="action-btn delete" disabled={deletingId === review.id}>
                        {deletingId === review.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && <AdminOrders />}
      </div>

      {isCategoryFormOpen && <CategoryForm category={editingCategory} onClose={() => setIsCategoryFormOpen(false)} />}
      {isReviewFormOpen && <ReviewForm review={editingReview} onClose={() => setIsReviewFormOpen(false)} />}

      <style>{`
        .admin-page {
          padding-top: 140px;
          padding-bottom: 80px;
          background: #fdfaf7;
          min-height: 100vh;
        }

        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .admin-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-style: italic;
          margin: 0;
        }

        .admin-header p {
          color: #666;
          margin: 4px 0 0 0;
        }

        .admin-header-actions {
          display: flex;
          gap: 12px;
        }

        .admin-back-btn, .admin-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .admin-back-btn {
          background: white;
          color: #2C1810;
          border: 1px solid #eee;
        }

        .admin-add-btn {
          background: #ff7f50;
          color: white;
          border: none;
        }

        .admin-tabs-container {
          margin-bottom: 32px;
        }

        .admin-tabs-mobile {
          display: none;
        }

        .admin-tab-select {
          width: 100%;
          padding: 15px;
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          color: #2C1810;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .admin-tabs-desktop {
          display: flex;
          gap: 4px;
          background: white;
          padding: 4px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          width: fit-content;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          background: none;
          border-radius: 8px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          white-space: nowrap;
        }

        .tab-btn.active {
          background: #2C1810;
          color: white;
        }

        .admin-section {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .admin-header-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .admin-back-btn, .admin-add-btn {
            justify-content: center;
          }

          .admin-tabs-desktop {
            display: none;
          }

          .admin-tabs-mobile {
            display: block;
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #eee;
          background: white;
        }

        @media (max-width: 768px) {
          .section-header {
             flex-direction: column;
             gap: 16px;
             align-items: flex-start;
             padding: 20px;
          }
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .section-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #2C1810;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .section-add-btn:hover {
          background: #111111;
          transform: translateY(-1px);
        }

        .products-table {
          overflow-x: auto;
        }

        .table-header {
          display: grid;
          grid-template-columns: 80px 2fr 1fr 100px 150px;
          gap: 16px;
          padding: 16px 24px;
          background: #fdfaf7;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          color: #888;
          letter-spacing: 0.1em;
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 80px 2fr 1fr 120px 100px 120px;
          gap: 16px;
          padding: 20px 32px;
          align-items: center;
          border-bottom: 1px solid #f9f9f9;
        }

        .col-image img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }

        .product-name {
          font-weight: 600;
          display: block;
        }

        .product-tags {
          font-size: 11px;
          color: #999;
        }

        .col-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .action-btn:hover { transform: scale(1.1); }
        .action-btn.edit { background: #f0f0f0; color: #666; }
        .action-btn.delete { background: #fee2e2; color: #ef4444; }

        .review-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #CE870D;
          text-decoration: none;
        }

        .cat-grid { grid-template-columns: 80px 1fr 1fr 150px !important; }
        .review-grid { grid-template-columns: 80px 1fr 100px 150px !important; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
