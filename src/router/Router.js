import {createBrowserRouter} from "react-router-dom";
import React from "react";
import App from "../pages/App";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import PageNotFound from "../pages/PageNotFound";
import HomePage from "../pages/HomePage";
import Dataset from "../pages/Dataset";
import Playground from "../pages/Playground";
import PictureList from "../component/PictureList";
import TextList from "../component/TextList";
import AudioList from "../component/AudioList";

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
        {
            path: 'dataset/picture-list',
            element: <PictureList/>,
        },
        {
            path: 'dataset/text-list',
            element: <TextList/>,
        },
        {
            path: 'dataset/audio-list',
            element: <AudioList/>,
        }
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