import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { signUp, signIn, signInWithGoogle } from '../lib/supabaseAuth';
import { SearchableDropdown } from './SearchableDropdown';
import { OptimizedImage } from './OptimizedImage';
import { COUNTRIES } from '../data/countries';

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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Extra fields for signup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

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
        await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          country: country
        });
        setSuccess('Account created! Sign in to continue.');
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setLoading(false);
        return;
      }
      onSuccess();
      onClose();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid email')) {
        setError(mode === 'signin' ? 'Invalid email or password' : 'Invalid email address');
      } else if (msg.includes('email not confirmed')) {
        setError('Please confirm your email before signing in');
      } else if (msg.includes('user already registered') || msg.includes('already been registered')) {
        setError('An account already exists with this email');
      } else if (msg.includes('password') && msg.includes('weak')) {
        setError('Password is too weak');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setSuccess('');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('popup') || msg.includes('cancelled')) {
        setError('Sign in cancelled');
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
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="auth-modal-overlay"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-split">
              {/* Left Side: Branding / Image */}
              <div className="auth-modal-brand">
                <img
                  src="/assets/branding/tefa-branding.webp"
                  alt="Branding"
                  className="brand-bg"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Right Side: Form */}
              <div className="auth-modal-form-side">
                <button onClick={onClose} className="auth-modal-close">
                  <X size={20} />
                </button>

                <div className="auth-modal-header">
                  <h2>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
                  <p>
                    {mode === 'signin'
                      ? 'Sign in to access your curated dashboard'
                      : <>Join <span className="font-brand">TÉFA</span> to elevate your collection</>}
                  </p>
                </div>

                {error && (
                  <div className="auth-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="auth-success">
                    <AlertCircle size={16} className="rotate-180" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" data-lenis-prevent>
                  <div className="form-scroll-area">
                    {mode === 'signup' && (
                      <div className="auth-row">
                        <div className="auth-field">
                          <label>First Name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Jane"
                            required
                          />
                        </div>
                        <div className="auth-field">
                          <label>Last Name</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="auth-field">
                      <label>
                        <Mail size={16} strokeWidth={1.5} />
                        Email Address
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
                        <Lock size={16} strokeWidth={1.5} />
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
                      <>
                        <div className="auth-field">
                          <label>
                            <Lock size={16} strokeWidth={1.5} />
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

                        <div className="auth-field">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+234..."
                            required
                          />
                        </div>
                        <div className="auth-field">
                          <label>Country</label>
                          <SearchableDropdown
                            options={COUNTRIES.map(c => ({
                              label: `${c.flag} ${c.name}`,
                              value: c.name,
                              icon: c.flag,
                              searchStr: c.name
                            }))}
                            value={country}
                            onChange={(val) => setCountry(val)}
                            placeholder="Select Country"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        {mode === 'signin' ? 'Opening Vault...' : 'Creating Masterpiece...'}
                      </>
                    ) : (
                      <>
                        <User size={18} strokeWidth={1.5} />
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-footer-actions">
                  <div className="auth-divider">
                    <span>or</span>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    className="auth-google-btn"
                    disabled={loading}
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
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
                        ? "New to TÉFA?"
                        : 'Already have an account?'}
                    </span>
                    <button onClick={toggleMode}>
                      {mode === 'signin' ? 'Create Account' : 'Sign In'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          <style>{`
            .auth-modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(12px);
              z-index: 99999;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              width: 100vw;
              height: 100vh;
            }

            .auth-modal {
              position: relative;
              width: 100%;
              max-width: 900px;
              height: auto;
              max-height: 90vh;
              background: #FFFFFF;
              border-radius: 32px;
              overflow: hidden;
              z-index: 100000;
              box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.4);
              display: flex;
            }

            .auth-modal-split {
              display: flex;
              width: 100%;
              min-height: 600px;
            }

            .auth-modal-brand {
              flex: 1;
              position: relative;
              overflow: hidden;
              display: flex;
              align-items: flex-end;
              padding: 60px;
              color: white;
            }

            .brand-bg {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 10s ease;
            }

            .auth-modal-brand:hover .brand-bg {
              transform: scale(1.1);
            }

            .brand-content {
              position: relative;
              z-index: 2;
              max-width: 320px;
            }

            .brand-logo-small {
              font-family: 'Montserrat', sans-serif;
              font-weight: 700;
              letter-spacing: 0.2em;
              font-size: 0.75rem;
              margin-bottom: 24px;
              color: rgba(255,255,255,0.6);
            }

            .brand-content h3 {
              font-family: 'Cormorant Garamond', serif;
              font-size: 2.5rem;
              font-weight: 700;
              font-style: italic;
              line-height: 1;
              margin-bottom: 24px;
            }

            .brand-perks {
              opacity: 0.9;
            }

            .brand-perks p {
              font-size: 0.95rem;
              margin-bottom: 20px;
              color: rgba(255,255,255,0.8);
            }

            .brand-perks ul {
              list-style: none;
              padding: 0;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .brand-perks li {
              font-size: 0.85rem;
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .brand-perks li::before {
              content: '';
              width: 6px;
              height: 6px;
              background: #c69b7b;
              border-radius: 50%;
            }

            .auth-modal-form-side {
              flex: 1.1;
              background: white;
              padding: 60px;
              position: relative;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }

            @media (max-width: 850px) {
              .auth-modal-brand { display: none; }
              .auth-modal { max-width: 480px; }
              .auth-modal-form-side { padding: 40px; }
            }

            @media (max-width: 480px) {
              .auth-modal {
                max-height: 100vh;
                height: 100%;
                border-radius: 0;
              }
              .auth-modal-overlay { padding: 0; }
            }

            .auth-modal-close {
              position: absolute;
              top: 30px;
              right: 30px;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #F8F8F8;
              border: none;
              border-radius: 50%;
              color: #999;
              cursor: pointer;
              transition: all 0.2s;
              z-index: 10;
            }

            .auth-modal-close:hover {
              background: #EEE;
              color: #000;
              transform: rotate(90deg);
            }

            .auth-modal-header {
              margin-bottom: 32px;
            }

            .auth-modal-header h2 {
              font-family: 'Cormorant Garamond', serif;
              font-size: 2.25rem;
              font-weight: 700;
              font-style: italic;
              color: #1a1a1a;
              margin-bottom: 8px;
            }

            .auth-modal-header p {
              color: #888;
              font-size: 0.95rem;
            }

            .auth-error, .auth-success {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              border-radius: 12px;
              margin-bottom: 24px;
              font-size: 0.85rem;
              font-weight: 600;
            }

            .auth-error { background: #FFF5F5; color: #E53E3E; }
            .auth-success { background: #F0FFF4; color: #38A169; }

            .auth-form {
              flex: 1;
              display: flex;
              flex-direction: column;
              min-height: 0;
            }

            .form-scroll-area {
              flex: 1;
              overflow-y: auto;
              margin-bottom: 24px;
              padding-right: 8px;
              scrollbar-width: thin;
              scrollbar-color: #EEE transparent;
            }

            .form-scroll-area::-webkit-scrollbar { width: 4px; }
            .form-scroll-area::-webkit-scrollbar-thumb { background: #EEE; border-radius: 10px; }

            .auth-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 20px;
            }

            .auth-field {
              margin-bottom: 20px;
            }

            .auth-field label {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 0.75rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #aaa;
              margin-bottom: 8px;
            }

            .auth-field input {
              width: 100%;
              padding: 14px 18px;
              background: #FDFDFD;
              border: 1px solid #EEE;
              border-radius: 12px;
              font-family: 'Quicksand', sans-serif;
              font-size: 0.95rem;
              color: #1a1a1a;
              transition: all 0.2s;
            }

            .auth-field input:focus {
              outline: none;
              background: white;
              border-color: #c69b7b;
              box-shadow: 0 0 0 4px rgba(198, 155, 123, 0.1);
            }

            .auth-submit {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              width: 100%;
              padding: 18px;
              background: #1a1a1a;
              color: white;
              border: none;
              border-radius: 16px;
              font-family: 'Quicksand', sans-serif;
              font-size: 1rem;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
            }

            .auth-submit:hover:not(:disabled) {
              background: #000;
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }

            .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

            .auth-divider {
              display: flex;
              align-items: center;
              margin: 24px 0;
            }

            .auth-divider::before, .auth-divider::after {
              content: '';
              flex: 1;
              height: 1px;
              background: #EEE;
            }

            .auth-divider span {
              padding: 0 16px;
              color: #ccc;
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }

            .auth-google-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              width: 100%;
              padding: 14px;
              background: white;
              border: 1px solid #EEE;
              border-radius: 16px;
              font-family: 'Quicksand', sans-serif;
              font-size: 0.95rem;
              font-weight: 600;
              color: #1a1a1a;
              cursor: pointer;
              transition: all 0.2s;
            }

            .auth-google-btn:hover:not(:disabled) {
              background: #FAFAFA;
              border-color: #DDD;
            }

            .auth-toggle {
              text-align: center;
              margin-top: 24px;
              font-size: 0.9rem;
            }

            .auth-toggle span { color: #888; }
            .auth-toggle button {
              background: none;
              border: none;
              color: #c69b7b;
              font-weight: 700;
              cursor: pointer;
              margin-left: 6px;
              transition: color 0.2s;
            }
            .auth-toggle button:hover { color: #b08968; text-decoration: underline; }

            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </m.div>
      )}
    </AnimatePresence>
  );
};
