import "./ProfilePage.css";

import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AdsContainer from "../components/AdsContainer";

import {
    ApiChangeEmail,
    ApiChangeName,
    ApiChangePassword,
    ApiChangePhone,
    ApiChangeVk,
    ApiChangeTg,
    ApiChangeMax,
    ApiChangeNotificationsLocation,
    ApiGetMyAds,
    ApiGetUser,
    ApiLogOutUser,
    ApiDeleteUser,
} from "../apiRequests";
import { getGeolocation } from "../functions";

export default function ProfilePage() {
    const _user = window.localStorage.getItem("fyp-user");
    const [user, setUser] = useState(
        _user
            ? JSON.parse(_user)
            : {
                  name: "",
                  date: "",
                  email: "",
                  phone: "",
                  vk: "",
                  tg: "",
                  max: "",
                  notificationsLocation: [],
              }
    );
    useEffect(() => {
        GetUser();
    }, []);

    const { CallAlert, setSignedIn } = useContext(AppContext);

    async function GetUser() {
        const data = await ApiGetUser();

        if (data.user) {
            window.localStorage.setItem("fyp-user", JSON.stringify(data.user));
            setUser(data.user);
        } else if (data.error)
            CallAlert("Ошибка при обновлении профиля", "red");
    }

    return (
        <>
            <Header />
            <div id="profile-page-container" className="page-container">
                <ProfileCard {...user} />
                <AccountCard
                    {...user}
                    setUser={setUser}
                    CallAlert={CallAlert}
                    setSignedIn={setSignedIn}
                />
                <SocialsCard
                    {...user}
                    setUser={setUser}
                    CallAlert={CallAlert}
                />
                <PostedPetsCard CallAlert={CallAlert} />
                <SettingsCard
                    CallAlert={CallAlert}
                    _notificationsLocation={user.notificationsLocation}
                    setUser={setUser}
                />
            </div>
            <Footer />
        </>
    );
}

