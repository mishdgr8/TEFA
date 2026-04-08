import React, { useState, useEffect } from 'react';
import { useStore, formatPrice } from '../data/store';
import { getUserOrders } from '../lib/supabaseDb';
import { Order } from '../types';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';

export const OrdersPage: React.FC = () => {
    const { user, currency, authLoading } = useStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return; // Wait for auth check

        if (!user) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await getUserOrders(user.uid);
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const getStatusIcon = (status: Order['orderStatus']) => {
        switch (status) {
            case 'new': return <Clock size={16} />;
            case 'processing': return <Package size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <div className="loading-spinner" />
                <p>Retrieving your orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Shop
                    </Link>
                    <h1>Your Purchase History</h1>
                    <p>Track and manage your recent orders from TÉFA.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <ShoppingBag size={48} />
                        <h2>No orders yet</h2>
                        <p>You haven't placed any orders yet. Start your journey with our premium collection.</p>
                        <Link to="/shop" className="shop-now-btn">Shop Now</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <m.div
                                key={order.id}
                                className="order-card-detailed"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="detail-header">
                                    <div className="header-main">
                                        <h2>Order #{order.id.slice(-6).toUpperCase()}</h2>
                                        <div className="status-row">
                                            <div className="status-badge-detailed" data-status={order.orderStatus}>
                                                {getStatusIcon(order.orderStatus)}
                                                Order {order.orderStatus}
                                            </div>
                                            <span className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                    </div>
                                    <div className="header-actions">
                                        <div className="payment-status-pill" data-paid={order.paymentStatus === 'success'}>
                                            {order.paymentStatus === 'success' ? 'Payment Successful' : 'Payment Pending'}
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-grid">
                                    <div className="summary-section">
                                        <h3>Order summary</h3>
                                        <div className="items-list">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="item-detail-row">
                                                    <div className="item-img">
                                                        <img src={item.image} alt={item.name} />
                                                    </div>
                                                    <div className="item-meta">
                                                        <div className="item-name-row">
                                                            <h4>{item.name}</h4>
                                                            <span className="price-tag">{formatPrice(item.price * item.qty, order.currency)}</span>
                                                        </div>
                                                        <p className="item-specs">
                                                            {item.selectedSize && `Size: ${item.selectedSize}`}
                                                            {item.selectedColor && ` | Color: ${item.selectedColor}`}
                                                        </p>
                                                        <span className="item-qty">Qty: {item.qty}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="cost-breakdown">
                                            <div className="cost-row">
                                                <span>Subtotal</span>
                                                <span>{formatPrice(order.subtotal || order.total, order.currency)}</span>
                                            </div>
                                            <div className="cost-row">
                                                <span>Shipping</span>
                                                <span>{formatPrice(order.shippingPrice || 0, order.currency)}</span>
                                            </div>
                                            {order.discountAmount > 0 && (
                                                <div className="cost-row discount">
                                                    <span>Discount</span>
                                                    <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                                                </div>
                                            )}
                                            <div className="cost-row">
                                                <span>Taxes</span>
                                                <span>{formatPrice(0, order.currency)}</span>
                                            </div>
                                            <div className="cost-row total-row">
                                                <span>Total</span>
                                                <span className="total-val">{formatPrice(order.total, order.currency)} {order.currency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-cols">
                                        <div className="info-block">
                                            <h3>Customer information</h3>
                                            <div className="customer-info-grid">
                                                <div className="info-group">
                                                    <label>Shipping address</label>
                                                    <p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                                                    <p>{order.customerInfo.address}</p>
                                                    <p>{order.customerInfo.city}</p>
                                                    <p>{order.customerInfo.country}</p>
                                                </div>
                                                <div className="info-group">
                                                    <label>Billing address</label>
                                                    <p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                                                    <p>{order.customerInfo.address}</p>
                                                    <p>{order.customerInfo.city}</p>
                                                    <p>{order.customerInfo.country}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {order.customer_note && (
                                            <div className="info-block note-block">
                                                <h3>Order Notes</h3>
                                                <p className="note-text">{order.customer_note}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .orders-page {
                    min-height: 100vh;
                    background: #fdfaf7;
                    padding: 140px 5% 80px;
                    font-family: 'Quicksand', sans-serif;
                }
                .orders-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #666;
                    text-decoration: none;
                    font-weight: 500;
                    margin-bottom: 24px;
                    font-size: 0.9rem;
                }
                .orders-header h1 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2.5rem;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                    font-style: italic;
                }
                .orders-header p {
                    color: #666;
                    margin-bottom: 40px;
                }
                .order-card-detailed {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #ebebeb;
                    margin-bottom: 40px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                }
                .detail-header {
                    padding: 24px 32px;
                    background: #fafafb;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .header-main h2 {
                    font-size: 1.1rem;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                }
                .status-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .status-badge-detailed {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                .order-date {
                    font-size: 0.85rem;
                    color: #666;
                }
                .payment-status-pill {
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: #f0f0f0;
                }
                .payment-status-pill[data-paid='true'] {
                    background: #e6fcf5;
                    color: #0ca678;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    padding: 32px;
                    gap: 48px;
                }
                @media (max-width: 968px) {
                    .detail-grid { grid-template-columns: 1fr; }
                }

                .summary-section h3, .info-block h3 {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #666;
                    margin-bottom: 24px;
                }

                .item-detail-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .item-img img {
                    width: 70px;
                    height: 90px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .item-meta { flex: 1; }
                .item-name-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .item-name-row h4 { font-size: 1rem; color: #1a1a1a; }
                .price-tag { font-weight: 600; }
                .item-specs { font-size: 0.85rem; color: #666; margin-bottom: 4px; }
                .item-qty { font-size: 0.8rem; color: #999; }

                .cost-breakdown {
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #eee;
                }
                .cost-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    font-size: 0.95rem;
                    color: #666;
                }
                .total-row {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 2px solid #1a1a1a;
                    color: #1a1a1a;
                    font-weight: 700;
                }
                .cost-row.discount {
                    color: #0ca678;
                    font-weight: 600;
                }
                .total-val { font-size: 1.4rem; }

                .customer-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .info-group label {
                    display: block;
                    font-size: 0.75rem;
                    color: #999;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }
                .info-group p {
                    font-size: 0.9rem;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }
                .note-block {
                    margin-top: 32px;
                    padding: 20px;
                    background: #fdfaf7;
                    border-radius: 8px;
                }
                .note-text { font-size: 0.9rem; color: #1a1a1a; font-style: italic; }

                .orders-loading {
                    height: 60vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #eee;
                    border-top-color: #ff7f50;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
