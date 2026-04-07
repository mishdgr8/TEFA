import React from 'react';

export const AnnouncementBar: React.FC = () => {
    return (
        <div className="announcement-bar">
            <strong>PREORDER ONLY</strong> • ALL PIECES ARE HANDCRAFTED TO ORDER
            <style>{`
                .announcement-bar {
                    background-color: var(--color-brown-dark, #1a1a1a);
                    color: white;
                    text-align: center;
                    padding: 6px 0;
                    font-size: 0.7rem;
                    letter-spacing: 0.15em;
                    font-weight: 500;
                    width: 100%;
                }

                .announcement-bar strong {
                    color: #fff;
                    font-weight: 800;
                }
            `}</style>
        </div>
    );
};
