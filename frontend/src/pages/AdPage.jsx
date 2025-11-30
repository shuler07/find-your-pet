import "./AdPage.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { AD_INFO_DICT } from "../data";
import { ApiGetAdCreator, ApiRemoveAd } from "../apiRequests";
import {
    ymapsInitPromise,
    YMap,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
} from "../ymaps";
import { RestartAnim } from "../functions";

export default function AdPage() {
    const { ad, CallAlert, theme } = useContext(AppContext);

    const [creator, setCreator] = useState({});
    const [isCreator, setIsCreator] = useState(false);
    useEffect(() => {
        GetCreator();
    }, []);

    async function GetCreator() {
        const data = await ApiGetAdCreator(ad.user_id);

        if (data.success) {
            setCreator(data.user);
            setIsCreator(data.isCreator);
        } else if (data.error)
            CallAlert(
                "Ошибка при получении создателя объявления. Попробуйте позже",
                "red"
            );
    }

    return (
        <>
            <Header />
            <div className="page-container">
                <div id="ad-details-container">
                    <PetPhotos photo={ad.ad_image_display_url} />
                    <PetInfo
                        {...ad}
                        isCreator={isCreator}
                        CallAlert={CallAlert}
                    />
                    <PetContacts uid={ad.user_id} status={ad.status} {...creator} />
                    <PetPlace
                        location={ad.location}
                        geoLocation={ad.geoLocation}
                        theme={theme}
                    />
                </div>
            </div>
            <Footer />
        </>
    );
}

function PetPhotos({ photo }) {
    const img = photo.length != 0 ? photo : "/images/image-not-found.png";

    return (
        <section id="ad-photos" className="ad-page-section">
            <div style={{ background: `url("${img}") center / cover` }} />
        </section>
    );
}

function PetInfo({
    id,
    status,
    type,
    breed,
    color,
    size,
    distincts,
    nickname,
    danger,
    location,
    time,
    extras,
    isCreator,
    CallAlert,
}) {
    const navigate = useNavigate();

    const nicknameText = nickname != "" ? nickname : "Кличка неизвестна";
    const distinctsText = distincts != "" ? distincts : "Не указаны";
    const extrasText = extras != "" ? extras : "Не указана";
    const styledInfoStatus = {
        backgroundColor: status == "lost" ? "#f53535" : "#1fcf1f",
    };
    const helpText = isCreator
        ? "Это созданное вами объявление. Если оно перестало быть актуальным вы можете его снять"
        : "Пожалуйста, свяжитесь с автором объявления, если вы нашли потерянное животное или найденный питомец является вашим";

    async function RemoveAd() {
        const data = await ApiRemoveAd(id);

        if (data.success) {
            CallAlert("Объявление успешно снято", "green");
            navigate("/profile");
        } else if (data.error)
            CallAlert("Ошибка при снятии объявления. Попробуйте позже", "red");
    }

    const scrollToContacts = () => {
        const contactsElem = document.getElementById("ad-contacts");

        contactsElem.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        contactsElem.classList.add("anim");
        RestartAnim(contactsElem);
    };

    const buttonImage = isCreator ? "/icons/trash.svg" : "/icons/message.svg";
    const buttonText = isCreator ? "Снять объявление" : "Связаться";
    const buttonEvent = isCreator ? RemoveAd : scrollToContacts;

    return (
        <section id="ad-info" className="ad-page-section">
            <div id="ad-info-status" style={styledInfoStatus}>
                <h3>{AD_INFO_DICT.status[status]}</h3>
            </div>
            <div>
                <h2>{nicknameText}</h2>
                <h6>
                    {AD_INFO_DICT.breed[breed]} • {AD_INFO_DICT.type[type]}
                </h6>
            </div>
            <div>
                <h3>Детали</h3>
                <h6>
                    <span style={{ fontWeight: "600" }}>Окрас:</span> {color}
                </h6>
                <h6>
                    <span style={{ fontWeight: "600" }}>Размер:</span>{" "}
                    {AD_INFO_DICT.size[size]}
                </h6>
                <h6>
                    <span style={{ fontWeight: "600" }}>
                        Отлчительные признаки:
                    </span>{" "}
                    {distinctsText}
                </h6>
                <h6>
                    <span style={{ fontWeight: "600" }}>Опасность:</span>{" "}
                    {AD_INFO_DICT.danger[danger]}
                </h6>
                <h6>
                    <span style={{ fontWeight: "600" }}>Место:</span> {location}
                </h6>
                <h6>
                    <span style={{ fontWeight: "600" }}>Время:</span> {time}
                </h6>
            </div>
            <div>
                <h3>Дополнительная информация</h3>
                <h6>{extrasText}</h6>
            </div>
            <h6>{helpText}</h6>
            <button
                className={`primary-button ${isCreator && "red"}`}
                onClick={buttonEvent}
            >
                <img src={buttonImage} />
                {buttonText}
            </button>
        </section>
    );
}

function PetContacts({ uid, status, name, date, email, phone, vk, tg, max }) {
    const navigate = useNavigate();

    console.log(uid)
    const profileText =
        status == "lost" ? "Владелец питомца" : "Нашедший питомца";

    const handleClickContacts = () => {
        navigate(`/profile/${uid}`);
    };

    return (
        <section id="ad-contacts" className="ad-page-section">
            <div id="ad-contacts-profile" onClick={handleClickContacts}>
                <img src="/images/avatar-not-found.png" />
                <div>
                    <h3>{name}</h3>
                    <h6
                        style={{ fontSize: ".8em" }}
                    >{`${profileText}, участник сообщества с ${date}`}</h6>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".5rem",
                }}
            >
                <div className="ad-contacts-connect">
                    <img src="/icons/email.png" />
                    <h6>{email}</h6>
                </div>
                <div className="ad-contacts-connect">
                    <img src="/icons/phone.png" />
                    <h6>{phone}</h6>
                </div>
                <div className="ad-contacts-connect">
                    <img src="/icons/vk.png" />
                    <h6>{vk}</h6>
                </div>
                <div className="ad-contacts-connect">
                    <img src="/icons/tg.png" />
                    <h6>{tg}</h6>
                </div>
                <div className="ad-contacts-connect">
                    <img src="/icons/max.png" />
                    <h6>{max}</h6>
                </div>
            </div>
        </section>
    );
}

function PetPlace({ location, geoLocation, theme }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    ymapsInitPromise.then(() => setMapLoaded(true));

    return (
        <section id="ad-place" className="ad-page-section">
            <div>
                <h2>Локация</h2>
                <h6>
                    Последний раз животное видели здесь:{" "}
                    <span style={{ fontWeight: "600" }}>{location}</span>
                </h6>
            </div>
            <div id="ad-place-map">
                {mapLoaded &&
                    (geoLocation.length != 0 ? (
                        <YMap location={{ center: geoLocation, zoom: 9 }} theme={theme}>
                            <YMapDefaultSchemeLayer />
                            <YMapDefaultFeaturesLayer />
                            <YMapMarker coordinates={geoLocation}>
                                <div className="map-marker" />
                            </YMapMarker>
                        </YMap>
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        "url('/images/russia_map_outline.png') center / cover",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    filter: "var(--inverse-image-filter)",
                                    opacity: 0.7,
                                    maskImage:
                                        "radial-gradient(ellipse, white, transparent 75%)",
                                }}
                            />
                            <h2 style={{ zIndex: 1 }}>Карта недоступна</h2>
                        </div>
                    ))}
            </div>
        </section>
    );
}
