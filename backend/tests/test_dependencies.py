import pytest

from fastapi import HTTPException

from jose import jwt

import config
from dependencies import get_current_user
from models import User


class FakeSession:
    def __init__(self, user_by_id=None):
        self._user_by_id = user_by_id or {}

    async def get(self, model, user_id):
        assert model is User
        return self._user_by_id.get(user_id)


@pytest.mark.asyncio
async def test_get_current_user_requires_token(make_request_with_cookies):
    request = make_request_with_cookies({})
    session = FakeSession()
    with pytest.raises(HTTPException) as exc:
        await get_current_user(request, session)
    assert "Нет access токена" in str(exc.value)


@pytest.mark.asyncio
async def test_get_current_user_ok(make_request_with_cookies):
    token = jwt.encode({"sub": "1"}, config.SECRET_KEY, algorithm=config.ALGORITHM)
    request = make_request_with_cookies({"access_token": token})
    user = User(email="u@example.com", password_hash="x", role="user")
    user.id = 1
    session = FakeSession(user_by_id={1: user})
    got = await get_current_user(request, session)
    assert got.id == 1
