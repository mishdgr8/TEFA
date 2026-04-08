import React from 'react';
import { X, Printer, Package, Truck, Phone, Mail, MapPin, Calendar, Clock, CreditCard } from 'lucide-react';
import { Order } from '../../types';
import { formatPrice } from '../../data/store';
import { OptimizedImage } from '../../components/OptimizedImage';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const getStatusText = (status: Order['orderStatus']) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="order-modal-overlay" onClick={onClose} data-lenis-prevent="true">
            <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-left">
                        <h2>Order Details</h2>
                        <span className="order-id-large">#{order.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="header-actions">
                        <button onClick={handlePrint} className="print-btn" title="Print Invoice">
                            <Printer size={18} />
                            Print
                        </button>
                        <button onClick={onClose} className="close-btn">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="modal-body printable-area">
                    <div className="order-status-banner" data-status={order.orderStatus}>
                        {order.orderStatus === 'new' && <Clock size={16} />}
                        {order.orderStatus === 'processing' && <Package size={16} />}
                        {order.orderStatus === 'shipped' && <Truck size={16} />}
                        <span>Status: {getStatusText(order.orderStatus)}</span>
                        <div className="payment-pill" data-paid={order.paymentStatus === 'success'}>
                            {order.paymentStatus === 'success' ? 'Paid' : 'Unpaid'}
                        </div>
                    </div>

                    <div className="details-grid">
                        <div className="details-section">
                            <h3><Package size={16} /> Order Items</h3>
                            <div className="items-list">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="order-item-card">
                                        <div className="item-image">
                                            <OptimizedImage src={item.image} alt={item.name} />
                                        </div>
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <p className="item-meta">
                                                Size: {item.selectedSize} | Qty: {item.qty}
                                            </p>
                                            <p className="item-price">{formatPrice(item.price * item.qty, order.currency)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-financials">
                                <div className="financial-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal || order.total - (order.shippingPrice || 0), order.currency)}</span>
                                </div>
                                <div className="financial-row">
                                    <span>Shipping ({order.customerInfo.shippingMethod || 'Standard'})</span>
                                    <span>{formatPrice(order.shippingPrice || 0, order.currency)}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="financial-row discount">
                                        <span>Discount</span>
                                        <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                                    </div>
                                )}
                                <div className="financial-row grand-total">
                                    <span>Total Paid</span>
                                    <span>{formatPrice(order.total, order.currency)} {order.currency}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-sidebar">
                            <div className="info-card">
                                <h3><MapPin size={16} /> Shipping Info</h3>
                                <div className="info-content">
                                    <p className="name-large">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                                    <p>{order.customerInfo.address}</p>
                                    <p>{order.customerInfo.city}, {order.customerInfo.postalCode}</p>
                                    <p>{order.customerInfo.country}</p>

                                    <div className="shipping-method-callout">
                                        <label>Delivery Method:</label>
                                        <span>{order.customerInfo.shippingMethod || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card">
                                <h3><Phone size={16} /> Contact Details</h3>
                                <div className="info-content">
                                    <div className="contact-row">
                                        <Mail size={14} />
                                        <span>{order.customerInfo.email}</span>
                                    </div>
                                    <div className="contact-row">
                                        <Phone size={14} />
                                        <span>{order.customerInfo.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card">
                                <h3><CreditCard size={16} /> Transaction</h3>
                                <div className="info-content">
                                    <p><span>Reference:</span> {order.paymentReference}</p>
                                    <p><span>Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {order.customerInfo.note && (
                                <div className="info-card note-card">
                                    <h3>Delivery Note</h3>
                                    <div className="info-content">
                                        <p className="delivery-note-text">"{order.customerInfo.note}"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .order-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    z-index: 1000;
                    padding: 16px 20px;
                    overflow-y: auto;
                }
                .order-modal-content {
                    background: white;
                    width: 100%;
                    max-width: 900px;
                    border-radius: 16px;
                    overflow: visible;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    position: relative;
                    margin: auto 0;
                }
                .modal-header {
                    padding: 10px 32px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fdfaf7;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-top-left-radius: 16px;
                    border-top-right-radius: 16px;
                }
                .modal-header h2 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.8rem;
                    color: #1a1a1a;
                    margin: 0;
                }
                .order-id-large {
                    font-size: 0.9rem;
                    color: #999;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                }
                .header-actions {
                    display: flex;
                    gap: 12px;
                }
                .print-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .print-btn:hover { background: #333; transform: translateY(-1px); }
                .close-btn {
                    padding: 8px;
                    color: #666;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .modal-body {
                    padding: 12px 32px 32px 32px;
                    flex: 1;
                }
                .order-status-banner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: #f0f0f0;
                    border-radius: 10px;
                    margin-bottom: 32px;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .order-status-banner[data-status='new'] { background: #e7f5ff; color: #1971c2; }
                .order-status-banner[data-status='processing'] { background: #fff4e6; color: #d9480f; }
                .order-status-banner[data-status='shipped'] { background: #f3f0ff; color: #6741d9; }
                .order-status-banner[data-status='delivered'] { background: #ebfbee; color: #2b8a3e; }

                .payment-pill {
                    margin-left: auto;
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .payment-pill[data-paid='true'] { background: #0ca678; color: white; }
                .payment-pill[data-paid='false'] { background: #f03e3e; color: white; }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    gap: 40px;
                }
                @media (max-width: 768px) {
                    .details-grid { grid-template-columns: 1fr; }
                }

                .details-section h3, .info-card h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #999;
                    margin-bottom: 20px;
                }

                .order-item-card {
                    display: flex;
                    gap: 16px;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                .item-image img {
                    width: 70px;
                    height: 90px;
                    object-fit: cover;
                    border-radius: 8px;
                }
                .item-info h4 { font-size: 1rem; color: #1a1a1a; margin-bottom: 4px; }
                .item-meta { font-size: 0.85rem; color: #666; margin-bottom: 8px; }
                .item-price { font-weight: 700; color: #1a1a1a; }

                .order-financials {
                    background: #fafafb;
                    padding: 16px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #eee;
                }
                .financial-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    font-size: 0.95rem;
                    color: #666;
                }
                .financial-row.discount { color: #0ca678; }
                .grand-total {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 2px solid #1a1a1a;
                    color: #1a1a1a;
                    font-weight: 800;
                    font-size: 1.2rem;
                }

                .info-card {
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }
                .name-large { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
                .info-content p { font-size: 0.9rem; color: #666; margin-bottom: 4px; }
                
                .shipping-method-callout {
                    margin-top: 16px;
                    padding: 10px;
                    background: #fdfaf7;
                    border-left: 3px solid #ff7f50;
                    border-radius: 4px;
                }
                .shipping-method-callout label {
                    display: block;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    color: #ff7f50;
                    font-weight: 700;
                }
                .shipping-method-callout span { font-weight: 700; color: #1a1a1a; }

                .contact-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.9rem;
                    color: #1a1a1a;
                    margin-bottom: 12px;
                }
                .contact-row svg { color: #999; }

                .delivery-note-text {
                    font-style: italic;
                    color: #1a1a1a;
                    line-height: 1.6;
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 8px;
                }

                @media print {
                    html, body, #root, .app-wrapper {
                        height: auto !important;
                        min-height: auto !important;
                        overflow: visible !important;
                        overflow-x: visible !important;
                        overflow-y: visible !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    body * {
                        visibility: hidden !important;
                    }

                    .order-modal-overlay,
                    .order-modal-overlay * {
                        visibility: visible !important;
                    }

                    .order-modal-overlay {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        backdrop-filter: none !important;
                        display: block !important;
                        overflow: visible !important;
                    }

                    .order-modal-content {
                        position: relative !important;
                        width: 100% !important;
                        max-width: none !important;
                        max-height: none !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        display: block !important;
                        overflow: visible !important;
                    }

                    .modal-header {
                        border-bottom: 2px solid #000 !important;
                        background: white !important;
                        padding: 20px 0 !important;
                    }

                    .modal-header .header-actions, .close-btn { 
                        display: none !important; 
                    }

                    .modal-body {
                        padding: 20px 0 !important;
                        overflow: visible !important;
                    }

                    .order-status-banner {
                        border: 1px solid #ddd !important;
                        background: #f8f9fa !important;
                    }

                    .order-financials, .info-card {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};
