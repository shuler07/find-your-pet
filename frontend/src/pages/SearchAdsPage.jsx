import "./SearchAdsPage.css";

import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App";

import Footer from "../components/Footer";
import Header from "../components/Header";
import AdsContainer from "../components/AdsContainer";

import { AD_INFO_DICT, AD_FILTERS_DICT } from "../data";
import {
    ymapsInitPromise,
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
    YMapListener,
} from "../ymaps";
import { ApiGetAds } from "../apiRequests";
import { RestartAnim } from "../functions";

export default function SearchAdsPage() {
    // Alert
    const { CallAlert, isAdmin, theme } = useContext(AppContext);

    // Ads
    const [ads, setAds] = useState([]);
    useEffect(() => {
        GetAds();
    }, []);

    const [filteredAds, setFilteredAds] = useState([]);
    useEffect(() => {
        setSearchText("");
        setFilteredAds(ads);
    }, [ads]);

    // Search
    const [searchText, setSearchText] = useState("");
    useEffect(() => {
        if (searchText == "" && ads.length == filteredAds.length) return;

        const timeout = setTimeout(FilterAds, 500);
        return () => clearTimeout(timeout);
    }, [searchText]);

    // Filters
    const [activeFilters, setActiveFilters] = useState({
        status: "any",
        type: "any",
        breed: "any",
        size: "any",
        danger: "any",
        region: "any",
        geoloc: null,
        radius: 1,
    });

    // Sidebar
    const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);
    const [placeSection, setPlaceSection] = useState("region");
    const [mobileView, setMobileView] = useState(window.innerWidth <= 768);

    window.addEventListener(
        "resize",
        () => {
            if (window.innerWidth <= 768 && !mobileView) setMobileView(true);
            else if (window.innerWidth > 768 && mobileView)
                setMobileView(false);
        },
        [mobileView]
    );

    const [sidebarOpened, setSidebarOpened] = useState(false);

    // Geoloc
    const [geolocOpened, setGeolocOpened] = useState(false);

    async function GetAds() {
        setSearchButtonDisabled(true);

        const filters = Object.fromEntries(
            Object.entries(activeFilters).filter(
                ([k, v]) => v != "any" && !["geoloc", "radius"].includes(k)
            )
        );

        if (placeSection == "place") {
            delete filters.region;
            filters.geoloc = activeFilters.geoloc;
            filters.radius = activeFilters.radius;
        }

        const data = await ApiGetAds(filters);

        setSearchButtonDisabled(false);

        if (data.success) setAds(data.ads);
        else if (data.error)
            CallAlert(
                "Ошибка при загрузке объявлений. Попробуйте позже",
                "red"
            );
    }

    function FilterAds() {
        if (searchText == "") {
            setFilteredAds(ads);
            return;
        }

        const getSimilarity = (word, text) => {
            let wordInd = 0,
                maxCnt = 0;
            for (let i = 0; i < text.length; i++) {
                if (text[i].toLowerCase() == word[wordInd]) {
                    wordInd++;
                    maxCnt = wordInd > maxCnt ? wordInd : maxCnt;
                } else wordInd = 0;
            }
            return maxCnt / word.length;
        };

        const words = searchText.split(" ");
        const toCheckFromDict = ["type", "breed", "size", "danger"];
        const toCheck = ["color", "distincts", "nickname", "extras"];

        setFilteredAds(
            ads.filter((ad) => {
                let flag = false;
                for (let i = 0; i < words.length; i++) {
                    for (let j = 0; j < toCheck.length; j++) {
                        if (getSimilarity(words[i], ad[toCheck[j]]) > 0.6) {
                            flag = true;
                            break;
                        }
                        if (
                            getSimilarity(
                                words[i],
                                AD_INFO_DICT[toCheckFromDict[j]][
                                    ad[toCheckFromDict[j]]
                                ]
                            ) > 0.6
                        ) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) break;
                }
                return flag;
            })
        );
    }

    return (
        <>
            <Header />
            <div className="page-container" id="search-ads-page-container">
                <SideBar
                    activeFilters={activeFilters}
                    setActiveFilters={setActiveFilters}
                    getAds={GetAds}
                    sidebarOpened={mobileView ? sidebarOpened : true}
                    setGeolocOpened={setGeolocOpened}
                    placeSection={placeSection}
                    setPlaceSection={setPlaceSection}
                    disabled={searchButtonDisabled}
                    isAdmin={isAdmin}
                />
                <MainContainer
                    searchText={searchText}
                    setSearchText={setSearchText}
                    ads={filteredAds}
                    mobileView={mobileView}
                    setSidebarOpened={setSidebarOpened}
                />
            </div>
            {geolocOpened && (
                <GeolocSelection
                    location={activeFilters.geoloc}
                    setGeolocOpened={setGeolocOpened}
                    setActiveFilters={setActiveFilters}
                    theme={theme}
                />
            )}
            <Footer />
        </>
    );
}

