import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App';
import { StoreProvider } from './data/store';
import './styles.css';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <HelmetProvider>
                <StoreProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </StoreProvider>
            </HelmetProvider>
        </React.StrictMode>
    );
}
