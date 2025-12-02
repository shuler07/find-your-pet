import "./AdminPage.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

import Header from "../components/Header";
import Footer from "../components/Footer";

import {
    ApiGetAdsToCheck,
    ApiGetReportedAds,
    ApiApproveAd,
    ApiDeleteAd,
    ApiLogOutUser
} from "../apiRequests";

export default function AdminPage() {
    const { CallAlert, setSignedIn, setIsAdmin } = useContext(AppContext);
    const navigate = useNavigate();

    const [adsToCheck, setAdsToCheck] = useState([]);
    const [reportedAds, setReportedAds] = useState([]);
    useEffect(() => {
        GetAdsToCheck();
        GetReportedAds();
    }, []);

    async function GetAdsToCheck() {
        const data = await ApiGetAdsToCheck();

        if (data.success) setAdsToCheck(data.ads);
        else if (data.error)
            CallAlert(
                "Ошибка при получении объявлений на проверке. Попробуйте позже",
                "red"
            );
    }

    async function GetReportedAds() {
        const data = await ApiGetReportedAds();

        if (data.success) setReportedAds(data.ads);
        else if (data.error)
            CallAlert(
                "Ошибка при получении объявлений с жалобой. Попробуйте позже",
                "red"
            );
    }

    async function LogOut() {
        const data = await ApiLogOutUser();

        if (data.success) {
            CallAlert("Успешный выход из аккаунта", "green");
            setSignedIn(false);
            setIsAdmin(false);
            navigate("/");
        } else if (data.error)
            CallAlert(
                "Ошибка при попытке выхода из аккаунта. Попробуйте позже",
                "red"
            );
    }


    return (
        <>
            <Header />
            <div id="admin-page-container" className="page-container">
                <h2>Мониторинг</h2>
                <section id="admin-page-stats-section">
                    <div className="about-block">
                        <img src="/icons/ad-check.svg" />
                        <div>
                            <h6>Объявления на проверке</h6>
                            <h3>{adsToCheck.length}</h3>
                        </div>
                    </div>
                    <div className="about-block">
                        <img src="/icons/report-flag.svg" />
                        <div>
                            <h6>Жалобы</h6>
                            <h3>{reportedAds.length}</h3>
                        </div>
                    </div>
                </section>
                <h2>Объявления на проверке</h2>
                <AdsToCheckSection
                    ads={adsToCheck}
                    GetAdsToCheck={GetAdsToCheck}
                    CallAlert={CallAlert}
                />
                <h2>Объявления с жалобой</h2>
                <ReportedAdsSection ads={reportedAds} CallAlert={CallAlert} />
                <div>
                    <button
                        className="primary-button red left-img"
                        style={{ width: "100%" }}
                        onClick={() => LogOut()}
                    >
                        <img src="/icons/log-out.svg" />
                        Выйти из аккаунта
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

function AdsToCheckSection({ ads, GetAdsToCheck, CallAlert }) {
    const navigate = useNavigate();

    const getHead = () => {
        if (ads.length > 0) {
            return (
                <tr>
                    <th>UID</th>
                    <th>Дата создания</th>
                    <th style={{ textAlign: "end" }}>Действия</th>
                </tr>
            );
        } else {
            return (
                <tr>
                    <th style={{ textAlign: "center" }}>
                        Обьявлений на проверке нет
                    </th>
                </tr>
            );
        }
    };

    const getRows = () => {
        if (ads.length > 0) {
            return ads.map((ad, index) => (
                <tr key={`keyAdsToCheck${index}`}>
                    <td>{ad.user_id}</td>
                    <td>{ad.created_at}</td>
                    <td className="admin-table-details-column">
                        <button
                            className="primary-button red left-img in-table"
                            onClick={() => handleClickRemove(ad.id)}
                        >
                            <img src="/icons/trash.svg" />
                            Удалить
                        </button>
                        <button
                            className="primary-button left-img in-table"
                            onClick={() => handleClickPost(ad.id)}
                        >
                            <img src="/icons/upload.svg" />
                            Опубликовать
                        </button>
                        <button
                            className="primary-button left-img in-table"
                            onClick={() => handleClickShow(ad.id)}
                        >
                            <img src="/icons/eye.svg" />
                            Посмотреть
                        </button>
                    </td>
                </tr>
            ));
        }
    };

    const handleClickRemove = async (id) => {
        const data = await ApiDeleteAd(id);

        if (data.success) {
            GetAdsToCheck();
            CallAlert("Объявление удалено", "green");
        } else if (data.error)
            CallAlert(
                "Ошибка при удалении объявления. Попробуйте позже",
                "red"
            );
    };

    const handleClickPost = async (id) => {
        const data = await ApiApproveAd(id);

        if (data.success) {
            GetAdsToCheck();
            CallAlert("Объявление одобрено", "green");
        } else if (data.error)
            CallAlert(
                "Ошибка при одобрении объявления. Попробуйте позже",
                "red"
            );
    };

    const handleClickShow = (id) => navigate(`/ad/${id}`);

    return (
        <section className="table-section">
            <table className="admin-table">
                <thead>{getHead()}</thead>
                <tbody>{getRows()}</tbody>
            </table>
        </section>
    );
}

function ReportedAdsSection({ ads }) {
    const getHead = () => {
        if (ads.length > 0) {
            return (
                <tr>
                    <th>UID</th>
                    <th>Дата создания</th>
                    <th style={{ textAlign: "end" }}>Действия</th>
                </tr>
            );
        } else {
            return (
                <tr>
                    <th style={{ textAlign: "center" }}>
                        Объявлений с жалобами нет
                    </th>
                </tr>
            );
        }
    };

    const handleClickRemove = () => {};

    const handleClickStay = () => {};

    const handleClickShow = () => {};

    const getRows = () => {
        if (ads.length > 0) {
            return ads.map((ad, index) => (
                <tr key={`keyAdsToCheck${index}`}>
                    <td>{ad.user_id}</td>
                    <td>{ad.created_at}</td>
                    <td className="admin-table-details-column">
                        <button
                            className="primary-button red left-img in-table"
                            onClick={handleClickRemove}
                        >
                            <img src="/icons/remove.svg" />
                            Удалить
                        </button>
                        <button
                            className="primary-button left-img in-table"
                            onClick={handleClickStay}
                        >
                            <img src="/icons/close.svg" />
                            Оставить
                        </button>
                        <button
                            className="primary-button left-img in-table"
                            onClick={handleClickShow}
                        >
                            <img src="/icons/upload.svg" />
                            Посмотреть
                        </button>
                    </td>
                </tr>
            ));
        }
    };

    return (
        <section className="table-section">
            <table className="admin-table">
                <thead>{getHead()}</thead>
                <tbody>{getRows()}</tbody>
            </table>
        </section>
    );
}
