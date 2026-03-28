import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { OfferProvider } from './context/OfferContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <OfferProvider>
    <App />
  </OfferProvider>
);