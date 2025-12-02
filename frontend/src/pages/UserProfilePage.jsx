import "./ProfilePage.css";

import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../App";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AdsContainer from "../components/AdsContainer";

import { ApiGetUserAds, ApiGetUser } from "../apiRequests";

export default function ProfilePage() {
    const { uid } = useParams();

    const { CallAlert } = useContext(AppContext);

    const [user, setUser] = useState({
        avatar_display_url: "/images/avatar-not-found.png",
        avatar: "",
        name: "",
        created_at: "",
        email: "",
        phone: "",
        vk: "",
        tg: "",
        max: "",
    });
    useEffect(() => {
        GetUser();
    }, []);

    const [userExists, setUserExists] = useState(true);

    async function GetUser() {
        const data = await ApiGetUser(uid);

        if (data.user) setUser(data.user);
        else if (data.detail == "Пользователь не найден") setUserExists(false);
        else if (data.error) CallAlert("Ошибка при получении профиля", "red");
    }

    return userExists ? (
        <>
            <Header />
            <div id="profile-page-container" className="page-container">
                <ProfileCard {...user} />
                <PostedPetsCard CallAlert={CallAlert} uid={uid} />
            </div>
            <Footer />
        </>
    ) : (
        <div className="page-container" style={{ padding: 0, height: '100dvh' }}>
            <h1>{"Пользователь не найден :("}</h1>
        </div>
    );
}

function ProfileCard({
    avatar_display_url,
    name,
    created_at,
    email,
    phone,
    vk,
    tg,
    max,
}) {
    return (
        <section id="profile-card-section" className="card-section">
            <div id="profile-card-avatar">
                <div
                    style={{
                        background: `url("${avatar_display_url}") center / cover`,
                    }}
                />
            </div>
            <div id="profile-card-info">
                <h2>{name}</h2>
                <h6 style={{ marginTop: "-1.25rem" }}>
                    Зарегистрирован {created_at}
                </h6>
                <div
                    style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}
                >
                    <div className="profile-card-field">
                        <h6>Почта</h6>
                        <h3>{email}</h3>
                    </div>
                    <div className="profile-card-field">
                        <h6>Телефон</h6>
                        <h3>{phone || "Не указан"}</h3>
                    </div>
                    <div className="profile-card-field">
                        <h6>ВКонтакте</h6>
                        <h3>{vk || "Не указан"}</h3>
                    </div>
                    <div className="profile-card-field">
                        <h6>Telegram</h6>
                        <h3>{tg || "Не указан"}</h3>
                    </div>
                    <div className="profile-card-field">
                        <h6>Max</h6>
                        <h3>{max || "Не указан"}</h3>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PostedPetsCard({ CallAlert, uid }) {
    const [userAds, setUserAds] = useState([]);
    useEffect(() => {
        GetUserAds();
    }, []);

    async function GetUserAds() {
        const data = await ApiGetUserAds(uid);

        if (data.success) setUserAds(data.ads);
        else if (data.error)
            CallAlert(
                "Ошибка при получении объявлений пользователя. Попробуйте позже",
                "red"
            );
    }

    return (
        <section id="posted-pets-card-section" className="card-section">
            <h5>
                Опубликованные объявления{" "}
                <span
                    style={{
                        color: "color-mix(in srgb, var(--inverse-color), white 50%)",
                    }}
                >
                    {userAds.length}
                </span>
            </h5>
            <AdsContainer ads={userAds} inProfile={true} />
        </section>
    );
}
