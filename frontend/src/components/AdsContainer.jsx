import "./AdsContainer.css";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { AD_INFO_DICT } from "../data";
import { getGeolocation } from "../functions";

export default function AdsContainer({ ads, inProfile }) {
    const showAds = () => {
        return ads.map((value, index) => (
            <AdCard key={`keyAdCard${index}`} ad={value} bg={inProfile ? "var(--secondary-color)" : "var(--main-color)"} />
        ));
    };

    const containerStyle =
        ads.length > 0
            ? {
                  width: "100%",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
              }
            : {
                  width: "100%",
                  height: inProfile ? "16rem" : "calc(100dvh - 10.5rem)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
              };

    return (
        <div style={containerStyle}>
            {ads.length > 0 ? showAds() : <h2>Объявлений не найдено</h2>}
        </div>
    );
}

function AdCard({ ad, bg }) {
    const {
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
        geoLocation,
        time,
        ad_image_display_url,
        state,
    } = ad;

    const navigate = useNavigate();

    const title = nickname ? nickname : "Кличка неизвестна";
    const subtitle = `${AD_INFO_DICT.type[type]} • ${AD_INFO_DICT.breed[breed]}`;
    const description = `Окрас: ${color}, размер: ${AD_INFO_DICT.size[size]}`;
    const distinctiveFeatures = distincts
        ? `Отличительные признаки: ${distincts}`
        : "Отличительные признаки не указаны";
    const placeAndTimeData = `${location}, ${time}`;

    const [geoloc, setGeoloc] = useState(null);
    useEffect(() => {
        getGeolocation().then((val) => setGeoloc(val));
    }, []);

    const getDistance = () => {
        const [lat1, lon1] = geoloc;
        const [lat2, lon2] = geoLocation;

        const R = 6371;

        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.asin(Math.sqrt(a));
        return Math.round(R * c);
    };

    const handleClickAd = () => navigate(`/ad/${id}`);

    return (
        <div className="ad-card" style={{ background: bg }}>
            <div
                className="ad-card-image"
                style={{
                    background: `url("${ad_image_display_url}") center / cover`,
                }}
            />
            <div className="ad-card-status">
                <div
                    className="ad-card-status-div"
                    style={{
                        background: status == "lost" ? "#f53535" : "#1fcf1f",
                    }}
                >
                    <h3>{AD_INFO_DICT.status[status]}</h3>
                </div>
                {state == "pending" && (
                    <div
                        className="ad-card-status-div"
                        style={{ background: "#818181" }}
                    >
                        <h3>На рассмотрении</h3>
                    </div>
                )}
                {state == "closed" && (
                    <div
                        className="ad-card-status-div"
                        style={{ background: "#818181" }}
                    >
                        <h3>Снято</h3>
                    </div>
                )}
            </div>
            <div className="ad-card-info-block">
                <h3>{title}</h3>
                <h6>{subtitle}</h6>
                <h6>{description}</h6>
                <h6>
                    {distinctiveFeatures}, {AD_INFO_DICT.danger[danger]}
                </h6>
                <div style={{ height: ".25rem" }}></div>
                <h6>{placeAndTimeData}</h6>
                {geoloc && geoLocation.length != 0 && (
                    <h6>В {getDistance()} км от вас</h6>
                )}
            </div>
            <button
                className="primary-button gradient-primary"
                onClick={handleClickAd}
            >
                Подробнее
                <img src="/icons/right-arrow.svg" />
            </button>
        </div>
    );
}
