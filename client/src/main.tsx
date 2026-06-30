import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Global Fetch Interceptor to dynamic resolve hardcoded localhost backend URLs to VITE_API_URL
const originalFetch = window.fetch;
window.fetch = function (input, init) {
    let url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
    if (url.includes('http://localhost:5000')) {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiBase.replace(/\/api$/, '').replace(/\/$/, '');
        const newUrl = url.replace('http://localhost:5000', baseUrl);
        if (typeof input === 'string') {
            input = newUrl;
        } else if (input instanceof Request) {
            input = new Request(newUrl, input);
        }
    }
    return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
