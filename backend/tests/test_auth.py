from datetime import timedelta, datetime, timezone

from jose import jwt

import auth
import config


def test_hash_and_verify_password_roundtrip():
    password = "CorrectHorseBatteryStaple"
    password_hash = auth.hash_password(password)
    assert auth.verify_password(password, password_hash)
    assert not auth.verify_password("wrong", password_hash)


def test_create_token_contains_exp_and_is_decodable():
    token = auth.create_token({"sub": "123"}, timedelta(minutes=5))
    payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
    assert payload["sub"] == "123"
    assert "exp" in payload

    exp_val = payload["exp"]
    if isinstance(exp_val, (int, float)):
        exp_dt = datetime.fromtimestamp(exp_val, tz=timezone.utc)
    else:
        exp_dt = exp_val
    assert exp_dt > datetime.now(timezone.utc)
