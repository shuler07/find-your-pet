from math import radians, cos, sin, asin, sqrt
import smtplib
from email.mime.text import MIMEText
import httpx

from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select
from datetime import datetime
from jose import JWTError, jwt
from config import (
    EMAIL_FROM,
    SECRET_KEY,
    ALGORITHM,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
)
from dependencies import userDep, sessionDep
from models import Ad, User
from schemas import AdOut, AdCreate, AdFilters, AdApprove, AdReject, AdRemove, AdReport, UserOut
from auth import send_ad_notification_email

router = APIRouter()


@router.post("/ads/create")
async def create_ad(data: AdCreate, session: sessionDep, current_user: userDep):
    try:
        time_obj = datetime.strptime(data.time, "%d.%m.%Y %H:%M")
    except ValueError:
        return {"success": False, "message": "Неверный формат времени"}

    ad = Ad(
        user_id=current_user.id,
        status=data.status,
        type=data.type,
        extras=data.extras,
        breed=data.breed,
        color=data.color,
        size=data.size,
        distincts=data.distincts,
        nickname=data.nickname,
        danger=data.danger,
        location=data.location,
        region=data.region,
        geoLocation=data.geoLocation,
        time=time_obj,
        state="pending",
        ad_image_delete_url=data.ad_image_delete_url,
        ad_image_display_url=data.ad_image_display_url,
    )

    session.add(ad)
    await session.commit()
    await session.refresh(ad)

    return {"success": True, "ad_id": ad.id}


@router.post("/ads")
async def get_ads(session: sessionDep, filters: AdFilters, request: Request):
    try:
        current_user = None
        token = request.cookies.get("access_token")
        if token:
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = int(payload["sub"])
                current_user = await session.get(User, user_id)
            except (JWTError, ValueError, TypeError):
                pass

        query = select(Ad).where(Ad.state != "pending")

        if not current_user or current_user.role == "user":
            query = query.where(Ad.state != "closed")

        if filters.status:
            query = query.where(Ad.status == filters.status)
        if filters.type:
            query = query.where(Ad.type == filters.type)
        if filters.breed:
            query = query.where(Ad.breed == filters.breed)
        if filters.size:
            query = query.where(Ad.size == filters.size)
        if filters.danger:
            query = query.where(Ad.danger == filters.danger)

        use_geoloc_filter = False
        if filters.geoloc and filters.geoloc != "any":
            if isinstance(filters.geoloc, list) and len(filters.geoloc) == 2:
                use_geoloc_filter = True
        elif filters.region:
            query = query.where(Ad.region == filters.region)

        query = query.order_by(Ad.created_at.desc()).limit(50)
        result = await session.scalars(query)
        ads = result.all()

        if use_geoloc_filter and filters.radius:
            center_lat, center_lon = filters.geoloc[0], filters.geoloc[1]
            radius_km = filters.radius
            filtered_ads = []
            for ad in ads:
                if ad.geoLocation and len(ad.geoLocation) == 2:
                    ad_lat, ad_lon = ad.geoLocation[0], ad.geoLocation[1]
                    distance = haversine(center_lat, center_lon, ad_lat, ad_lon)
                    if distance <= radius_km:
                        filtered_ads.append(ad)
            ads = filtered_ads

        ads_out = [AdOut.model_validate(ad) for ad in ads]
        return {"success": True, "ads": ads_out}
    except Exception as e:
        print("Ошибка в /ads:", e)
        return {"success": False, "message": "Ошибка на сервере"}


@router.get("/ads/user")
async def get_user_ads(session: sessionDep, current_user: userDep, uid: int = 0):
    target_user_id = uid if uid != 0 else current_user.id

    query = (
        select(Ad).where(Ad.user_id == target_user_id).order_by(Ad.created_at.desc())
    )
    if uid != 0:
        query = query.where(Ad.state != "pending")
    result = await session.scalars(query)
    ads = result.all()
    ads_out = [AdOut.model_validate(ad) for ad in ads]
    return {"success": True, "ads": ads_out}


@router.get("/ads/to_check")
async def get_ads_to_check(session: sessionDep, current_user: userDep, limit: int = 20):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ запрещен")

    query = (
        select(Ad)
        .where(Ad.state == "pending")
        .order_by(Ad.created_at.desc())
        .limit(limit)
    )
    result = await session.scalars(query)
    ads = result.all()
    ads_out = [AdOut.model_validate(ad) for ad in ads]

    return {"success": True, "ads": ads_out}


