// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // 변경된 import
import App from './App';
import './styles/Common.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // createRoot 사용
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
