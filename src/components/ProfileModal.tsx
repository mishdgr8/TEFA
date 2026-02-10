import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, History, Heart, LogOut, ChevronRight } from 'lucide-react';
import { useStore } from '../data/store';
import { signOut } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export const ProfileModal: React.FC = () => {
    const { isProfileModalOpen, setIsProfileModalOpen, user } = useStore();
    const navigate = useNavigate();

    const handleClose = () => setIsProfileModalOpen(false);

    const handleNavigate = (path: string) => {
        navigate(path);
        handleClose();
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            handleClose();
            navigate('/');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isProfileModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="profile-modal-overlay"
                >
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="profile-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="profile-modal-header">
                            <button onClick={handleClose} className="profile-modal-close">
                                <X size={24} />
                            </button>
                            <h2>My Profile</h2>
                        </div>

                        <div className="profile-user-card">
                            <div className="profile-avatar">
                                <User size={32} />
                            </div>
                            <div className="profile-info">
                                <h3>{user.email?.split('@')[0]}</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <div className="profile-nav">
                            <button className="profile-nav-item" onClick={() => handleNavigate('/account')}>
                                <div className="nav-icon"><Settings size={20} /></div>
                                <span>Account Settings</span>
                                <ChevronRight size={18} className="nav-arrow" />
                            </button>
                            <button className="profile-nav-item" onClick={() => handleNavigate('/orders')}>
                                <div className="nav-icon"><History size={20} /></div>
                                <span>Purchase History</span>
                                <ChevronRight size={18} className="nav-arrow" />
                            </button>
                            <button className="profile-nav-item" onClick={() => handleNavigate('/wishlist')}>
                                <div className="nav-icon"><Heart size={20} /></div>
                                <span>Wishlist</span>
                                <ChevronRight size={18} className="nav-arrow" />
                            </button>

                            <div className="profile-nav-divider" />

                            <button className="profile-nav-item sign-out" onClick={handleSignOut}>
                                <div className="nav-icon"><LogOut size={20} /></div>
                                <span>Sign Out</span>
                            </button>
                        </div>

                        <div className="profile-modal-footer">
                            <p>© {new Date().getFullYear()} TÉFA. All rights reserved.</p>
                        </div>
                    </motion.div>

                    <style>{`
            .profile-modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.4);
              backdrop-filter: blur(15px);
              z-index: 99999;
              display: flex;
              justify-content: flex-end;
            }

            .profile-modal {
              width: 100%;
              max-width: 400px;
              height: 100vh;
              background: #FFFFFF;
              padding: var(--space-8);
              display: flex;
              flex-direction: column;
              box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
            }

            @media (max-width: 480px) {
              .profile-modal {
                max-width: 100%;
              }
            }

            .profile-modal-header {
              display: flex;
              align-items: center;
              gap: var(--space-4);
              margin-bottom: var(--space-10);
            }

            .profile-modal-close {
              background: none;
              border: none;
              color: var(--color-brown-dark);
              cursor: pointer;
              padding: 0;
              display: flex;
              align-items: center;
              transition: transform 0.2s;
            }

            .profile-modal-close:hover {
              transform: scale(1.1);
            }

            .profile-modal-header h2 {
              font-family: 'Montserrat', sans-serif;
              font-size: 1.25rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: var(--color-brown-dark);
            }

            .profile-user-card {
              display: flex;
              align-items: center;
              gap: var(--space-4);
              padding: var(--space-6);
              background: var(--color-cream-dark);
              border-radius: var(--radius-xl);
              margin-bottom: var(--space-8);
            }

            .profile-avatar {
              width: 64px;
              height: 64px;
              background: var(--color-coral);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .profile-info h3 {
              font-family: 'Cormorant Garamond', serif;
              font-size: 1.5rem;
              font-weight: 700;
              font-style: italic;
              color: var(--color-brown-dark);
              margin-bottom: 2px;
              text-transform: capitalize;
            }

            .profile-info p {
              color: var(--color-text-muted);
              font-size: 0.875rem;
            }

            .profile-nav {
              display: flex;
              flex-direction: column;
              gap: var(--space-2);
            }

            .profile-nav-item {
              display: flex;
              align-items: center;
              gap: var(--space-4);
              width: 100%;
              padding: var(--space-4);
              background: none;
              border: none;
              border-radius: var(--radius-lg);
              cursor: pointer;
              transition: all 0.2s;
              text-align: left;
            }

            .profile-nav-item:hover {
              background: var(--color-cream);
            }

            .nav-icon {
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              border-radius: var(--radius-md);
              border: 1px solid var(--color-nude-light);
              color: var(--color-brown);
            }

            .profile-nav-item span {
              font-family: 'Quicksand', sans-serif;
              font-weight: 600;
              color: var(--color-brown-dark);
              flex: 1;
            }

            .nav-arrow {
              color: var(--color-nude);
              transition: transform 0.2s;
            }

            .profile-nav-item:hover .nav-arrow {
              transform: translateX(4px);
              color: var(--color-coral);
            }

            .profile-nav-divider {
              height: 1px;
              background: var(--color-nude-light);
              margin: var(--space-4) 0;
            }

            .profile-nav-item.sign-out {
              color: #DC2626;
            }

            .profile-nav-item.sign-out .nav-icon {
              color: #DC2626;
              border-color: #FEE2E2;
            }

            .profile-nav-item.sign-out:hover {
              background: #FEE2E2;
            }

            .profile-modal-footer {
              margin-top: auto;
              text-align: center;
              padding-top: var(--space-8);
            }

            .profile-modal-footer p {
              font-size: 0.75rem;
              color: var(--color-text-muted);
              letter-spacing: 0.05em;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
