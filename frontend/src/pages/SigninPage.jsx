import "./SigninPage.css";

import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

import InputLabeled from "../components/InputLabeled";

import { RestartAnim } from "../functions";
import { ApiLoginUser, ApiRegisterUser } from "../apiRequests";

export default function SigninPage() {
    const [isRegister, setIsRegister] = useState(false);
    useEffect(() => {
        const elem = document.getElementById("right-form-fields");
        RestartAnim(elem);
    }, [isRegister]);

    const emailInputRef = useRef();
    const passwordInputRef = useRef();
    const confirmPasswordRef = useRef();

    const navigate = useNavigate();

    const { setSignedIn, CallAlert } = useContext(AppContext);

    const [authButtonDisabled, setAuthButtonDisabled] = useState(false);

    const credsValid = (email, password, confirm_password) => {
        let flag = true;

        if (email == "" || !email.includes("@")) {
            flag = false;
            emailInputRef.current.classList.add("wrong-field");
            CallAlert("Неверный формат почты", "red");
        } else emailInputRef.current.classList.remove("wrong-field");

        if (password.length < 8) {
            flag = false;
            passwordInputRef.current.classList.add("wrong-field");
            CallAlert("Минимальная длина пароля - 8 символов", "red");
        } else passwordInputRef.current.classList.remove("wrong-field");

        if (confirm_password != null) {
            if (confirm_password.length < 8 || password != confirm_password) {
                flag = false;
                confirmPasswordRef.current.classList.add("wrong-field");
                if (confirm_password.length < 8)
                    CallAlert("Минимальная длина пароля - 8 символов", "red");
                else if (password != confirm_password)
                    CallAlert("Пароли не совпадают", "red");
            } else confirmPasswordRef.current.classList.remove("wrong-field");
        }

        if (!flag) setAuthButtonDisabled(false);

        return flag;
    };

    const authenticateUser = () => {
        setAuthButtonDisabled(true);
        isRegister ? RegisterUser() : LoginUser();
    };

    async function RegisterUser() {
        const email = emailInputRef.current.value;
        const password = passwordInputRef.current.value;
        const confirm_password = confirmPasswordRef.current.value;

        if (!credsValid(email, password, confirm_password)) return;

        const data = await ApiRegisterUser(email, password, confirm_password);

        setAuthButtonDisabled(false);

        if (data.success)
            CallAlert(
                "Письмо с подтверждением отправлено на вашу почту",
                "green"
            );
        else {
            if (data.detail == "Email уже зарегистрирован")
                CallAlert(
                    "Пользователь с такой почтой уже зарегистрирован",
                    "red"
                );
            else if (data.error)
                CallAlert("Ошибка при регистрации. Попробуйте позже", "red");
            else CallAlert("Неверный формат почты", "red");
        }
    }

    async function LoginUser() {
        const email = emailInputRef.current.value;
        const password = passwordInputRef.current.value;

        if (!credsValid(email, password, null)) return;

        const data = await ApiLoginUser(email, password);

        setAuthButtonDisabled(false);

        if (data.success) {
            CallAlert("Успешный вход", "green");
            setSignedIn(true);
            navigate("/");
        } else {
            if (data.detail == "Неверный email или пароль")
                CallAlert("Неверная почта или пароль", "red");
            else if (data.error)
                CallAlert("Ошибка при входе. Попробуйте позже", "red");
        }
    }

    return (
        <div id="signin-page-container" className="gradient-accent">
            <form id="signin-form">
                <BackButton />
                <div id="left-form" className="gradient-primary">
                    <h1 style={{ color: "white", opacity: 0 }}>
                        Find Your Pet
                    </h1>
                    <h2 style={{ color: "white", opacity: 0 }}>
                        Найди своего питомца
                    </h2>
                    <h6 style={{ color: "white", opacity: 0 }}>
                        Присоединяйтесь к нашему сообществу, чтобы помочь
                        животным обрести дом или найти своих потерянных
                        любимцев.
                    </h6>
                </div>
                <div id="right-form">
                    <RightFormToogleContainer
                        isRegister={isRegister}
                        setIsRegister={setIsRegister}
                    />
                    <div id="right-form-fields">
                        <InputLabeled
                            inputId="email-field"
                            type="email"
                            placeholder="example@mail.com"
                            autoComplete="email"
                            label="Почта"
                            ref={emailInputRef}
                            value={
                                emailInputRef.current
                                    ? emailInputRef.current.value
                                    : ""
                            }
                        />
                        <InputLabeled
                            inputId="password-field"
                            type="password"
                            placeholder="********"
                            autoComplete="current-password"
                            label="Пароль"
                            ref={passwordInputRef}
                            value={
                                passwordInputRef.current
                                    ? passwordInputRef.current.value
                                    : ""
                            }
                        />
                        {isRegister && (
                            <InputLabeled
                                inputId="confirm-password-field"
                                type="password"
                                placeholder="********"
                                autoComplete="new-password"
                                label="Подтвердите пароль"
                                ref={confirmPasswordRef}
                                value={
                                    confirmPasswordRef.current
                                        ? confirmPasswordRef.current.value
                                        : ""
                                }
                            />
                        )}
                    </div>
                    <AuthButton
                        isRegister={isRegister}
                        event={authenticateUser}
                        disabled={authButtonDisabled}
                    />
                    {!isRegister && <ForgetPasswordButton />}
                </div>
            </form>
        </div>
    );
}

function BackButton() {
    const navigate = useNavigate();

    return (
        <button
            id="signin-back"
            className="primary-button left-img"
            onClick={() => navigate("/")}
        >
            <img src="/icons/left-arrow.svg" />
            На главную
        </button>
    );
}

function RightFormToogleContainer({ isRegister, setIsRegister }) {
    return (
        <div id="right-form-toogle-container" className="gradient-accent">
            <div
                id="right-form-active-button"
                className={`${isRegister && "register"}`}
            />
            <div
                className={`right-form-toogle-button ${
                    !isRegister ? "active" : ""
                }`}
                onClick={() => setIsRegister(false)}
            >
                <h3>вход</h3>
            </div>
            <div
                className={`right-form-toogle-button ${
                    isRegister ? "active" : ""
                }`}
                onClick={() => setIsRegister(true)}
            >
                <h3>регистрация</h3>
            </div>
        </div>
    );
}

function AuthButton({ isRegister, event, disabled }) {
    const text = disabled
        ? "Ожидайте..."
        : isRegister
        ? "Зарегистрироваться"
        : "Войти";

    return (
        <button
            id="auth-button"
            className="primary-button right-img"
            type="button"
            disabled={disabled}
            onClick={event}
        >
            {text}
            <img src="/icons/right-arrow.svg" />
        </button>
    );
}

function ForgetPasswordButton() {
    return (
        <div id="forget-password-button">
            <h3>Забыли пароль?</h3>
        </div>
    );
}
