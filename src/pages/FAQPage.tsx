import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_DATA: Record<string, FAQItem[]> = {
    "Orders & Payment": [
        {
            question: "How do I place an order?",
            answer: "Simply browse our collection, select your size and color, and 'Add to Inquiry'. Once finished, head to checkout or use the 'Direct Chat' button to finalize your order with our concierge via WhatsApp."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, bank transfers, and Apple/Google Pay through our secure payment gateway."
        }
    ],
    "Shipping & Delivery": [
        {
            question: "Do you ship worldwide?",
            answer: "Yes! We ship globally from our studio in Lagos via DHL Express. Shipping rates are calculated at checkout based on your destination."
        },
        {
            question: "How long will my order take?",
            answer: "Ready-to-wear pieces ship within 2-3 business days. Pre-orders and custom requests typically take 14-21 days as they are handcrafted to order."
        }
    ],
    "Returns & Exchanges": [
        {
            question: "What is your return policy?",
            answer: "We accept returns for exchange or store credit within 7 days of delivery. Items must be in their original condition with all tags attached."
        },
        {
            question: "Are custom orders returnable?",
            answer: "Due to the personalized nature of custom-made pieces, they are final sale and cannot be returned unless there is a manufacturing defect."
        }
    ],
    "Product Care": [
        {
            question: "How should I care for my TÉFA pieces?",
            answer: "Most of our pieces are dry-clean only. For linen and cotton blends, we recommend professional laundering to preserve the hand-dyed colors and structural integrity."
        }
    ]
};

export const FAQPage: React.FC = () => {
    const [openItem, setOpenItem] = useState<string | null>(null);

    return (
        <div className="support-page faq-page">
            <div className="container">
                <div className="support-header">
                    <h1>FAQs</h1>
                    <p>Find answers to common questions about the <span className="font-brand">TÉFA</span> experience.</p>
                </div>

                <div className="faq-container">
                    {Object.entries(FAQ_DATA).map(([category, items]) => (
                        <div key={category} className="faq-category">
                            <h2>{category}</h2>
                            <div className="faq-list">
                                {items.map((item, index) => {
                                    const id = `${category}-${index}`;
                                    const isOpen = openItem === id;

                                    return (
                                        <div
                                            key={index}
                                            className={`faq-item ${isOpen ? 'open' : ''}`}
                                            onClick={() => setOpenItem(isOpen ? null : id)}
                                        >
                                            <div className="faq-question">
                                                <span>{item.question}</span>
                                                {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                            </div>
                                            <div className="faq-answer">
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .support-page {
                    padding-top: 160px;
                    padding-bottom: var(--space-24);
                    background-color: var(--color-cream);
                }

                .support-header {
                    text-align: center;
                    margin-bottom: var(--space-16);
                }

                .faq-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .faq-category {
                    margin-bottom: var(--space-12);
                }

                .faq-category h2 {
                    font-size: 1.5rem;
                    margin-bottom: var(--space-6);
                    border-bottom: 2px solid var(--color-nude-light);
                    padding-bottom: var(--space-2);
                    color: var(--color-brown-dark);
                }

                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .faq-item {
                    background: white;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    cursor: pointer;
                    overflow: hidden;
                    transition: all var(--transition-base);
                }

                .faq-item:hover {
                    box-shadow: var(--shadow-md);
                }

                .faq-question {
                    padding: var(--space-5) var(--space-6);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                    color: var(--color-brown);
                }

                .faq-answer {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    padding: 0 var(--space-6);
                }

                .faq-item.open .faq-answer {
                    max-height: 200px;
                    padding-bottom: var(--space-6);
                }

                .faq-answer p {
                    font-size: 0.9375rem;
                    line-height: 1.7;
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
};
