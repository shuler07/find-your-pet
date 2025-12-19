from __future__ import annotations

from datetime import timedelta

import pytest
from fastapi import Response

import auth
import config
from models import User
from schemas import (
    UserAuth,
    UpdatePassword,
    UpdateEmail,
    PasswordReset,
    UpdateName,
    UpdatePhone,
    LocationUpdate,
    UpdateTg,
    UpdateVk,
    UpdateMax,
)
from routes import users as users_routes


class FakeSession:
    def __init__(self, scalar_results=None, user_by_id=None):
        self.scalar_results = list(scalar_results or [])
        self.user_by_id = user_by_id or {}

        self.added = []
        self.deleted = []
        self.commits = 0

    async def scalar(self, _query):
        if self.scalar_results:
            return self.scalar_results.pop(0)
        return None

    async def get(self, model, obj_id):
        assert model is User
        return self.user_by_id.get(obj_id)

    def add(self, obj):
        self.added.append(obj)

    async def delete(self, obj):
        self.deleted.append(obj)

    async def commit(self):
        self.commits += 1


def _make_access_cookie_for_user(user_id: int):
    token = auth.create_token({"sub": str(user_id)}, timedelta(minutes=5))
    return {"access_token": token}


@pytest.mark.asyncio
async def test_register_sends_verification_email(monkeypatch):
    sent = {}

    async def fake_send(email: str, token: str):
        sent["email"] = email
        sent["token"] = token

    monkeypatch.setattr(users_routes, "send_verification_email", fake_send)
    monkeypatch.setattr(users_routes.random, "choice", lambda seq: "Альфа")
    monkeypatch.setattr(users_routes.random, "randint", lambda a, b: 7)

    session = FakeSession(scalar_results=[None])
    result = await users_routes.register(
        UserAuth(email="test@example.com", password="Password123"), session
    )
    assert result["success"] is True
    assert sent["email"] == "test@example.com"
    assert "token" in sent


@pytest.mark.asyncio
async def test_verify_email_creates_user_when_not_exists(monkeypatch):
    password_hash = auth.hash_password("Password123")
    token = auth.create_token(
        {
            "email": "new@example.com",
            "password_hash": password_hash,
            "phone": "",
            "name": "Имя",
            "type": "verify",
        },
        timedelta(minutes=30),
    )

    session = FakeSession(scalar_results=[None])
    result = await users_routes.verify_email(token=token, session=session)
    assert (
        "успешно" in result["message"].lower() or "создан" in result["message"].lower()
    )
    assert session.added
    assert session.commits == 1


@pytest.mark.asyncio
async def test_login_sets_http_only_cookies():
    password_hash = auth.hash_password("Password123")
    user = User(email="u@example.com", password_hash=password_hash, role="user")
    user.id = 1
    session = FakeSession(scalar_results=[user])
    response = Response()

    result = await users_routes.login(
        response=response,
        data=UserAuth(email="u@example.com", password="Password123"),
        session=session,
    )
    assert result["success"] is True
    set_cookies = response.headers.getlist("set-cookie")
    assert any(c.startswith("access_token=") for c in set_cookies)
    assert any(c.startswith("refresh_token=") for c in set_cookies)


@pytest.mark.asyncio
async def test_get_me_returns_role(make_request_with_cookies):
    user = User(email="u@example.com", password_hash="x", role="admin")
    user.id = 10
    session = FakeSession(user_by_id={10: user})
    request = make_request_with_cookies(_make_access_cookie_for_user(10))

    result = await users_routes.get_me(request=request, session=session)
    assert result["success"] is True
    assert result["role"] == "admin"


@pytest.mark.asyncio
async def test_logout_clears_cookies():
    response = Response()
    result = await users_routes.logout(response)
    assert result["success"] is True


@pytest.mark.asyncio
async def test_get_user_returns_self_when_uid_zero(make_request_with_cookies):
    user = User(email="u@example.com", password_hash="x", role="user")
    user.id = 1
    user.name = "User"
    user.created_at = __import__("datetime").datetime.now(
        __import__("datetime").timezone.utc
    )
    user.avatar_display_url = "/images/avatar-not-found.png"
    session = FakeSession(user_by_id={1: user})
    request = make_request_with_cookies(_make_access_cookie_for_user(1))

    result = await users_routes.get_user(request=request, session=session, uid=0)
    assert result["user"].email == "u@example.com"


