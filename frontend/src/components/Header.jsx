import "./Header.css";

import { useContext } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const { signedIn, isAdmin } = useContext(AppContext);

    const navigate = useNavigate();

    return (
        <header>
            <img
                id="header-logo"
                src="/images/logo.png"
                onClick={() => navigate("/")}
            />
            <HeaderBar signedIn={signedIn} isAdmin={isAdmin} />
        </header>
    );
}

function HeaderBar({ signedIn, isAdmin }) {
    const navigate = useNavigate();

    const buttonEvent = () =>
        navigate(isAdmin ? "/admin" : signedIn ? "/profile" : "/signin");
    const buttonText = isAdmin ? "мониторинг" : signedIn ? "профиль" : "войти";

    return (
        <div id="header-bar">
            <div
                className="header-button accent"
                onClick={() => navigate("/help")}
            >
                <h3>помощь</h3>
            </div>
            <div className="header-button primary" onClick={buttonEvent}>
                <h6>{buttonText}</h6>
            </div>
        </div>
    );
}
