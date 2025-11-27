import "./Footer.css";

import { useNavigate } from "react-router-dom";

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="gradient-primary">
            <h6 style={{ color: "#eee" }}>
                © 2025 FindYourPet. Все права защищены. Сделано с любовью к
                питомцам{" "}
                <a id="authors-link" onClick={() => navigate("/authors")}>
                    студентами университета МАИ
                </a>{" "}
                ✈️
            </h6>
        </footer>
    );
}
