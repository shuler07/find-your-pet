import "./AdminPage.css";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { ApiGetAdsToCheck, ApiGetReportedAds } from "../apiRequests";

export default function AdminPage() {
    const { CallAlert } = useContext(AppContext);

    const [adsToCheck, setAdsToCheck] = useState([
        {
            contactName: "shuler7",
            contactEmail: "vitalisobolevggg@gmail.com",
            created_at: "11.26.2025 20:58",
        },
    ]);
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
                <AdsToCheckSection ads={adsToCheck} />
                <h2>Объявления с жалобой</h2>
                <ReportedAdsSection ads={reportedAds} />
            </div>
            <Footer />
        </>
    );
}

function AdsToCheckSection({ ads }) {
    const getHead = () => {
        if (ads.length > 0) {
            return (
                <tr>
                    <th>Имя</th>
                    <th>Почта</th>
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
                    <td>{ad.contactName}</td>
                    <td>{ad.contactEmail}</td>
                    <td>{ad.created_at}</td>
                    <td className="admin-table-details-column">
                        <button className="primary-button red left-img in-table" onClick={handleClickRemove}>
                            <img src="/icons/remove.svg" />
                            Удалить
                        </button>
                        <button className="primary-button left-img in-table" onClick={handleClickPost}>
                            <img src="/icons/upload.svg" />
                            Опубликовать
                        </button>
                        <button className="primary-button left-img in-table" onClick={handleClickShow}>
                            <img src="/icons/eye.svg" />
                            Посмотреть
                        </button>
                    </td>
                </tr>
            ));
        }
    };

    const handleClickRemove = () => {

    };

    const handleClickPost = () => {

    };

    const handleClickShow = () => {

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

function ReportedAdsSection({ ads }) {
    const getHead = () => {
        if (ads.length > 0) {
            return (
                <tr>
                    <th>Имя</th>
                    <th>Почта</th>
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
    
    const handleClickRemove = () => {

    };

    const handleClickStay = () => {

    };

    const handleClickShow = () => {

    };

    const getRows = () => {
        if (ads.length > 0) {
            return ads.map((ad, index) => (
                <tr key={`keyAdsToCheck${index}`}>
                    <td>{ad.contactName}</td>
                    <td>{ad.contactEmail}</td>
                    <td>{ad.created_at}</td>
                    <td className="admin-table-details-column">
                        <button className="primary-button red left-img in-table" onClick={handleClickRemove}>
                            <img src="/icons/remove.svg" />
                            Удалить
                        </button>
                        <button className="primary-button left-img in-table" onClick={handleClickStay}>
                            <img src="/icons/close.svg" />
                            Оставить
                        </button>
                        <button className="primary-button left-img in-table" onClick={handleClickShow}>
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
