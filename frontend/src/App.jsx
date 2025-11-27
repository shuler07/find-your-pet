import { useEffect, useRef, useState, createContext } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Alert from "./components/Alert";
import MainPage from "./pages/MainPage";
import SigninPage from "./pages/SigninPage";
import HelpPage from "./pages/HelpPage";
import SearchAdsPage from "./pages/SearchAdsPage";
import CreateAdPage from "./pages/CreateAdPage";
import AdPage from "./pages/AdPage";
import AuthorsPage from "./pages/AuthorsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

import { ApiCheckAuth, ApiRefreshAuth } from "./apiRequests";
import { RestartAnim } from "./functions";

export const AppContext = createContext();

export default function App() {
    const [signedIn, setSignedIn] = useState(true);
    useEffect(() => {
        //CheckAuth();
    }, []);
    const [isAdmin, setIsAdmin] = useState(true);

    const [alert, setAlert] = useState({ text: null, color: null });
    const alertRef = useRef();

    function CallAlert(text, color) {
        RestartAnim(alertRef.current);
        setAlert({ text, color });
    }

    async function CheckAuth() {
        const data = await ApiCheckAuth();

        if (data.success) {
            setSignedIn(true);
            if (data.role == "admin") setIsAdmin(true);
        } else {
            if (data.detail == "Токен недействителен или истёк") RefreshAuth();
            if (data.error)
                CallAlert("Ошибка при аутентификации. Попробуйте позже", "red");
        }
    }

    async function RefreshAuth() {
        const data = await ApiRefreshAuth();

        if (data.success) setSignedIn(true);
        else if (data.error)
            CallAlert("Ошибка при аутентфикации. Попробуйте позже", "red");
    }

    return (
        <AppContext
            value={{
                signedIn,
                isAdmin,
                setSignedIn,
                CallAlert,
            }}
        >
            <Router>
                <Routes>
                    <Route index element={<MainPage />} />
                    <Route path="/signin" element={<SigninPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/ads/create" element={<CreateAdPage />} />
                    <Route path="/ads" element={<SearchAdsPage />} />
                    <Route path="/ad" element={<AdPage />} />
                    <Route path="/authors" element={<AuthorsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </Router>
            <Alert text={alert.text} color={alert.color} ref={alertRef} />
        </AppContext>
    );
}
