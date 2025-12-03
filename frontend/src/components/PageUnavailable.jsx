import "./PageUnavailable.css";

import { useNavigate } from "react-router-dom";

export default function PageUnavailable({ message }) {
    const navigate = useNavigate();

    return (
        <div
            className="page-container unavailable"
            style={{ padding: 0, height: "100dvh" }}
        >
            <button
                id="unavailable-back"
                className="primary-button left-img"
                onClick={() => navigate("/")}
            >
                <img src="/icons/left-arrow.svg" />
                На главную
            </button>
            <div
                id="unavailable-primary-circle"
                className="unavailable-circle"
            />
            <div
                id="unavailable-accent-circle"
                className="unavailable-circle"
            />
            <h1>{message}</h1>
        </div>
    );
}
