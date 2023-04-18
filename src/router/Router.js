import {createBrowserRouter} from "react-router-dom";
import React from "react";
import App from "../pages/App";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import PageNotFound from "../pages/PageNotFound";
import HomePage from "../pages/HomePage";
import Dataset from "../pages/Dataset";
import Playground from "../pages/Playground";

const router = createBrowserRouter([{
    path: '/',
    element: <App/>,
    children: [
        {
            index: true,
            element: <HomePage/>,
        },
        {
            path: 'dataset',
            element: <Dataset/>,
        },
        {
            path: 'playground',
            element: <Playground/>,
        },
    ],
}, {
    path: '/login',
    element: <LoginPage/>,
}, {
    path: '/register',
    element: <RegisterPage/>,
}, {
    path: '*',
    element: <PageNotFound/>
}])

export default router;