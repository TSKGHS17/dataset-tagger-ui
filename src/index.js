import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from "./App"
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/home" element={<App/>} />
            <Route path="*" element={<PageNotFound/>} />
        </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