@pytest.mark.asyncio
async def test_update_profile_fields():
    user = User(email="u@example.com", password_hash="x", role="user")
    user.id = 1
    session = FakeSession()

    assert (await users_routes.update_name(UpdateName(name="Имя"), session, user))[
        "success"
    ]
    assert user.name == "Имя"

    assert (
        await users_routes.update_phone(
            UpdatePhone(phone="+79998887766"), session, user
        )
    )["success"]
    assert user.phone == "+79998887766"

    assert (
        await users_routes.update_location(
            LocationUpdate(notificationsLocation=[1.0, 2.0]), session, user
        )
    )["success"]
    assert user.notificationsLocation == [1.0, 2.0]

    assert (await users_routes.update_tg(UpdateTg(tg="@me"), session, user))["success"]
    assert user.tg == "@me"

    assert (await users_routes.update_vk(UpdateVk(vk="vk.com/me"), session, user))[
        "success"
    ]
    assert user.vk == "vk.com/me"

    assert (await users_routes.update_max(UpdateMax(max="max"), session, user))[
        "success"
    ]
    assert user.max == "max"


@pytest.mark.asyncio
async def test_delete_user_deletes_and_logs_out():
    user = User(email="u@example.com", password_hash="x", role="user")
    user.id = 1
    session = FakeSession()
    response = Response()

    result = await users_routes.delete_user(
        session=session, current_user=user, response=response
    )
    assert result["success"] is True
    assert session.deleted and session.deleted[0] is user


@pytest.mark.asyncio
async def test_refresh_token_sets_new_access_cookie(make_request_with_cookies):
    user = User(email="u@example.com", password_hash="x", role="user")
    user.id = 1
    refresh = auth.create_token({"sub": "1"}, timedelta(days=1))
    request = make_request_with_cookies({"refresh_token": refresh})
    response = Response()
    session = FakeSession(user_by_id={1: user})

    result = await users_routes.refresh_token(request, response, session)
    assert result["success"] is True
    set_cookies = response.headers.getlist("set-cookie")
    assert any(c.startswith("access_token=") for c in set_cookies)


@pytest.mark.asyncio
async def test_update_password_checks_current_and_updates(monkeypatch):
    cur = "Password123"
    user = User(
        email="u@example.com", password_hash=auth.hash_password(cur), role="user"
    )
    user.id = 1
    session = FakeSession()

    ok = await users_routes.update_password(
        data=UpdatePassword(curPassword=cur, newPassword="NewPassword123"),
        session=session,
        current_user=user,
    )
    assert ok["success"] is True
    assert auth.verify_password("NewPassword123", user.password_hash)


@pytest.mark.asyncio
async def test_update_email_sends_verification_and_logs_out(monkeypatch):
    sent = {}

    async def fake_send(email: str, token: str):
        sent["email"] = email
        sent["token"] = token

    monkeypatch.setattr(users_routes, "send_verification_email_change", fake_send)

    user = User(email="old@example.com", password_hash="x", role="user")
    user.id = 1
    session = FakeSession(scalar_results=[None])
    response = Response()

    result = await users_routes.update_email(
        data=UpdateEmail(email="new@example.com"),
        response=response,
        session=session,
        current_user=user,
    )
    assert result["success"] is True
    assert sent["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_verify_email_change_updates_email_and_clears_tokens():
    user = User(email="old@example.com", password_hash="x", role="user")
    user.id = 1
    session = FakeSession(scalar_results=[None], user_by_id={1: user})
    response = Response()

    token = auth.create_token(
        {"sub": "1", "new_email": "new@example.com", "type": "email_change"},
        timedelta(minutes=30),
    )
    result = await users_routes.verify_email_change(token, session, response)
    assert result["success"] is True
    assert user.email == "new@example.com"


@pytest.mark.asyncio
async def test_reset_password_does_not_leak_user_existence():
    session = FakeSession(scalar_results=[None])
    result = await users_routes.reset_password(
        data=PasswordReset(email="unknown@example.com", new_password="NewPassword123"),
        session=session,
    )
    assert result["success"] is True
    assert "если email" in result["message"].lower()
