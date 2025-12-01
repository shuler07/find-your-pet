from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select
from datetime import datetime
from jose import JWTError, jwt
from config import SECRET_KEY, ALGORITHM
from dependencies import userDep, sessionDep
from models import Ad, User
from schemas import AdOut, AdCreate, AdFilters


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
        geoLocation=data.geoLocation,
        time=time_obj,
        ischecked=False,
    )

    session.add(ad)
    await session.commit()
    await session.refresh(ad)

    return {"success": True, "ad_id": ad.id}


@router.post("/ads")
async def get_ads(session: sessionDep, filters: AdFilters, current_user: userDep):
    try:
        query = select(Ad).where(Ad.ischecked == True)

        if current_user.role != "admin":
            query = query.where(Ad.status != "closed")

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
        if filters.region:
            ...  # HERE
        if filters.geoloc:
            ...  # AND HERE

        query = query.order_by(Ad.created_at.desc()).limit(50)
        result = await session.scalars(query)
        ads = result.all()
        ads_out = [AdOut.model_validate(ad) for ad in ads]
        return {"success": True, "ads": ads_out}
    except Exception as e:
        print("Ошибка в /ads:", e)
        return {"success": False, "message": "Ошибка на сервере"}


@router.get("/ads/user")
async def get_user_ads(session: sessionDep, current_user: userDep, uid: int = 0):
    target_user_id = uid if uid != 0 else current_user.id

    query = (
        select(Ad).
        where(Ad.user_id == target_user_id).
        order_by(Ad.created_at.desc())
    )
    if uid != 0:
        query = query.where(Ad.ischecked == True)
    if current_user.role != "admin" and uid != 0:
        query = query.where(Ad.status != "closed")
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
        .where(Ad.ischecked == False)
        .order_by(Ad.created_at.desc())
        .limit(limit)
    )
    result = await session.scalars(query)
    ads = result.all()
    ads_out = [AdOut.model_validate(ad) for ad in ads]

    return {"success": True, "ads": ads_out}


@router.get("/ad/creator")
async def get_ad_creator(
    uid: int,
    request: Request,
    session: sessionDep
):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Нет access токена")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        current_user_id = int(payload["sub"])
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401, detail="Токен недействителен или истёк")

    user = await session.get(User, uid)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    is_creator = (current_user_id == uid)

    return {
        "success": True,
        "user": {
            "name": user.name,
            "date": user.created_at.strftime("%d.%m.%Y"),
            "email": user.email,
            "phone": user.phone,
        },
        "isCreator": is_creator
    }
