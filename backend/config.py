from os import environ
from dotenv import load_dotenv


load_dotenv()


URL_DATABASE = environ.get("URL_DATABASE")
if not URL_DATABASE:
    raise EnvironmentError("URL_DATABASE отсутсвует в переменных окружения")

SECRET_KEY = environ.get("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 7

if not SECRET_KEY:
    raise EnvironmentError("SECRET_KEY отсутствует в переменных окружения")

SMTP_HOST = environ.get("SMTP_HOST")
SMTP_PORT = int(environ.get("SMTP_PORT", 587))
SMTP_USER = environ.get("SMTP_USER")
SMTP_PASSWORD = environ.get("SMTP_PASSWORD")
APP_URL = environ.get("APP_URL")
EMAIL_FROM = environ.get("EMAIL_FROM")

if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, APP_URL, EMAIL_FROM]):
    raise EnvironmentError("SMTP переменные отсутствуют в переменных окружения")