@router.get("/ad/data")
async def get_ad_creator(id: int, request: Request, session: sessionDep):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Нет access токена")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        current_user_id = int(payload["sub"])
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Токен недействителен или истёк")

    ad = await session.get(Ad, id)
    if not ad:
        raise HTTPException(status_code=404, detail="Объявление не найдено")

    user = await session.get(User, ad.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    valid_user = UserOut.model_validate(user)
    valid_ad = AdOut.model_validate(ad)
    is_creator = current_user_id == ad.user_id

    # Форматируем дату создания пользователя
    valid_user.created_at = valid_user.created_at.strftime("%d.%m.%Y")

    # Форматируем время потери/нахождения питомца
    valid_ad.time = valid_ad.time.strftime("%d.%m.%Y %H:%M")

    return {
        "success": True,
        "ad": valid_ad,
        "user": valid_user,
        "isCreator": is_creator,
    }


@router.delete("/ad/delete")
async def regect_ad(data: AdReject, session: sessionDep, current_user: userDep):
    ad = await session.get(Ad, data.ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Объявление не найдено")

    if current_user.role != "admin":
        if ad.user_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="Нет прав на удаление чужого объявления"
            )

        if ad.state == "active":
            raise HTTPException(
                status_code=403, detail="Нельзя удалить активное объявление"
            )
    else:
        if ad.state != "pending":
            raise HTTPException(
                status_code=403,
                detail="Администратор может удалять только на проверке объявления",
            )

    if ad.ad_image_delete_url:
        try:
            async with httpx.AsyncClient() as client:
                await client.delete(ad.ad_image_delete_url)
                print(f"Изображение удалено: {ad.ad_image_delete_url}")
        except Exception as e:
            print(f"Ошибка при удалении изображения: {e}")

    await session.delete(ad)
    await session.commit()

    return {"success": True}


@router.put("/ad/remove")
async def remove_ad(data: AdRemove, session: sessionDep, current_user: userDep):
    ad = await session.get(Ad, data.ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Объявление не найдено")

    ad.state = "closed"
    await session.commit()

    return {"success": True}


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    )
    return R * 2 * asin(sqrt(a))


@router.put("/ad/approve")
async def approve_ad(data: AdApprove, session: sessionDep, current_user: userDep):
    ad = await session.get(Ad, data.ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Объявление не найдено")

    ad.state = "active"
    await session.commit()

    if ad.geoLocation and len(ad.geoLocation) == 2:
        ad_lat, ad_lon = ad.geoLocation[0], ad.geoLocation[1]

        query = select(User).where(User.notificationsLocation != None)
        result = await session.scalars(query)
        users = result.all()

        notified_emails = []
        for user in users:
            if not user.notificationsLocation or len(user.notificationsLocation) != 2:
                continue

            user_lat, user_lon = (
                user.notificationsLocation[0],
                user.notificationsLocation[1],
            )
            distance = haversine(ad_lat, ad_lon, user_lat, user_lon)
            print(distance)
            if distance <= 10:
                await send_ad_notification_email(user.email, ad)
                notified_emails.append(user.email)

        print(
            f"Уведомления по email отправлены {len(notified_emails)} пользователям: {notified_emails}"
        )

    return {"success": True}


@router.put("/ad/report")
async def report_ad(data: AdReport, session: sessionDep, current_user: userDep):
    ad = await session.get(Ad, data.ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Объявление не найдено")

    if ad.state != "active":
        raise HTTPException(
            status_code=400, detail="Можно пожаловаться только на активное объявление"
        )

    ad.reported = True
    await session.commit()

    return {"success": True}


@router.get("/ads/reported")
async def get_reported_ads(session: sessionDep, current_user: userDep, limit: int = 20):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ запрещен")

    query = (
        select(Ad)
        .where(Ad.reported == True)
        .order_by(Ad.created_at.desc())
        .limit(limit)
    )
    result = await session.scalars(query)
    ads = result.all()
    ads_out = [AdOut.model_validate(ad) for ad in ads]

    return {"success": True, "ads": ads_out}
