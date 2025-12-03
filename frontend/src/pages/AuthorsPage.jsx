import "./AuthorsPage.css";

import { useNavigate } from "react-router-dom";

import { AUTHORS } from "../data";

export default function AuthorsPage() {
    const navigate = useNavigate();

    return (
        <div id="authors-page-container" className="page-container gradient-accent">
            <button
                id="authors-back"
                className="primary-button left-img"
                onClick={() => navigate("/")}
            >
                <img src="/icons/left-arrow.svg" />
                На главную
            </button>
            {AUTHORS.map((card, index) => (
                <div
                    key={`keyAuthorCard${index}`}
                    id={`author-card-${index + 1}`}
                    className="author-card"
                >
                    <div />
                    <img src={card.img} alt={card.title} />
                    <h2>{card.title}</h2>
                    <h6>{card.description}</h6>
                </div>
            ))}
            <div id="bg-elem-1" className="authors-page-bg-elem" />
            <div id="bg-elem-2" className="authors-page-bg-elem" />
        </div>
    );
}
