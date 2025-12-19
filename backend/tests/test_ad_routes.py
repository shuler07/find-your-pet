from __future__ import annotations

from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from routes import ad as ad_routes
from schemas import (
    AdCreate,
    AdFilters,
    AdApprove,
    AdReport,
    AdUnreport,
    AdRemove,
    AdReject,
)
from models import Ad, User


class _FakeScalars:
    def __init__(self, items):
        self._items = items

    def all(self):
        return list(self._items)


class FakeSession:
    def __init__(self, *, get_map=None, scalars_results=None):
        self.get_map = get_map or {}
        self.scalars_results = list(scalars_results or [])
        self.deleted = []
        self.commits = 0

    async def get(self, model, obj_id):
        return self.get_map.get((model, obj_id))

    def add(self, _obj):
        pass

    async def commit(self):
        self.commits += 1

    async def refresh(self, _obj):
        # emulate DB assigning an id
        if getattr(_obj, "id", None) is None:
            _obj.id = 1

    async def delete(self, obj):
        self.deleted.append(obj)

    async def scalars(self, _query):
        if self.scalars_results:
            return _FakeScalars(self.scalars_results.pop(0))
        return _FakeScalars([])


@pytest.mark.asyncio
async def test_create_ad_rejects_bad_time_format():
    data = AdCreate(
        status="lost",
        type="dog",
        extras="",
        breed="beagle",
        color="brown",
        size="medium",
        distincts="",
        nickname="Rex",
        danger="safe",
        location="Somewhere",
        region="Region",
        geoLocation=[55.75, 37.61],
        time="2025-01-01",
    )

    session = FakeSession()
    current_user = type("U", (), {"id": 1})()
    result = await ad_routes.create_ad(data, session, current_user)
    assert result["success"] is False


@pytest.mark.asyncio
async def test_create_ad_success_sets_id():
    data = AdCreate(
        status="lost",
        type="dog",
        extras="",
        breed="beagle",
        color="brown",
        size="medium",
        distincts="",
        nickname="Rex",
        danger="safe",
        location="Somewhere",
        region="Region",
        geoLocation=[55.75, 37.61],
        time="01.01.2025 12:00",
    )
    session = FakeSession()
    current_user = type("U", (), {"id": 1})()
    result = await ad_routes.create_ad(data, session, current_user)
    assert result["success"] is True
    assert result["ad_id"] == 1


@pytest.mark.asyncio
async def test_get_ads_geoloc_filter(make_request_with_cookies):
    now = datetime.now(timezone.utc)
    ads = [
        # near Kremlin
        type(
            "AdObj",
            (),
            {
                "id": 1,
                "user_id": 1,
                "status": "lost",
                "type": "dog",
                "extras": "",
                "breed": "beagle",
                "color": "brown",
                "size": "medium",
                "distincts": "",
                "nickname": "Rex",
                "danger": "safe",
                "location": "Moscow",
                "region": "Moscow",
                "geoLocation": [55.752, 37.617],
                "ad_image_display_url": "",
                "ad_image_delete_url": "",
                "time": now,
                "created_at": now,
                "state": "active",
                "reported": False,
            },
        )(),
        # far away
        type(
            "AdObj",
            (),
            {
                "id": 2,
                "user_id": 2,
                "status": "found",
                "type": "cat",
                "extras": "",
                "breed": "maine_coon",
                "color": "black",
                "size": "big",
                "distincts": "",
                "nickname": "Kitty",
                "danger": "unknown",
                "location": "SPB",
                "region": "SPB",
                "geoLocation": [59.93, 30.31],
                "ad_image_display_url": "",
                "ad_image_delete_url": "",
                "time": now,
                "created_at": now,
                "state": "active",
                "reported": False,
            },
        )(),
    ]

    session = FakeSession(scalars_results=[ads])
    filters = AdFilters(geoloc=[55.75, 37.61], radius=5)
    request = make_request_with_cookies({})
    result = await ad_routes.get_ads(session=session, filters=filters, request=request)
    assert result["success"] is True
    assert len(result["ads"]) == 1
    assert result["ads"][0].id == 1


@pytest.mark.asyncio
async def test_get_ads_region_filter_path(make_request_with_cookies):
    now = datetime.now(timezone.utc)
    ads = [
        type(
            "AdObj",
            (),
            {
                "id": 3,
                "user_id": 1,
                "status": "lost",
                "type": "dog",
                "extras": "",
                "breed": "beagle",
                "color": "brown",
                "size": "medium",
                "distincts": "",
                "nickname": "Rex",
                "danger": "safe",
                "location": "Moscow",
                "region": "Moscow",
                "geoLocation": [55.75, 37.61],
                "ad_image_display_url": "",
                "ad_image_delete_url": "",
                "time": now,
                "created_at": now,
                "state": "active",
                "reported": False,
            },
        )(),
    ]
    session = FakeSession(scalars_results=[ads])
    filters = AdFilters(region="Moscow")
    request = make_request_with_cookies({})
    result = await ad_routes.get_ads(session=session, filters=filters, request=request)
    assert result["success"] is True
    assert len(result["ads"]) == 1


