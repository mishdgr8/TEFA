import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderDetailsModal } from './OrderDetailsModal';
import { ShoppingBag, Trash2, Loader2, Eye } from 'lucide-react';
import { useStore } from '../../data/store';
import { formatPrice } from '../../utils/shopHelpers';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
    const { orders, updateOrderStatus, deleteOrder } = useStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [updatingId, setUpdatingId] = React.useState<string | null>(null);

    const selectedOrderId = searchParams.get('orderId');
    const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

    const setSelectedOrder = (order: Order | null) => {
        setSearchParams(prev => {
            if (order) prev.set('orderId', order.id);
            else prev.delete('orderId');
            return prev;
        });
    };

    const handleStatusChange = async (orderId: string, newStatus: Order['orderStatus']) => {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status: Order['orderStatus']) => {
        switch (status) {
            case 'new': return '#2563eb';
            case 'processing': return '#d97706';
            case 'shipped': return '#8b5cf6';
            case 'delivered': return '#059669';
            case 'cancelled': return '#dc2626';
            default: return '#6b7280';
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Customer Orders ({orders.length})</h2>
            </div>

            <div className="orders-table">
                <div className="table-header order-grid">
                    <span>Date / ID</span>
                    <span>Customer</span>
                    <span>Items</span>
                    <span>Amount</span>
                    <span>Payment</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                <div className="table-body">
                    {orders.map(order => (
                        <div key={order.id} className="table-row order-grid clickable-row" onClick={() => setSelectedOrder(order)}>
                            <div className="col-date">
                                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className="order-id">#{order.id.slice(-6).toUpperCase()}</span>
                            </div>

                            <div className="col-customer">
                                <span className="customer-name">{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                                <span className="customer-email">{order.customerInfo.email}</span>
                                <span className="customer-phone" style={{ fontSize: '10px', color: '#999', display: 'block' }}>{order.customerInfo.phone}</span>
                                <span className="customer-address" style={{ fontSize: '10px', color: '#666', marginTop: '4px', display: 'block' }}>
                                    {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.postalCode}<br />
                                    {order.customerInfo.country}
                                </span>
                            </div>

                            <div className="col-items">
                                <div className="items-preview">
                                    {order.items.map((item, idx) => (
                                        <span key={idx} className="item-tag">
                                            {item.qty}x {item.name} ({item.selectedSize})
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="col-amount">
                                <span className="total-amount">
                                    {formatPrice({ amount: order.currency === 'NGN' ? order.total : (order.totalUSD || 0) }, order.currency)}
                                </span>
                                <span className="order-currency" style={{ fontSize: '10px', display: 'block', opacity: 0.6 }}>{order.currency}</span>
                            </div>

                            <div className="col-payment">
                                <span className={`payment-badge ${order.paymentStatus}`}>
                                    {order.paymentStatus}
                                </span>
                                <span className="payment-ref">{order.paymentReference}</span>
                            </div>

                            <div className="col-status">
                                <div className="status-container" onClick={e => e.stopPropagation()}>
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['orderStatus'])}
                                        style={{
                                            borderColor: getStatusColor(order.orderStatus),
                                            color: getStatusColor(order.orderStatus)
                                        }}
                                        className="status-select"
                                        disabled={updatingId === order.id}
                                    >
                                        <option value="new">New</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {updatingId === order.id && <Loader2 size={14} className="spin" />}
                                </div>
                            </div>

                            <div className="col-actions">
                                <div className="action-stack" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="action-btn view"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this order record?')) {
                                                deleteOrder(order.id);
                                            }
                                        }}
                                        className="action-btn delete"
                                        title="Delete Order"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="table-empty">
                            <ShoppingBag size={48} />
                            <p>No orders found yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            <style>{`
        .orders-table {
          overflow-x: auto;
        }

        .order-grid {
          grid-template-columns: 120px 180px 1fr 120px 150px 150px 100px !important;
        }

        .clickable-row {
          cursor: pointer;
          transition: background 0.2s;
        }
        .clickable-row:hover {
          background: #f8f9fa;
        }

        .action-stack {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        
        .action-btn.view {
          color: #2563eb;
          background: #eff6ff;
        }
        .action-btn.view:hover {
          background: #dbeafe;
        }

        .order-date { display: block; font-weight: 600; color: #2C1810; }
        .order-id { font-size: 11px; color: #999; }
        
        .customer-name { display: block; font-weight: 600; color: #2C1810; }
        .customer-email { font-size: 11px; color: #666; display: block; }

        .items-preview { display: flex; flex-wrap: wrap; gap: 4px; }
        .item-tag { 
          font-size: 10px; 
          background: #333; 
          color: white;
          padding: 4px 10px; 
          border-radius: 6px; 
          white-space: nowrap;
          font-weight: 500;
        }

        .total-amount { font-weight: 700; color: #2C1810; font-size: 1.1rem; }

        .payment-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 99px;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
        }
        .payment-badge.success { background: #dcfce7; color: #15803d; }
        .payment-badge.pending { background: #fef9c3; color: #a16207; }
        .payment-badge.failed { background: #fee2e2; color: #b91c1c; }

        .payment-ref { display: block; font-size: 10px; color: #999; font-family: monospace; }

        .status-container { display: flex; align-items: center; gap: 8px; }
        .status-select {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          background: white;
          border: 1px solid;
          appearance: none;
          min-width: 110px;
          text-align: center;
        }

        .table-empty {
          padding: 100px 24px;
          text-align: center;
          color: #999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .table-empty svg { opacity: 0.1; }
      `}</style>
        </div>
    );
};
