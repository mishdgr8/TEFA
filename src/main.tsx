import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './data/store';
import './styles.css';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <StoreProvider>
                <App />
            </StoreProvider>
        </React.StrictMode>
    );
}
