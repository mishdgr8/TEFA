import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { StoreProvider } from './data/store';
import './styles.css';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <StoreProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </StoreProvider>
        </React.StrictMode>
    );
}