function SideBar({
    activeFilters,
    setActiveFilters,
    getAds,
    sidebarOpened,
    setGeolocOpened,
    placeSection,
    setPlaceSection,
    disabled,
    isAdmin,
}) {
    const showElems = () => {
        return Object.entries(activeFilters).map((value, index) => {
            if (!["region", "geoloc", "radius"].includes(value[0])) {
                return (
                    <SideBarElement
                        key={`keySidebarElement${index}`}
                        type={value[0]}
                        value={value[1]}
                        event={setActiveFilters}
                        isAdmin={isAdmin}
                    />
                );
            }
        });
    };

    const handleChangeRadius = (e) => {
        setActiveFilters((prev) => ({ ...prev, radius: e.target.value }));
    };

    const isSearchDisabled =
        (placeSection == "place" &&
            (!activeFilters.geoloc || activeFilters.radius < 1)) ||
        disabled;
    const searchText = disabled ? "Ожидайте..." : "Поиск";

    return (
        <div
            id="search-sidebar"
            style={{ display: sidebarOpened ? "flex" : "none" }}
        >
            <h3>Фильтры</h3>
            {showElems()}
            <div
                id="switch-sidebar-place-section"
                onClick={() =>
                    setPlaceSection((prev) =>
                        prev == "region" ? "place" : "region"
                    )
                }
            >
                <div
                    id="switch-sidebar-place-section-active"
                    className={placeSection == "place" ? "place" : ""}
                />
                <div className="switch-sidebar-place-section-element">
                    <h6>Регион</h6>
                </div>
                <div className="switch-sidebar-place-section-element">
                    <h6>Карта</h6>
                </div>
            </div>
            {placeSection == "region" ? (
                <SideBarElement
                    type="region"
                    value={activeFilters.region}
                    event={setActiveFilters}
                />
            ) : (
                <>
                    <div className="sidebar-element">
                        <label>Точка</label>
                        <div
                            className="sidebar-element-field"
                            style={{ width: "calc(100% - 2rem)" }}
                            onClick={() => setGeolocOpened(true)}
                        >
                            {activeFilters.geoloc
                                ? `${activeFilters.geoloc[0].toFixed(
                                      4
                                  )} ${activeFilters.geoloc[1].toFixed(4)}`
                                : "Не выбрана"}
                        </div>
                    </div>
                    <div className="sidebar-element">
                        <label>Радиус поиска {"(км)"}</label>
                        <input
                            className="sidebar-element-field"
                            style={{
                                width: "calc(100% - 2rem)",
                                cursor: "text",
                            }}
                            type="number"
                            placeholder="Не менее 1"
                            value={activeFilters.radius}
                            onChange={handleChangeRadius}
                        />
                    </div>
                </>
            )}
            <button
                disabled={isSearchDisabled}
                className="primary-button left-img"
                onClick={getAds}
            >
                <img src="/icons/search.svg" />
                {searchText}
            </button>
        </div>
    );
}

