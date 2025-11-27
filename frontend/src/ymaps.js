import React from "react";
import ReactDOM from "react-dom";

import { DEBUG } from "./data";

export let reactify,
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
    YMapListener;

const ymaps_script = document.createElement("script");
ymaps_script.src = `https://api-maps.yandex.ru/v3/?apikey=${
    import.meta.env.VITE_YMAPS_API_KEY
}&lang=ru_RU`;

export const ymapsInitPromise = new Promise((resolve) => {
    ymaps_script.onload = async () => {
        const [ymaps3React] = await Promise.all([
            ymaps3.import("@yandex/ymaps3-reactify"),
            ymaps3.ready,
        ]);
        reactify = ymaps3React.reactify.bindTo(React, ReactDOM, {
            forwardRef: true,
        });
        ({
            YMap,
            YMapDefaultSchemeLayer,
            YMapDefaultFeaturesLayer,
            YMapMarker,
            YMapListener,
        } = reactify.module(ymaps3));
        resolve();
    };
});

document.head.appendChild(ymaps_script);

export async function getGeoLocationOrAddress(searchable) {
    try {
        const response = await fetch(
            `https://geocode-maps.yandex.ru/v1/?apikey=${
                import.meta.env.VITE_YMAPS_API_KEY
            }&geocode=${searchable}&format=json`
        );

        const data = await response.json();

        if (DEBUG) console.debug("Getting geolocation / address. Data received:", data);

        return data;
    } catch (error) {
        console.error("Getting geolocation / address. Error:", error);
    }
}

export async function getSuggestsByText(text) {
    try {
        const response = await fetch(
            `https://suggest-maps.yandex.ru/v1/suggest?apikey=${
                import.meta.env.VITE_YMAPS_GEOSUGGEST_API_KEY
            }&text=${text}&results=5`
        );

        const data = await response.json();

        if (DEBUG) console.log("Searching addresses. Data received:", data);

        return data;
    } catch (error) {
        console.error("Searching addresses. Error:", error);
        return { error: true };
    }
}
