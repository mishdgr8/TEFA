import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { signUp, signIn, signInWithGoogle } from '../lib/auth';

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

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            onSuccess();
            onClose();
        } catch (err: any) {
            const errorCode = err.code;
            if (errorCode === 'auth/popup-closed-by-user') {
                setError('Sign in cancelled');
            } else if (errorCode === 'auth/popup-blocked') {
                setError('Popup was blocked. Please allow popups for this site.');
            } else {
                setError('Failed to sign in with Google. Please try again.');
            }
        } finally {
            setLoading(false);
        }
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

                        {/* Divider */}
                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            className="auth-google-btn"
                            disabled={loading}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

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
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .auth-modal {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              margin: auto;
              width: 90%;
              max-width: 420px;
              height: fit-content;
              max-height: 90vh;
              overflow-y: auto;
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
              margin-top: var(--space-4);
              padding-top: var(--space-4);
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

            .auth-divider {
              display: flex;
              align-items: center;
              text-align: center;
              margin: var(--space-5) 0;
            }

            .auth-divider::before,
            .auth-divider::after {
              content: '';
              flex: 1;
              border-bottom: 1px solid var(--color-nude);
            }

            .auth-divider span {
              padding: 0 var(--space-4);
              color: var(--color-text-muted);
              font-size: 0.8125rem;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }

            .auth-google-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: var(--space-3);
              width: 100%;
              padding: var(--space-4);
              background: white;
              color: #333;
              border: 1px solid var(--color-nude);
              border-radius: var(--radius-md);
              font-family: 'Quicksand', sans-serif;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all var(--transition-fast);
            }

            .auth-google-btn:hover:not(:disabled) {
              background: #f8f8f8;
              border-color: #ccc;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .auth-google-btn:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
          `}</style>
                </>
            )}
        </AnimatePresence>
    );
};
