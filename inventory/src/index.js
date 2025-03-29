import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Product from './pages/product';
import Customer from './pages/customer';
import Analytics from './pages/analytics';
import Orderslist from './pages/orderslist';
import Setting from './pages/setting';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {/* <App /> */}
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product" element={<Product />} />
          <Route path="/orderslist" element={<Orderslist />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();