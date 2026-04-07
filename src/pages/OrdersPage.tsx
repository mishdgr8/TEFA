import React, { useState, useEffect } from 'react';
import { useStore, formatPrice } from '../data/store';
import { getUserOrders } from '../lib/supabaseDb';
import { Order } from '../types';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';

export const OrdersPage: React.FC = () => {
    const { user, currency } = useStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
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
                                className="order-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="order-main">
                                    <div className="order-meta">
                                        <div className="order-id">
                                            <span>Order ID:</span>
                                            <strong>#{order.id.slice(0, 8)}</strong>
                                        </div>
                                        <div className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <img src={item.image} alt={item.name} />
                                                <div className="item-info">
                                                    <h4>{item.name}</h4>
                                                    <p>Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                                                    <span className="item-price">
                                                        {item.qty} x {formatPrice(item.price, order.currency)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="status-badge" data-status={order.orderStatus}>
                                        {getStatusIcon(order.orderStatus)}
                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </div>
                                    <div className="order-total">
                                        <span>Total Amount</span>
                                        <strong>{formatPrice(order.total, order.currency)}</strong>
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
                    padding: 80px 20px;
                    font-family: 'Quicksand', sans-serif;
                }
                .orders-container {
                    max-width: 900px;
                    margin: 0 auto;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-brown);
                    text-decoration: none;
                    font-weight: 600;
                    margin-bottom: 24px;
                    transition: transform 0.2s;
                }
                .back-link:hover {
                    transform: translateX(-4px);
                }
                .orders-header h1 {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 2rem;
                    color: var(--color-brown-dark);
                    margin-bottom: 8px;
                }
                .orders-header p {
                    color: var(--color-text-muted);
                    margin-bottom: 40px;
                }
                .no-orders {
                    text-align: center;
                    padding: 60px 0;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }
                .no-orders h2 {
                    margin: 16px 0;
                }
                .shop-now-btn {
                    display: inline-block;
                    margin-top: 24px;
                    padding: 14px 32px;
                    background: var(--color-coral);
                    color: white;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                }
                .order-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    display: grid;
                    grid-template-columns: 1fr 240px;
                }
                @media (max-width: 768px) {
                    .order-card {
                        grid-template-columns: 1fr;
                    }
                }
                .order-main {
                    padding: 24px;
                }
                .order-meta {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 16px;
                    margin-bottom: 16px;
                }
                .order-id span {
                    color: #999;
                    margin-right: 8px;
                }
                .order-date {
                    color: #999;
                    font-size: 0.9rem;
                }
                .order-item-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .order-item-row img {
                    width: 60px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 8px;
                }
                .item-info h4 {
                    margin: 0 0 4px 0;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.95rem;
                }
                .item-info p {
                    font-size: 0.85rem;
                    color: #999;
                    margin-bottom: 4px;
                }
                .item-price {
                    font-weight: 600;
                    color: var(--color-brown);
                }
                .order-summary {
                    background: #fdfaf7;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    border-left: 1px solid #eee;
                }
                @media (max-width: 768px) {
                    .order-summary {
                        border-left: none;
                        border-top: 1px solid #eee;
                    }
                }
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    width: fit-content;
                }
                .status-badge[data-status='new'] { background: #E0F2FE; color: #0369A1; }
                .status-badge[data-status='processing'] { background: #FEF3C7; color: #B45309; }
                .status-badge[data-status='shipped'] { background: #F3E8FF; color: #7E22CE; }
                .status-badge[data-status='delivered'] { background: #DCFCE7; color: #15803D; }
                .status-badge[data-status='cancelled'] { background: #FEE2E2; color: #B91C1C; }
                
                .order-total span {
                    display: block;
                    font-size: 0.85rem;
                    color: #999;
                    margin-bottom: 4px;
                }
                .order-total strong {
                    font-size: 1.25rem;
                    color: var(--color-brown-dark);
                }
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
                    border-top-color: var(--color-coral);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
