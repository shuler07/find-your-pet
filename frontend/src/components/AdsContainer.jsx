import "./AdsContainer.css";

import { useContext } from "react";
import { AppContext } from "../App";

import { useNavigate } from "react-router-dom";

import { AD_INFO_DICT } from "../data";

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
                  height: inProfile ? '16rem' : 'calc(100dvh - 10.5rem)',
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
        time,
    } = ad;

    const title = nickname ? nickname : "Кличка неизвестна";
    const subtitle = `${AD_INFO_DICT.type[type]} • ${AD_INFO_DICT.breed[breed]}`;
    const description = `Окрас: ${color}, размер: ${AD_INFO_DICT.size[size]}`;
    const distinctiveFeatures = distincts
        ? `Отличительные признаки: ${distincts}`
        : "Отличительные признаки не указаны";
    const placeAndTimeData = `${location}, ${time}`;

    const navigate = useNavigate();
    const context = useContext(AppContext);

    const handleClickAd = () => {
        context.ad = ad;
        navigate("/ad");
    };

    return (
        <div className="ad-card">
            <img src="/images/image-not-found.png" />
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
                <h6>{distinctiveFeatures}</h6>
                <h6>{AD_INFO_DICT.danger[danger]}</h6>
                <h6>{placeAndTimeData}</h6>
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
