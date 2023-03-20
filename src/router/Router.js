import {createBrowserRouter} from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import React from "react";

const router = createBrowserRouter([{
    path: '/',
    element: <App/>
}, {
    path: '/login',
    element: <LoginPage/>,
}, {
    path: '/register',
    element: <RegisterPage/>,
}, {
    path: '/home',
    element: <HomePage/>,
}])

export default router;