function ProfileCard({ name, date, email, phone, vk, tg, max }) {
    return (
        <section id="profile-card-section" className="card-section">
            <div id="profile-card-avatar">
                <img src="/images/avatar-not-found.png" />
                <div id="edit-avatar-button">
                    <img src="/icons/edit-pencil.svg" />
                </div>
            </div>
            <div id="profile-card-info">
                <h2>{name}</h2>
                <h6 style={{ marginTop: "-1.25rem" }}>
                    Зарегистрирован {date}
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

function AccountCard({ setUser, name, email, phone, CallAlert, setSignedIn }) {
    return (
        <section className="card-section">
            <h5>Аккаунт</h5>
            <AccountNameField
                _name={name}
                setUser={setUser}
                CallAlert={CallAlert}
            />
            <AccountPhoneField
                _phone={phone}
                setUser={setUser}
                CallAlert={CallAlert}
            />
            <AccountEmailField _email={email} CallAlert={CallAlert} />
            <AccountPasswordField CallAlert={CallAlert} />
            <div id="account-card-row-container">
                <AccountLogOut
                    CallAlert={CallAlert}
                    setSignedIn={setSignedIn}
                />
                <AccountDelete
                    CallAlert={CallAlert}
                    setSignedIn={setSignedIn}
                />
            </div>
        </section>
    );
}

function AccountNameField({ _name, setUser, CallAlert }) {
    const editButtonRef = useRef();

    const [disabled, setDisabled] = useState(true);
    const [name, setName] = useState("");
    useEffect(() => {
        setName(_name);
    }, [_name]);

    async function ChangeName() {
        const data = await ApiChangeName(name);

        if (data.success) {
            CallAlert("Имя успешно изменено", "green");
            setUser((prev) => ({ ...prev, name }));
            window.localStorage.setItem("user_name", name);
        } else if (data.error)
            CallAlert("Ошибка при изменении имени. Попробуйте позже", "red");
    }

    const handleClickEditButton = () => {
        if (disabled) {
            editButtonRef.current.classList.remove("disabled");
        } else {
            editButtonRef.current.classList.add("disabled");
            if (name == "" || name == _name) {
                if (name == "") CallAlert("Имя слишком короткое", "red");
                else if (name == _name)
                    CallAlert("Текущее имя совпадает с новым", "red");
                setName(_name);
            } else ChangeName();
        }
        setDisabled((prev) => !prev);
    };

    return (
        <div className="profile-field-container">
            <h6>Имя</h6>
            <div className="profile-field">
                <input
                    className="profile-field-bg"
                    type={null}
                    placeholder={_name}
                    disabled={disabled}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <div
                    className="primary-button account-edit-button disabled"
                    onClick={handleClickEditButton}
                    ref={editButtonRef}
                >
                    <img />
                    {disabled ? "Изменить" : "Сохранить"}
                </div>
            </div>
        </div>
    );
}

function AccountPhoneField({ _phone, setUser, CallAlert }) {
    const editButtonRef = useRef();

    const [disabled, setDisabled] = useState(true);
    const [phone, setPhone] = useState(_phone);
    useEffect(() => {
        setPhone(_phone);
    }, [_phone]);

    async function ChangePhone() {
        const data = await ApiChangePhone(phone);

        if (data.success) {
            CallAlert("Телефон успешно изменен", "green");
            setUser((prev) => ({ ...prev, phone }));
            window.localStorage.setItem("user_phone", phone);
        } else if (data.error)
            CallAlert("Ошибка при изменении телефона. Попробуйте позже", "red");
    }

    const handleClickEditButton = () => {
        if (disabled) {
            editButtonRef.current.classList.remove("disabled");
        } else {
            editButtonRef.current.classList.add("disabled");
            if (
                phone.length != 12 ||
                !phone.startsWith("+7") ||
                phone == _phone
            ) {
                if (phone.length != 12 || !phone.startsWith("+7"))
                    CallAlert("Неверный формат телефона", "red");
                else if (phone == _phone)
                    CallAlert("Текущий телефон совпадает с новым", "red");
                setPhone(_phone);
            } else ChangePhone();
        }
        setDisabled((prev) => !prev);
    };

    return (
        <div className="profile-field-container">
            <h6>Телефон</h6>
            <div className="profile-field">
                <input
                    className="profile-field-bg"
                    type="phone"
                    placeholder={_phone ? _phone : "Не указан"}
                    disabled={disabled}
                    value={phone ? phone : ""}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <div
                    className="primary-button account-edit-button disabled"
                    onClick={handleClickEditButton}
                    ref={editButtonRef}
                >
                    <img />
                    {disabled ? "Изменить" : "Сохранить"}
                </div>
            </div>
        </div>
    );
}

function AccountEmailField({ _email, CallAlert }) {
    const editButtonRef = useRef();

    const [disabled, setDisabled] = useState(true);
    const [email, setEmail] = useState(_email);
    useEffect(() => {
        setEmail(_email);
    }, [_email]);

    const { setSignedIn } = useContext(AppContext);

    async function ChangeEmail() {
        const data = await ApiChangeEmail(email);

        if (data.success) {
            setSignedIn(false);
            CallAlert(
                "Письмо с подтверждением отправлено на новую почту",
                "green"
            );
            window.localStorage.removeItem("fyp-user");
            window.location.pathname = "/";
        } else if (data.error)
            CallAlert("Ошибка при изменении почты. Попробуйте позже", "red");
    }

    const handleClickEditButton = () => {
        if (disabled) {
            editButtonRef.current.classList.remove("disabled");
        } else {
            editButtonRef.current.classList.add("disabled");
            if (email == "" || !email.includes("@") || email == _email) {
                if (email == "" || !email.includes("@"))
                    CallAlert("Неверный формат почты", "red");
                else if (email == _email)
                    CallAlert("Текущая почты совпадает с новой", "red");
                setEmail(_email);
            } else ChangeEmail();
        }
        setDisabled((prev) => !prev);
    };

    return (
        <div className="profile-field-container">
            <h6>Почта</h6>
            <div className="profile-field">
                <input
                    className="profile-field-bg"
                    type="email"
                    placeholder={_email}
                    disabled={disabled}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <div
                    className="primary-button account-edit-button disabled"
                    onClick={handleClickEditButton}
                    ref={editButtonRef}
                >
                    <img />
                    {disabled ? "Изменить" : "Сохранить"}
                </div>
            </div>
        </div>
    );
}

function AccountPasswordField({ CallAlert }) {
    const editButtonRef = useRef();

    const [disabled, setDisabled] = useState(true);

    const [curPassword, setCurPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    async function ChangePassword() {
        const data = await ApiChangePassword(curPassword, newPassword);

        if (data.success) CallAlert("Пароль успешно изменен", "green");
        else if (data.error)
            CallAlert("Ошибка при изменении пароля. Попробуйте позже", "red");
        else CallAlert("Неверный пароль", "red");
    }

    const handleClickEditButton = () => {
        if (disabled) {
            editButtonRef.current.classList.remove("disabled");
        } else {
            editButtonRef.current.classList.add("disabled");
            if (
                curPassword.length < 8 ||
                newPassword.length < 8 ||
                curPassword == newPassword
            ) {
                if (curPassword.length < 8 || newPassword.length < 8)
                    CallAlert("Минимальная длина пароля - 8 символов", "red");
                else if (curPassword == newPassword)
                    CallAlert("Текущий и новый пароль совпадают", "red");
                setCurPassword("");
                setNewPassword("");
            } else ChangePassword();
        }
        setDisabled((prev) => !prev);
    };

    return (
        <div className="profile-field-container">
            <h6>Пароль</h6>
            <div className="profile-field">
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: ".25rem",
                    }}
                >
                    <input
                        className="profile-field-bg"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Текущий пароль"
                        disabled={disabled}
                        value={curPassword}
                        onChange={(e) => setCurPassword(e.target.value)}
                    />
                    {!disabled && (
                        <input
                            className="profile-field-bg"
                            type="password"
                            placeholder="Новый пароль"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    )}
                </div>
                <div
                    className="primary-button account-edit-button disabled"
                    onClick={handleClickEditButton}
                    ref={editButtonRef}
                >
                    <img />
                    {disabled ? "Изменить" : "Сохранить"}
                </div>
            </div>
        </div>
    );
}

function AccountLogOut({ CallAlert, setSignedIn }) {
    const navigate = useNavigate();

    async function LogOut() {
        const data = await ApiLogOutUser();

        if (data.success) {
            CallAlert("Успешный выход из аккаунта", "green");
            setSignedIn(false);
            window.localStorage.removeItem("fyp-user");
            navigate("/");
        } else if (data.error)
            CallAlert(
                "Ошибка при попытке выхода из аккаунта. Попробуйте позже",
                "red"
            );
    }

    return (
        <div className="profile-field-container" style={{ flexGrow: 1 }}>
            <h6>Выход</h6>
            <div className="profile-field">
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
    );
}

function AccountDelete({ CallAlert, setSignedIn }) {
    const navigate = useNavigate();

    async function DeleteAccount() {
        const data = await ApiDeleteUser();

        if (data.success) {
            CallAlert("Аккаунт успешно удален", "green");
            setSignedIn(false);
            navigate("/");
        } else if (data.error) CallAlert("Ошибка при удалении аккаунта", "red");
    }

    return (
        <div className="profile-field-container" style={{ flexGrow: 1 }}>
            <h6>Удалить</h6>
            <div className="profile-field">
                <button
                    className="primary-button bright-red left-img"
                    style={{ width: "100%" }}
                    onClick={() => DeleteAccount()}
                >
                    <img src="/icons/log_out.svg" />
                    Удалить аккаунт
                </button>
            </div>
        </div>
    );
}

function SocialsCard({ setUser, vk, tg, max, CallAlert }) {
    return (
        <section className="card-section">
            <h5>Социальные сети</h5>
            <AccountVkField _vk={vk} setUser={setUser} CallAlert={CallAlert} />
            <AccountTgField _tg={tg} setUser={setUser} CallAlert={CallAlert} />
            <AccountMaxField
                _max={max}
                setUser={setUser}
                CallAlert={CallAlert}
            />
        </section>
    );
}

function AccountVkField({ _vk, setUser, CallAlert }) {
    const editButtonRef = useRef();

    const [disabled, setDisabled] = useState(true);
    const [vk, setVk] = useState(_vk);
    useEffect(() => {
        setVk(_vk);
    }, [_vk]);

    async function ChangeVk() {
        const data = await ApiChangeVk(vk);

        if (data.success) {
            CallAlert("ВКонтакте успешно изменен", "green");
            setUser((prev) => ({ ...prev, vk }));
        } else if (data.error)
            CallAlert(
                "Ошибка при изменении ВКонтакте. Попробуйте позже",
                "red"
            );
    }

    const handleClickEditButton = () => {
        if (disabled) {
            editButtonRef.current.classList.remove("disabled");
        } else {
            editButtonRef.current.classList.add("disabled");
            if (vk.length == 0 || vk == _vk) {
                if (vk.length == 0)
                    CallAlert("Неверный формат ВКонтакте", "red");
                else if (vk == _vk)
                    CallAlert("Текущий ВКонтакте совпадает с новым", "red");
                setVk(_vk);
            } else ChangeVk();
        }
        setDisabled((prev) => !prev);
    };

    return (
        <div className="profile-field-container">
            <h6>ВКонтакте</h6>
            <div className="profile-field">
                <input
                    className="profile-field-bg"
                    type="text"
                    placeholder={_vk || "Не указан"}
                    disabled={disabled}
                    value={vk || ""}
                    onChange={(e) => setVk(e.target.value)}
                />
                <div
                    className="primary-button account-edit-button disabled"
                    onClick={handleClickEditButton}
                    ref={editButtonRef}
                >
                    <img />
                    {disabled ? "Изменить" : "Сохранить"}
                </div>
            </div>
        </div>
    );
}

function AccountTgField({ _tg, setUser, CallAlert }) {
    const editButtonRef = useRef();

    const [disabled, setDisabled] = useState(true);
    const [tg, setTg] = useState(_tg);
    useEffect(() => {
        setTg(_tg);
    }, [_tg]);

    async function ChangeTg() {
        const data = await ApiChangeTg(tg);

        if (data.success) {
            CallAlert("Telegram успешно изменен", "green");
            setUser((prev) => ({ ...prev, tg }));
        } else if (data.error)
            CallAlert("Ошибка при изменении Telegram. Попробуйте позже", "red");
    }

    const handleClickEditButton = () => {
        if (disabled) {
            editButtonRef.current.classList.remove("disabled");
        } else {
            editButtonRef.current.classList.add("disabled");
            if (tg.length == 0 || tg == _tg) {
                if (tg.length == 0)
                    CallAlert("Неверный формат Telegram", "red");
                else if (tg == _tg)
                    CallAlert("Текущий Telgram совпадает с новым", "red");
                setTg(_tg);
            } else ChangeTg();
        }
        setDisabled((prev) => !prev);
    };

    return (
        <div className="profile-field-container">
            <h6>Telegram</h6>
            <div className="profile-field">
                <input
                    className="profile-field-bg"
                    type="text"
                    placeholder={_tg || "Не указан"}
                    disabled={disabled}
                    value={tg || ""}
                    onChange={(e) => setTg(e.target.value)}
                />
                <div
                    className="primary-button account-edit-button disabled"
                    onClick={handleClickEditButton}
                    ref={editButtonRef}
                >
                    <img />
                    {disabled ? "Изменить" : "Сохранить"}
                </div>
            </div>
        </div>
    );
}

function AccountMaxField({ _max, setUser, CallAlert }) {
    const editButtonRef = useRef();

    const [disabled, setDisabled] = useState(true);
    const [max, setMax] = useState(_max);
    useEffect(() => {
        setMax(_max);
    }, [_max]);

    async function ChangeMax() {
        const data = await ApiChangeMax(max);

        if (data.success) {
            CallAlert("Max успешно изменен", "green");
            setUser((prev) => ({ ...prev, max }));
        } else if (data.error)
            CallAlert("Ошибка при изменении Max. Попробуйте позже", "red");
    }

    const handleClickEditButton = () => {
        if (disabled) {
            editButtonRef.current.classList.remove("disabled");
        } else {
            editButtonRef.current.classList.add("disabled");
            if (max.length == 0 || max == _max) {
                if (max.length == 0) CallAlert("Неверный формат Max", "red");
                else if (max == _max)
                    CallAlert("Текущий Max совпадает с новым", "red");
                setMax(_max);
            } else ChangeMax();
        }
        setDisabled((prev) => !prev);
    };

    return (
        <div className="profile-field-container">
            <h6>Max</h6>
            <div className="profile-field">
                <input
                    className="profile-field-bg"
                    type="text"
                    placeholder={_max || "Не указан"}
                    disabled={disabled}
                    value={max || ""}
                    onChange={(e) => setMax(e.target.value)}
                />
                <div
                    className="primary-button account-edit-button disabled"
                    onClick={handleClickEditButton}
                    ref={editButtonRef}
                >
                    <img />
                    {disabled ? "Изменить" : "Сохранить"}
                </div>
            </div>
        </div>
    );
}

function PostedPetsCard({ CallAlert }) {
    const [myAds, setMyAds] = useState([]);
    useEffect(() => {
        GetMyAds();
    }, []);

    async function GetMyAds() {
        const data = await ApiGetMyAds();

        if (data.success) setMyAds(data.ads);
        else if (data.error)
            CallAlert(
                "Ошибка при получении ваших объявлений. Попробуйте позже",
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
                    {myAds.length}
                </span>
            </h5>
            <AdsContainer ads={myAds} inProfile={true} />
        </section>
    );
}

function SettingsCard({ CallAlert, _notificationsLocation, setUser }) {
    const [notificationsLocation, setNotificationsLocation] = useState(
        _notificationsLocation
    );

    const handleClickNotifications = () => {
        if (notificationsLocation.length == 0) GetGeolocation();
        else ChangeNotificationsLocation();
    };

    function GetGeolocation() {
        const data = getGeolocation();

        if (data) ChangeNotificationsLocation(geoloc);
        else
            CallAlert(
                "Получение геолокации не поддерживается в вашем браузере",
                "red"
            );
    }

    async function ChangeNotificationsLocation(location) {
        const data = await ApiChangeNotificationsLocation(location);

        if (data.success) {
            setNotificationsLocation(location);
            setUser((prev) => ({ ...prev, notificationsLocation: location }));
        } else if (data.error)
            CallAlert("Что-то пошло не так. Попробуйте позже", "red");
    }

    return (
        <section id="settings-card-section" className="card-section">
            <h5>Настройки</h5>
            <div className="profile-field-container">
                <h6>Уведомления</h6>
                <div className="profile-field">
                    <button
                        className={`profile-field-checkbox ${
                            notificationsLocation.length != 0 && "active"
                        }`}
                        onClick={handleClickNotifications}
                    >
                        <img />
                    </button>
                    <div className="profile-field-bg">
                        <h6>
                            Получать уведомления о новых объявлениях рядом с
                            вами
                        </h6>
                    </div>
                </div>
            </div>
        </section>
    );
}