@pytest.mark.asyncio
async def test_get_ad_creator_returns_isCreator(make_request_with_cookies):
    now = datetime.now(timezone.utc)
    ad = type(
        "AdObj",
        (),
        {
            "id": 10,
            "user_id": 7,
            "status": "lost",
            "type": "dog",
            "extras": "",
            "breed": "beagle",
            "color": "brown",
            "size": "medium",
            "distincts": "",
            "nickname": "Rex",
            "danger": "safe",
            "location": "Moscow",
            "region": "Moscow",
            "geoLocation": [55.75, 37.61],
            "ad_image_display_url": "",
            "ad_image_delete_url": "",
            "time": now,
            "created_at": now,
            "state": "active",
            "reported": False,
        },
    )()
    user = type(
        "UserObj",
        (),
        {
            "id": 7,
            "name": "User",
            "email": "u@example.com",
            "phone": "",
            "tg": "",
            "vk": "",
            "max": "",
            "notificationsLocation": [],
            "created_at": now,
            "avatar_display_url": "",
        },
    )()

    # cookie says current user is the creator (id=7)
    import auth as auth_module
    token = auth_module.create_token({"sub": "7"}, __import__("datetime").timedelta(minutes=5))
    request = make_request_with_cookies({"access_token": token})

    session = FakeSession(get_map={(type(ad), 10): ad})

    # ad_routes expects (Ad, id) and (User, id); easiest is to serve both
    session.get_map[(Ad, 10)] = ad
    session.get_map[(User, 7)] = user

    result = await ad_routes.get_ad_creator(id=10, request=request, session=session)
    assert result["success"] is True
    assert result["isCreator"] is True


@pytest.mark.asyncio
async def test_report_and_unreport_flow():
    ad = Ad(
        user_id=1,
        status="lost",
        type="dog",
        extras="",
        breed="beagle",
        color="brown",
        size="medium",
        distincts="",
        nickname="Rex",
        danger="safe",
        location="Moscow",
        region="Moscow",
        geoLocation=[55.75, 37.61],
        time=datetime.now(timezone.utc),
    )
    ad.id = 300
    ad.state = "active"
    ad.reported = False

    session = FakeSession(get_map={(Ad, 300): ad})
    user = type("U", (), {"role": "user"})()

    ok = await ad_routes.report_ad(data=AdReport(ad_id=300), session=session, current_user=user)
    assert ok["success"] is True
    assert ad.reported is True

    admin = type("U", (), {"role": "admin"})()
    ok2 = await ad_routes.unreport_ad(data=AdUnreport(ad_id=300), session=session, current_user=admin)
    assert ok2["success"] is True
    assert ad.reported is False


@pytest.mark.asyncio
async def test_admin_can_delete_pending_ad():
    ad = Ad(
        user_id=1,
        status="lost",
        type="dog",
        extras="",
        breed="beagle",
        color="brown",
        size="medium",
        distincts="",
        nickname="Rex",
        danger="safe",
        location="Moscow",
        region="Moscow",
        geoLocation=[55.75, 37.61],
        time=datetime.now(timezone.utc),
    )
    ad.id = 400
    ad.state = "pending"
    ad.reported = False
    ad.ad_image_delete_url = ""

    session = FakeSession(get_map={(Ad, 400): ad})
    admin = type("U", (), {"role": "admin"})()
    result = await ad_routes.regect_ad(data=AdReject(ad_id=400), session=session, current_user=admin)
    assert result["success"] is True
    assert session.deleted and session.deleted[0] is ad


@pytest.mark.asyncio
async def test_get_ads_to_check_requires_admin():
    session = FakeSession(scalars_results=[[]])
    current_user = type("U", (), {"role": "user"})()
    with pytest.raises(HTTPException):
        await ad_routes.get_ads_to_check(session=session, current_user=current_user)


@pytest.mark.asyncio
async def test_approve_ad_sends_notifications(monkeypatch):
    sent_to = []

    async def fake_notify(email: str, _ad):
        sent_to.append(email)

    monkeypatch.setattr(ad_routes, "send_ad_notification_email", fake_notify)

    ad = Ad(
        user_id=1,
        status="lost",
        type="dog",
        extras="",
        breed="beagle",
        color="brown",
        size="medium",
        distincts="",
        nickname="Rex",
        danger="safe",
        location="Moscow",
        region="Moscow",
        geoLocation=[55.75, 37.61],
        time=datetime.now(timezone.utc),
    )
    ad.id = 100
    ad.state = "pending"

    u1 = User(email="near@example.com", password_hash="x", role="user")
    u1.notificationsLocation = [55.751, 37.612]

    u2 = User(email="far@example.com", password_hash="x", role="user")
    u2.notificationsLocation = [59.93, 30.31]

    session = FakeSession(
        get_map={(Ad, 100): ad},
        scalars_results=[[u1, u2]],
    )
    admin = type("U", (), {"role": "admin"})()

    result = await ad_routes.approve_ad(
        data=AdApprove(ad_id=100), session=session, current_user=admin
    )
    assert result["success"] is True
    assert ad.state == "active"
    assert "near@example.com" in sent_to
    assert "far@example.com" not in sent_to


@pytest.mark.asyncio
async def test_remove_ad_closes_it():
    ad = Ad(
        user_id=1,
        status="lost",
        type="dog",
        extras="",
        breed="beagle",
        color="brown",
        size="medium",
        distincts="",
        nickname="Rex",
        danger="safe",
        location="Moscow",
        region="Moscow",
        geoLocation=[55.75, 37.61],
        time=datetime.now(timezone.utc),
    )
    ad.id = 200
    ad.state = "active"
    session = FakeSession(get_map={(Ad, 200): ad})
    user = type("U", (), {"id": 1, "role": "user"})()

    result = await ad_routes.remove_ad(data=AdRemove(ad_id=200), session=session, current_user=user)
    assert result["success"] is True
    assert ad.state == "closed"
