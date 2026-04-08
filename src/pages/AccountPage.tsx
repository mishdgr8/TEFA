import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { User, Mail, Phone, Globe, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../data/store';
import { COUNTRIES } from '../data/countries';

export const AccountPage: React.FC = () => {
    const { user, updateProfile, authLoading } = useStore();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.metadata?.first_name || '',
                lastName: user.metadata?.last_name || '',
                email: user.email || '',
                phone: user.metadata?.phone || '',
                country: user.metadata?.country || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus(null);

        try {
            await updateProfile({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                country: formData.country
            });
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Update profile error:', error);
            setStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="account-page">
                <div className="account-loading">
                    <div className="loading-spinner" />
                    <p>Loading your account...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="account-page">
                <div className="account-page-error">
                    <p>Please sign in to view your account settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="account-page">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="account-container"
            >
                <div className="account-header">
                    <h1>Account Settings</h1>
                    <p>Manage your personal information and preferences.</p>
                </div>

                <form onSubmit={handleSubmit} className="account-form">
                    {status && (
                        <div className={`status-message ${status.type}`}>
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{status.message}</span>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label><User size={16} /> First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Enter your first name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><User size={16} /> Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Enter your last name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Mail size={16} /> Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="disabled-input"
                            />
                            <small>Email cannot be changed.</small>
                        </div>

                        <div className="form-group">
                            <label><Phone size={16} /> Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g. +234 800 000 0000"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label><Globe size={16} /> Country</label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                required
                            >
                                <option value="">Select your country</option>
                                {COUNTRIES.map(c => (
                                    <option key={c.code} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={isSaving}>
                            {isSaving ? 'Saving Changes...' : <><Save size={18} /> Save Settings</>}
                        </button>
                    </div>
                </form>
            </m.div>

            <style>{`
                .account-page {
                    min-height: 100vh;
                    padding: 140px 20px 60px;
                    background: var(--color-cream);
                    display: flex;
                    justify-content: center;
                }

                .account-container {
                    width: 100%;
                    max-width: 800px;
                    background: white;
                    padding: var(--space-10);
                    border-radius: var(--radius-2xl);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                }

                .account-header {
                    margin-bottom: var(--space-10);
                    text-align: center;
                }

                .account-header h1 {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: var(--color-brown-dark);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: var(--space-2);
                }

                .account-header p {
                    color: var(--color-text-muted);
                    font-family: 'Quicksand', sans-serif;
                }

                .account-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-8);
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-6);
                }

                @media (max-width: 640px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .form-group.full-width {
                    grid-column: span 2;
                }

                @media (max-width: 640px) {
                    .form-group.full-width {
                        grid-column: span 1;
                    }
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Quicksand', sans-serif;
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--color-brown);
                }

                .form-group input, .form-group select {
                    padding: 14px 18px;
                    border: 1px solid var(--color-nude-light);
                    border-radius: var(--radius-lg);
                    font-family: 'Quicksand', sans-serif;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: var(--color-brown);
                    box-shadow: 0 0 0 4px rgba(103, 71, 54, 0.1);
                }

                .disabled-input {
                    background: var(--color-cream);
                    color: var(--color-text-muted);
                    cursor: not-allowed;
                }

                .form-group small {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    font-style: italic;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: var(--space-4);
                }

                .save-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 16px 32px;
                    background: var(--color-brown-dark);
                    color: white;
                    border: none;
                    border-radius: var(--radius-lg);
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .save-btn:hover:not(:disabled) {
                    background: #111111;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                .save-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .status-message {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-radius: var(--radius-lg);
                    font-family: 'Quicksand', sans-serif;
                    font-weight: 600;
                }

                .status-message.success {
                    background: #F0FDF4;
                    color: #166534;
                    border: 1px solid #BBF7D0;
                }

                .status-message.error {
                    background: #FEF2F2;
                    color: #991B1B;
                    border: 1px solid #FECACA;
                }

                .account-page-error {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Quicksand', sans-serif;
                    color: var(--color-text-muted);
                    padding: 20px;
                }
            `}</style>
        </div>
    );
};
