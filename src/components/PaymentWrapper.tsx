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
    onClose
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
                }
            ],
            cart_items: cart.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                qty: item.qty,
                price: item.price,
                priceUSD: item.priceUSD || (item.price / 1500),
                selectedSize: item.selectedSize
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
        <div className="payment-container">
            <button
                className={`pay-btn ${currency === 'USD' ? 'usd' : 'ngn'}`}
                onClick={handlePayment}
                disabled={isInitializing}
            >
                {isInitializing ? (
                    <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...</>
                ) : (
                    <><CreditCard className="mr-2 h-4 w-4" /> {`Pay ${formatPrice({ amount: total }, currency)} Now`}</>
                )}
            </button>
            <div className="secure-badge mt-4 flex items-center justify-center gap-2 opacity-60 text-xs">
                <ShieldCheck className="h-3 w-3" />
                <span>Secured by Paystack</span>
            </div>

            <style>{`
                .payment-container {
                    width: 100%;
                    text-align: center;
                }
                .pay-btn {
                    width: 100%;
                    padding: 1rem;
                    border-radius: var(--radius-xl);
                    font-weight: 700;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    border: none;
                    cursor: pointer;
                    font-family: 'Quicksand', sans-serif;
                }
                .pay-btn.ngn {
                    background: #09a5db; /* Paystack Blue */
                    color: white;
                }
                .pay-btn.usd {
                    background: var(--color-brown-dark); /* Brand Brown */
                    color: white;
                }
                .pay-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
                .pay-btn:disabled {
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
            `}</style>
        </div>
    );
};
