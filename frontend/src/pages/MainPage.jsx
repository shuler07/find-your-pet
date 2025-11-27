import "./MainPage.css";

import { useContext } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainPage() {
    const { signedIn } = useContext(AppContext);

    const animalsBack = 0;
    const activeAds = 0;
    const communityMembers = 0;
    const successRate = 0;

    const navigate = useNavigate();

    const handleClickCreateAd = () => {
        if (signedIn) navigate("/ads/create");
        else navigate("/signin");
    };

    const handleClickSearchAds = () => {
        navigate("/ads");
    };

    return (
        <>
            <Header />
            <div className="page-container">
                <section id="main-page-intro-section">
                    <h1>Find Your Pet</h1>
                    <h2 style={{ textAlign: "center" }}>
                        Присоединяйся к нашему сообществу: ищи потерянных
                        животных в своей области или сообщай об их находке.
                    </h2>
                </section>
                <section id="main-page-navigate-section">
                    <div
                        className="navigate-banner"
                        onClick={handleClickCreateAd}
                    >
                        <img src="/icons/plus-square.svg" />
                        <h2>Создать объявление</h2>
                        <h6>Разместите объявление о пропавшем питомце</h6>
                    </div>
                    <div
                        className="navigate-banner"
                        onClick={handleClickSearchAds}
                    >
                        <img src="/icons/search-ad.svg" />
                        <h2>Найти объявление</h2>
                        <h6>Найдите пропавших животных в вашем районе</h6>
                    </div>
                </section>
                <h2>О сервисе</h2>
                <section id="main-page-about-section">
                    <div className="about-block">
                        <img src="/icons/house-check.svg" />
                        <div>
                            <h6>Животных возвращено</h6>
                            <h3>{animalsBack}</h3>
                        </div>
                    </div>
                    <div className="about-block">
                        <img src="/icons/search-blue.svg" />
                        <div>
                            <h6>Активных объявлений</h6>
                            <h3>{activeAds}</h3>
                        </div>
                    </div>
                    <div className="about-block">
                        <img src="/icons/community.svg" />
                        <div>
                            <h6>Сообщество</h6>
                            <h3>{communityMembers} чел.</h3>
                        </div>
                    </div>
                    <div className="about-block">
                        <img src="/icons/heart.svg" />
                        <div>
                            <h6>Процент нахождения</h6>
                            <h3>{successRate} %</h3>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
