import React, { useState } from 'react';
import { useStore, formatPrice } from '../data/store';
import { usePaystackPayment } from 'react-paystack';
import { CheckCircle, Loader2, CreditCard, ShieldCheck } from 'lucide-react';

import { CartItem, CustomerInfo } from '../types';

interface PaymentWrapperProps {
    email: string;
    customerName: string;
    total: number;
    cart: CartItem[];
    customerInfo: CustomerInfo;
    onSuccess: (reference: string) => void;
    onClose: () => void;
    userId?: string;
}

/**
 * Universal Payment Component using Paystack
 * Handles both NGN and USD based on the store's currency state.
 */
export const PaymentWrapper: React.FC<PaymentWrapperProps> = ({
    email,
    customerName,
    total,
    cart,
    customerInfo,
    onSuccess,
    onClose,
    userId
}) => {
    const { currency } = useStore();
    const [isInitializing, setIsInitializing] = useState(false);

    // Paystack Configuration
    const config = {
        reference: `TEFA-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`,
        email: email,
        amount: Math.round(total * 100), // Subunits (Kobo for NGN / Cents for USD)
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        currency: currency.toUpperCase(),
        metadata: {
            user_id: userId,
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: customerName
                },
                {
                    display_name: "Phone",
                    variable_name: "phone",
                    value: customerInfo.phone
                },
                {
                    display_name: "Order Items",
                    variable_name: "items_purchased",
                    value: cart.map(i => `${i.qty}x ${i.name} (${i.selectedSize})`).join(', ')
                },
                {
                    display_name: "Delivery Address",
                    variable_name: "delivery_address",
                    value: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country}`
                },
                {
                    display_name: "Delivery Notes",
                    variable_name: "delivery_notes",
                    value: customerInfo.note || 'None provided'
                }
            ],
            cart_items: cart.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                qty: item.qty,
                price: item.price,
                priceUSD: item.priceUSD || (item.price / 1500),
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor || null,
                image: item.image || null
            })),
            customer_info: customerInfo,
            order_currency: currency
        }
    };

    const initializePaystack = usePaystackPayment(config);

    const handlePayment = () => {
        setIsInitializing(true);

        try {
            initializePaystack({
                onSuccess: (response: any) => {
                    setIsInitializing(false);
                    // Pass the reference back to the parent component
                    if (response.status === 'success' || response.message === 'Approved') {
                        onSuccess(response.reference);
                    }
                },
                onClose: () => {
                    setIsInitializing(false);
                    onClose();
                }
            });
        } catch (error) {
            console.error('Payment Error:', error);
            setIsInitializing(false);
        }
    };

    return (
        <div className="tefa-payment-container">
            <div className="tefa-payment-layout">
                <button
                    className="tefa-pay-btn"
                    onClick={handlePayment}
                    disabled={isInitializing}
                >
                    {isInitializing ? (
                        <><Loader2 className="animate-spin" size={20} /> Processing Payment...</>
                    ) : (
                        <>Secure Order • {formatPrice({ amount: total }, currency)}</>
                    )}
                </button>
                <div className="tefa-payment-footer">
                    <ShieldCheck size={14} />
                    <span>Payment secured by Paystack</span>
                </div>
            </div>

            <style>{`
                .tefa-payment-container {
                    width: 100%;
                }
                .tefa-payment-layout {
                    width: 100%;
                    margin-top: 12px;
                }
                .tefa-pay-btn {
                    width: 100%;
                    padding: 22px;
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-family: 'Quicksand', sans-serif;
                    font-weight: 700;
                    font-size: 1.1rem;
                    letter-spacing: 0.02em;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .tefa-pay-btn:hover:not(:disabled) {
                    background: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }
                .tefa-pay-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .tefa-pay-btn:disabled {
                    opacity: 0.7;
                    background: #666;
                    cursor: not-allowed;
                }
                .tefa-payment-footer {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 20px;
                    color: #999;
                    font-size: 0.75rem;
                    font-family: 'Quicksand', sans-serif;
                    letter-spacing: 0.01em;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
