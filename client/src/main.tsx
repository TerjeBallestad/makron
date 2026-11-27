import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastStack } from '@terjeballestad/bob';
import './app.css';
import { App } from './components/App';
import { toastManager } from './toast';

ReactDOM.createRoot(document.getElementById('tt-root')!).render(
  <ToastStack toastManager={toastManager} timeout={2400}>
    <App />
  </ToastStack>,
);
