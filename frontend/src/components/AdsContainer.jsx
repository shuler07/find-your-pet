import "./AdsContainer.css";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";

import { useNavigate } from "react-router-dom";

import { AD_INFO_DICT } from "../data";
import { getGeolocation } from "../functions";

export default function AdsContainer({ ads, inProfile }) {
    const showAds = () => {
        return ads.map((value, index) => (
            <AdCard
                key={`keyAdCard${index}`}
                ad={{
                    ...value,
                    time: value.time.replaceAll("Z", "").replaceAll("T", " "),
                }}
            />
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

function AdCard({ ad }) {
    const {
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
        ad_image_display_url
    } = ad;

    const navigate = useNavigate();
    const context = useContext(AppContext);

    const image = ad_image_display_url.length != 0 ? ad_image_display_url : "/images/image-not-found.png";
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

    const handleClickAd = () => {
        context.ad = ad;
        navigate("/ad");
    };

    return (
        <div className="ad-card">
            <div className="ad-card-image" style={{ background: `url("${image}") center / cover` }} />
            <div
                className="ad-card-status"
                style={{ background: status == "lost" ? "#f53535" : "#1fcf1f" }}
            >
                <h3>{AD_INFO_DICT.status[status]}</h3>
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
