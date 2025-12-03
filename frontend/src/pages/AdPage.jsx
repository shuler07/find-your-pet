import "./AdPage.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../App";

import Header from "../components/Header";
import Footer from "../components/Footer";
import PageUnavailable from "../components/PageUnavailable";

import { AD_INFO_DICT } from "../data";
import {
    ApiGetAdAndCreator,
    ApiCloseAd,
    ApiDeleteAd,
    ApiApproveAd,
    ApiReportAd,
    ApiUnreportAd,
} from "../apiRequests";
import {
    ymapsInitPromise,
    YMap,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
} from "../ymaps";
import { RestartAnim } from "../functions";

export default function AdPage() {
    const { CallAlert, isAdmin, theme } = useContext(AppContext);
    const { aid } = useParams();

    // To pass the error on start - set default values for some fields because in code attempt to get .length causing error on undefined
    const [ad, setAd] = useState({
        geoLocation: [],
    });
    const [creator, setCreator] = useState({
        phone: "",
        vk: "",
        tg: "",
        max: "",
    });

    const [isCreator, setIsCreator] = useState(false);
    useEffect(() => {
        GetAdAndCreator();
    }, []);

    const [adExists, setAdExists] = useState(true);

    async function GetAdAndCreator() {
        const data = await ApiGetAdAndCreator(aid);

        if (data.success) {
            setAd(data.ad);
            setCreator(data.user);
            setIsCreator(data.isCreator);
        } else if (data.detail == "Объявление не найдено") setAdExists(false);
        else if (data.error)
            CallAlert(
                "Ошибка при получении создателя объявления. Попробуйте позже",
                "red"
            );
    }

    return adExists ? (
        <>
            <Header />
            <div className="page-container">
                <div id="ad-details-container">
                    <PetPhotos {...ad} />
                    <PetInfo
                        {...ad}
                        isCreator={isCreator}
                        isAdmin={isAdmin}
                        CallAlert={CallAlert}
                    />
                    <PetContacts
                        uid={ad.user_id}
                        status={ad.status}
                        {...creator}
                    />
                    <PetPlace
                        location={ad.location}
                        geoLocation={ad.geoLocation}
                        theme={theme}
                    />
                </div>
            </div>
            <Footer />
        </>
    ) : (
        <PageUnavailable message="Объявление не найдено :(" />
    );
}

function PetPhotos({ ad_image_display_url, status, state }) {
    const styledAdStatus = {
        backgroundColor: status == "lost" ? "#f53535" : "#1fcf1f",
    };

    return (
        <section id="ad-photos" className="ad-page-section">
            <div
                id="ad-photos-img"
                style={{
                    background: `url("${ad_image_display_url}") center / cover`,
                }}
            />
            <div id="ad-status">
                <div className="ad-status-div" style={styledAdStatus}>
                    <h3>{AD_INFO_DICT.status[status]}</h3>
                </div>
                {state == "pending" && (
                    <div
                        className="ad-status-div"
                        style={{ backgroundColor: "#818181" }}
                    >
                        <h3>На рассмотрении</h3>
                    </div>
                )}
                {state == "closed" && (
                    <div
                        className="ad-status-div"
                        style={{ backgroundColor: "#818181" }}
                    >
                        <h3>Снято</h3>
                    </div>
                )}
            </div>
        </section>
    );
}

