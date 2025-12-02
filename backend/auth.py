from jose import jwt
from passlib.hash import bcrypt
from datetime import datetime, timedelta, timezone
from config import (
    SECRET_KEY,
    ALGORITHM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
    APP_URL,
    EMAIL_FROM,
)
import smtplib
from email.mime.text import MIMEText


def create_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password, hashed_password):
    return bcrypt.verify(plain_password, hashed_password)


def hash_password(password):
    return bcrypt.hash(password)


async def send_verification_email(email: str, token: str):
    link = f"{APP_URL}/verify?token={token}"
    body = f"""Здравствуйте!

Подтвердите email, перейдя по ссылке: {link}

С уважением,
Команда Find Your Pet
"""
    msg = MIMEText(body)
    msg["Subject"] = "Подтверждение email для FindYourPet"
    msg["From"] = EMAIL_FROM
    msg["To"] = email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, email, msg.as_string())


async def send_verification_email_change(new_email: str, token: str):
    link = f"{APP_URL}/user/verify-email-change?token={token}"
    body = f"""Здравствуйте!

Подтвердите смену email, перейдя по ссылке: {link}

С уважением,
Команда Find Your Pet
"""
    msg = MIMEText(body)
    msg["Subject"] = "Подтверждение смены email для FindYourPet"
    msg["From"] = EMAIL_FROM
    msg["To"] = new_email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, new_email, msg.as_string())


async def send_password_reset_email(email: str, token: str):
    link = f"{APP_URL}/user/verify-password-reset?token={token}"
    body = f"""Здравствуйте!

Для сброса пароля перейдите по ссылке: {link}

С уважением,
Команда Find Your Pet
"""
    msg = MIMEText(body)
    msg["Subject"] = "Сброс пароля для FindYourPet"
    msg["From"] = EMAIL_FROM
    msg["To"] = email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, email, msg.as_string())


async def send_ad_notification_email(user_email: str, ad):
    status_dict = {"lost": "потеряно", "found": "найдено"}
    type_dict = {"dog": "собака", "cat": "кошка"}
    size_dict = {"little": "маленький", "medium": "средний", "big": "большой"}

    status_text = status_dict.get(ad.status, ad.status)
    type_text = type_dict.get(ad.type, ad.type)
    size_text = size_dict.get(ad.size, ad.size)
    time_str = ad.time.strftime("%d.%m.%Y %H:%M")

    body = f"""Здравствуйте!

Рядом с вами появилось новое объявление на сайте Find Your Pet.

📋 Детали:
• Статус: {status_text}
• Животное: {type_text} ({ad.breed})
• Цвет: {ad.color}
• Размер: {size_text}
• Местоположение: {ad.location}
• Время: {time_str}

Посмотреть полную информацию вы можете на сайте Find Your Pet

Ваша помощь может быть очень важна! Если вы видели это животное или можете помочь, пожалуйста, свяжитесь с автором объявления.

С уважением,
Команда Find Your Pet
"""

    msg = MIMEText(body)
    msg["Subject"] = "Новое объявление в вашем районе"
    msg["From"] = EMAIL_FROM
    msg["To"] = user_email

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, user_email, msg.as_string())
    except Exception as e:
        print(f"Ошибка отправки email на {user_email}: {e}")
