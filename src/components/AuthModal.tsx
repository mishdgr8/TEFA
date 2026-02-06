import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { signUp, signIn } from '../lib/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signin') {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
            onSuccess();
            onClose();
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const errorCode = err.code;
            switch (errorCode) {
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/user-disabled':
                    setError('This account has been disabled');
                    break;
                case 'auth/user-not-found':
                    setError('No account found with this email');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/email-already-in-use':
                    setError('An account already exists with this email');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak');
                    break;
                default:
                    setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="auth-modal-overlay"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="auth-modal"
                    >
                        <button onClick={onClose} className="auth-modal-close">
                            <X size={20} />
                        </button>

                        <div className="auth-modal-header">
                            <h2>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
                            <p>
                                {mode === 'signin'
                                    ? 'Sign in to manage your inquiries'
                                    : 'Join TÉFA to save your favorites'}
                            </p>
                        </div>

                        {error && (
                            <div className="auth-error">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="auth-field">
                                <label>
                                    <Mail size={18} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div className="auth-field">
                                <label>
                                    <Lock size={18} />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {mode === 'signup' && (
                                <div className="auth-field">
                                    <label>
                                        <Lock size={18} />
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            )}

                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                                    </>
                                ) : (
                                    <>
                                        <User size={18} />
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-toggle">
                            <span>
                                {mode === 'signin'
                                    ? "Don't have an account?"
                                    : 'Already have an account?'}
                            </span>
                            <button onClick={toggleMode}>
                                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>
                    </motion.div>

                    <style>{`
            .auth-modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(4px);
              z-index: 100;
            }

            .auth-modal {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 90%;
              max-width: 420px;
              background: white;
              border-radius: var(--radius-xl);
              padding: var(--space-8);
              z-index: 101;
              box-shadow: var(--shadow-xl);
            }

            .auth-modal-close {
              position: absolute;
              top: var(--space-4);
              right: var(--space-4);
              background: none;
              border: none;
              color: var(--color-text-muted);
              cursor: pointer;
              padding: var(--space-2);
            }

            .auth-modal-close:hover {
              color: var(--color-brown);
            }

            .auth-modal-header {
              text-align: center;
              margin-bottom: var(--space-6);
            }

            .auth-modal-header h2 {
              font-family: 'Cormorant Garamond', serif;
              font-size: 1.75rem;
              font-weight: 700;
              font-style: italic;
              color: var(--color-brown-dark);
              margin-bottom: var(--space-2);
            }

            .auth-modal-header p {
              color: var(--color-text-muted);
              font-size: 0.9375rem;
            }

            .auth-error {
              display: flex;
              align-items: center;
              gap: var(--space-2);
              padding: var(--space-3) var(--space-4);
              background: #FEE2E2;
              color: #DC2626;
              border-radius: var(--radius-md);
              margin-bottom: var(--space-4);
              font-size: 0.875rem;
            }

            .auth-form {
              display: flex;
              flex-direction: column;
              gap: var(--space-4);
            }

            .auth-field label {
              display: flex;
              align-items: center;
              gap: var(--space-2);
              font-size: 0.8125rem;
              font-weight: 600;
              color: var(--color-brown);
              margin-bottom: var(--space-2);
            }

            .auth-field input {
              width: 100%;
              padding: var(--space-3) var(--space-4);
              border: 1px solid var(--color-nude);
              border-radius: var(--radius-md);
              font-family: 'Quicksand', sans-serif;
              font-size: 1rem;
              transition: border-color var(--transition-fast);
            }

            .auth-field input:focus {
              outline: none;
              border-color: var(--color-coral);
            }

            .auth-submit {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: var(--space-2);
              width: 100%;
              padding: var(--space-4);
              background: var(--color-coral);
              color: white;
              border: none;
              border-radius: var(--radius-md);
              font-family: 'Quicksand', sans-serif;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: background var(--transition-fast);
              margin-top: var(--space-2);
            }

            .auth-submit:hover:not(:disabled) {
              background: var(--color-coral-dark);
            }

            .auth-submit:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }

            .spin {
              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            .auth-toggle {
              text-align: center;
              margin-top: var(--space-6);
              padding-top: var(--space-6);
              border-top: 1px solid var(--color-nude-light);
            }

            .auth-toggle span {
              color: var(--color-text-muted);
              font-size: 0.875rem;
            }

            .auth-toggle button {
              background: none;
              border: none;
              color: var(--color-coral);
              font-weight: 600;
              cursor: pointer;
              margin-left: var(--space-1);
            }

            .auth-toggle button:hover {
              text-decoration: underline;
            }
          `}</style>
                </>
            )}
        </AnimatePresence>
    );
};