function SideBarElement({ type, value, event, isAdmin }) {
    const showOptions = () => {
        if (type == "status") {
            const dict = AD_INFO_DICT.status;
            if (!isAdmin) delete dict.closed;
            return Object.entries(dict).map((value, index) => (
                <option key={`keyOption${type}${index}`} value={value[0]}>
                    {value[1]}
                </option>
            ));
        }
        return Object.entries(AD_INFO_DICT[type]).map((value, index) => (
            <option key={`keyOption${type}${index}`} value={value[0]}>
                {value[1]}
            </option>
        ));
    };

    const handleChangeSelect = (e) => {
        event((prev) => ({ ...prev, [type]: e.target.value }));
    };

    return (
        <div className="sidebar-element">
            <label htmlFor={`${type}-${value}`}>{AD_FILTERS_DICT[type]}</label>
            <div>
                <select
                    id={`${type}-${value}`}
                    className="sidebar-element-field"
                    value={value}
                    onChange={handleChangeSelect}
                >
                    {showOptions()}
                </select>
            </div>
        </div>
    );
}

function MainContainer({
    searchText,
    setSearchText,
    ads,
    mobileView,
    setSidebarOpened,
}) {
    return (
        <div id="search-container">
            <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                <SearchBar value={searchText} event={setSearchText} />
                {mobileView && (
                    <div
                        id="switch-sidebar"
                        onClick={() => setSidebarOpened((prev) => !prev)}
                    >
                        <img src="/icons/filter.svg" />
                    </div>
                )}
            </div>
            <AdsContainer ads={ads} inProfile={false} />
        </div>
    );
}

function SearchBar({ value, event }) {
    return (
        <div id="search-bar">
            <img src="/icons/search.svg" />
            <input
                id="search-field"
                type="text"
                placeholder="Поиск животного"
                value={value}
                onChange={(e) => event(e.target.value.toLowerCase())}
            />
        </div>
    );
}

function GeolocSelection({ location, setGeolocOpened, setActiveFilters, theme }) {
    const mapRef = useRef();
    const [mapLoaded, setMapLoaded] = useState(false);

    ymapsInitPromise.then(() => setMapLoaded(true));

    const [mapLocation, setMapLocation] = useState(
        location ? location : [37.617644, 55.755819]
    );
    const [mapZoom, setMapZoom] = useState(9);

    const [geopoint, setGeopoint] = useState(location);
    useEffect(() => {
        const marker = document.querySelector(".map-marker");
        if (marker) RestartAnim(marker);
    }, [geopoint]);

    const handleClickMap = (e) => {
        if (!e?.entity) return;

        setMapLocation(e.center);
        setMapZoom(e.zoom);
        setGeopoint(e.entity.geometry.coordinates);
    };

    const handleClickApply = () => {
        setActiveFilters((prev) => ({
            ...prev,
            geoloc: geopoint,
        }));
        setGeolocOpened(false);
    };

    return (
        <div id="geoloc-container">
            <div id="search-ads-map">
                {mapLoaded && (
                    <YMap
                        location={{ center: mapLocation, zoom: mapZoom }}
                        theme={theme}
                        style={{ width: "100%", height: "100%" }}
                        ref={mapRef}
                    >
                        <YMapDefaultSchemeLayer />
                        <YMapDefaultFeaturesLayer />
                        {geopoint && (
                            <YMapMarker coordinates={geopoint}>
                                <div className="map-marker" />
                            </YMapMarker>
                        )}
                        <YMapListener onClick={handleClickMap} />
                    </YMap>
                )}
            </div>
            <div id="geoloc-window">
                <button
                    id="geoloc-button-back"
                    className="primary-button geoloc-button"
                    onClick={() => setGeolocOpened(false)}
                >
                    <img src="/icons/left-arrow.svg" />
                    Вернуться
                </button>
                <div id="geoloc-center-window">
                    <h3>Выберите место на карте</h3>
                </div>
                <button
                    disabled={!geopoint}
                    className="primary-button geoloc-button"
                    onClick={handleClickApply}
                >
                    Применить
                    <img src="/icons/right-arrow.svg" />
                </button>
            </div>
        </div>
    );
}
