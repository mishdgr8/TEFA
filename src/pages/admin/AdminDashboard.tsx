import React, { useState } from 'react';
import { PageName } from '../../types';
import {
  Package,
  Plus,
  Grid3X3,
  Settings,
  Home,
  ChevronRight,
  Loader2,
  Lock
} from 'lucide-react';
import { useStore } from '../../data/store';

interface AdminDashboardProps {
  onNavigate: (page: PageName) => void;
  onOpenProductForm: (productId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenProductForm
}) => {
  const { products, categories, deleteProduct, user, loading } = useStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setDeletingId(id);
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-auth-required">
          <Lock size={48} />
          <h2>Admin Access Required</h2>
          <p>Please sign in to access the admin dashboard.</p>
          <button onClick={() => onNavigate('home')} className="admin-back-home">
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
                        padding: var(--space-8);
                    }
                    .admin-auth-required svg {
                        color: var(--color-coral);
                        margin-bottom: var(--space-6);
                    }
                    .admin-auth-required h2 {
                        font-family: 'Cormorant Garamond', serif;
                        font-size: 1.75rem;
                        font-style: italic;
                        margin-bottom: var(--space-2);
                    }
                    .admin-auth-required p {
                        color: var(--color-text-muted);
                        margin-bottom: var(--space-6);
                    }
                    .admin-back-home {
                        padding: var(--space-3) var(--space-6);
                        background: var(--color-coral);
                        color: white;
                        border: none;
                        border-radius: var(--radius-md);
                        font-family: 'Quicksand', sans-serif;
                        font-weight: 600;
                        cursor: pointer;
                    }
                `}</style>
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
                        gap: var(--space-4);
                    }
                    .admin-loading svg {
                        color: var(--color-coral);
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
        {/* Admin Header */}

        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your TÉFA products and inventory</p>
          </div>
          <div className="admin-header-actions">
            <button onClick={() => onNavigate('home')} className="admin-back-btn">
              <Home size={18} /> View Store
            </button>
            <button onClick={() => onOpenProductForm()} className="admin-add-btn">
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{products.length}</span>
              <span className="stat-label">Products</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Grid3X3 size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{categories.length}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-section">
          <div className="section-header">
            <h2>All Products</h2>
            <button onClick={() => onOpenProductForm()} className="section-add-btn">
              <Plus size={16} /> New
            </button>
          </div>

          <div className="products-table">
            <div className="table-header">
              <span className="col-image">Image</span>
              <span className="col-name">Name</span>
              <span className="col-category">Category</span>
              <span className="col-price">Price</span>
              <span className="col-actions">Actions</span>
            </div>

            <div className="table-body">
              {products.map(product => (
                <div key={product.id} className="table-row">
                  <div className="col-image">
                    <img src={product.images[0]} alt={product.name} />
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
                  <div className="col-actions">
                    <button
                      onClick={() => onOpenProductForm(product.id)}
                      className="action-btn edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="table-empty">
                  <p>No products yet. Add your first product!</p>
                  <button onClick={() => onOpenProductForm()}>
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-page {
          padding-top: 100px;
          padding-bottom: var(--space-24);
          background: var(--color-cream-dark);
          min-height: 100vh;
        }

        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }

        .admin-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        @media (min-width: 768px) {
          .admin-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .admin-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 700;
          font-style: italic;
          margin-bottom: var(--space-1);
        }

        .admin-header p {
          color: var(--color-text-muted);
          font-size: 0.9375rem;
        }

        .admin-header-actions {
          display: flex;
          gap: var(--space-3);
        }

        .admin-back-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: white;
          color: var(--color-brown);
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .admin-back-btn:hover {
          background: var(--color-cream);
        }

        .admin-add-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: var(--color-coral);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .admin-add-btn:hover {
          background: var(--color-coral-dark);
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        @media (min-width: 768px) {
          .admin-stats {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .stat-card {
          background: white;
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-coral-light);
          color: var(--color-coral-dark);
          border-radius: var(--radius-md);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-brown-dark);
        }

        .stat-label {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .admin-section {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--color-nude-light);
        }

        .section-header h2 {
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
        }

        .section-add-btn {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--color-cream-dark);
          color: var(--color-brown);
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
        }

        .section-add-btn:hover {
          background: var(--color-nude-light);
        }

        .products-table {
          overflow-x: auto;
        }

        .table-header {
          display: none;
        }

        @media (min-width: 768px) {
          .table-header {
            display: grid;
            grid-template-columns: 80px 2fr 1fr 100px 150px;
            gap: var(--space-4);
            padding: var(--space-3) var(--space-6);
            background: var(--color-cream-dark);
            font-size: 0.6875rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--color-text-muted);
          }
        }

        .table-body {
          padding: var(--space-4);
        }

        @media (min-width: 768px) {
          .table-body {
            padding: 0;
          }
        }

        .table-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-nude-light);
          align-items: center;
        }

        @media (min-width: 768px) {
          .table-row {
            display: grid;
            grid-template-columns: 80px 2fr 1fr 100px 150px;
            gap: var(--space-4);
            padding: var(--space-4) var(--space-6);
          }
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .col-image img {
          width: 64px;
          height: 80px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }

        .col-name {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 150px;
        }

        .product-name {
          font-weight: 600;
          color: var(--color-brown-dark);
        }

        .product-tags {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .col-category {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .col-price {
          font-weight: 700;
          color: var(--color-coral);
        }

        .col-actions {
          display: flex;
          gap: var(--space-2);
        }

        .action-btn {
          padding: var(--space-2) var(--space-3);
          border: none;
          border-radius: var(--radius-sm);
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn.edit {
          background: var(--color-cream-dark);
          color: var(--color-brown);
        }

        .action-btn.edit:hover {
          background: var(--color-nude-light);
        }

        .action-btn.delete {
          background: #FEE2E2;
          color: #DC2626;
        }

        .action-btn.delete:hover {
          background: #FECACA;
        }

        .table-empty {
          padding: var(--space-12);
          text-align: center;
        }

        .table-empty p {
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }

        .table-empty button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: var(--color-coral);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