function PetInfo({
    id,
    type,
    breed,
    color,
    size,
    distincts,
    nickname,
    danger,
    region,
    time,
    extras,
    state,
    reported,
    isCreator,
    isAdmin,
    CallAlert,
}) {
    const navigate = useNavigate();

    const nicknameText = nickname != "" ? nickname : "Кличка неизвестна";
    const distinctsText = distincts != "" ? distincts : "Не указаны";
    const extrasText = extras != "" ? extras : "Не указана";
    const helpText =
        isAdmin && (state == "pending" || reported)
            ? "Проверьте объявление на корректность и адекватность"
            : isCreator
            ? "Это созданное вами объявление. Если оно перестало быть актуальным вы можете его снять"
            : "Пожалуйста, свяжитесь с автором объявления, если вы нашли потерянное животное или найденный питомец является вашим";

    async function RemoveAd() {
        const data = await ApiCloseAd(id);

        if (data.success) {
            CallAlert("Объявление снято", "green");
            navigate("/profile");
        } else if (data.error)
            CallAlert("Ошибка при снятии объявления. Попробуйте позже", "red");
    }

    async function DeleteAd() {
        const data = await ApiDeleteAd(id);

        if (data.success) {
            CallAlert("Объявление удалено", "green");
            if (!isAdmin) navigate("/profile");
            else navigate("/admin");
        } else if (data.error)
            CallAlert("Ошибка при удалении объявления", "red");
    }

    async function UploadAd() {
        const data = await ApiApproveAd(id);

        if (data.success) {
            CallAlert("Объявление опубликовано", "green");
            navigate("/admin");
        } else if (data.error)
            CallAlert(
                "Ошибка при попытке опубликовать объявления. Попробуйте позже",
                "red"
            );
    }

    async function ReportAd() {
        const data = await ApiReportAd(id);

        if (data.success) CallAlert("Жалоба на объявление отправлена", "green");
        else if (data.error)
            CallAlert(
                "Ошибка при попытке пожаловаться на объявление. Попробуйте позже",
                "red"
            );
    }

    async function UnreportAd() {
        const data = await ApiUnreportAd(id);

        if (data.success) {
            CallAlert("Объявление оставлено", "green");
            navigate("/admin");
        } else if (data.error)
            CallAlert("Ошибка при снятии жалобы. Попробуйте позже", "red");
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

    function AuthButton() {
        const buttonImage = isCreator
            ? state == "pending" || state == "closed"
                ? "/icons/trash.svg"
                : "/icons/close.svg"
            : "/icons/message.svg";
        const buttonText = isCreator
            ? state == "pending" || state == "closed"
                ? "Удалить объявление"
                : "Снять объявление"
            : "Связаться";
        const buttonEvent = isCreator
            ? state == "pending" || state == "closed"
                ? DeleteAd
                : RemoveAd
            : scrollToContacts;

        return !isAdmin || (state != "pending" && !reported) ? (
            <button
                className={`primary-button ${isCreator && "red"}`}
                onClick={buttonEvent}
            >
                <img src={buttonImage} />
                {buttonText}
            </button>
        ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
                <button
                    className="primary-button left-img red"
                    style={{ flexGrow: 1 }}
                    onClick={DeleteAd}
                >
                    <img src="/icons/trash.svg" />
                    Удалить
                </button>
                {reported ? (
                    <button
                        className="primary-button left-img"
                        style={{ flexGrow: 1 }}
                        onClick={UnreportAd}
                    >
                        <img src="/icons/unreport-flag.svg" />
                        Оставить
                    </button>
                ) : (
                    <button
                        className="primary-button left-img"
                        style={{ flexGrow: 1 }}
                        onClick={UploadAd}
                    >
                        <img src="/icons/upload.svg" />
                        Опубликовать
                    </button>
                )}
            </div>
        );
    }

    return (
        <section id="ad-info" className="ad-page-section">
            {!isCreator && !isAdmin && (
                <button
                    id="ad-info-report-button"
                    className="primary-button red"
                    onClick={ReportAd}
                >
                    <img src="/icons/report-flag.svg" />
                </button>
            )}
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
                    <span style={{ fontWeight: "600" }}>Регион:</span>{" "}
                    {AD_INFO_DICT.region[region]}
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
            {<AuthButton />}
        </section>
    );
}

function PetContacts({
    uid,
    status,
    name,
    created_at,
    email,
    phone,
    vk,
    tg,
    max,
    avatar_display_url,
}) {
    const navigate = useNavigate();

    const profileText =
        status == "lost" ? "Владелец питомца" : "Нашедший питомца";
    const phoneText = phone.length > 0 ? phone : "Не указан";
    const vkText = vk.length > 0 ? vk : "Не указан";
    const tgText = tg.length > 0 ? tg : "Не указан";
    const maxText = max.length > 0 ? max : "Не указан";

    const handleClickContacts = () => {
        navigate(`/profile/${uid}`);
    };

    return (
        <section id="ad-contacts" className="ad-page-section">
            <div id="ad-contacts-profile" onClick={handleClickContacts}>
                <img src={avatar_display_url} />
                <div>
                    <h3>{name}</h3>
                    <h6
                        style={{ fontSize: ".8em" }}
                    >{`${profileText}, участник сообщества с ${created_at}`}</h6>
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
                    <h6>{phoneText}</h6>
                </div>
                <div className="ad-contacts-connect">
                    <img src="/icons/vk.png" />
                    <h6>{vkText}</h6>
                </div>
                <div className="ad-contacts-connect">
                    <img src="/icons/tg.png" />
                    <h6>{tgText}</h6>
                </div>
                <div className="ad-contacts-connect">
                    <img src="/icons/max.png" />
                    <h6>{maxText}</h6>
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
                        <YMap
                            location={{ center: geoLocation, zoom: 9 }}
                            theme={theme}
                        >
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
