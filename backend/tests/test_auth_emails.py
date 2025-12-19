from __future__ import annotations

import pytest

import auth


class FakeSMTP:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.started_tls = False
        self.logged_in = False
        self.sent = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def starttls(self):
        self.started_tls = True

    def login(self, user, password):
        self.logged_in = True
        self.user = user
        self.password = password

    def sendmail(self, mail_from, mail_to, message):
        self.sent.append((mail_from, mail_to, message))


@pytest.mark.asyncio
async def test_send_verification_email_builds_link_and_sends(monkeypatch):
    box = {}

    def fake_smtp(host, port):
        box["smtp"] = FakeSMTP(host, port)
        return box["smtp"]

    monkeypatch.setattr(auth.smtplib, "SMTP", fake_smtp)
    await auth.send_verification_email("u@example.com", "tok123")

    smtp = box["smtp"]
    assert smtp.started_tls
    assert smtp.logged_in
    assert smtp.sent
    _mail_from, mail_to, message = smtp.sent[0]
    assert mail_to == "u@example.com"
    from email import message_from_string

    parsed = message_from_string(message)
    body = parsed.get_payload(decode=True).decode(
        parsed.get_content_charset() or "utf-8"
    )
    assert "token=tok123" in body


@pytest.mark.asyncio
async def test_send_password_reset_email_sends(monkeypatch):
    box = {}

    def fake_smtp(host, port):
        box["smtp"] = FakeSMTP(host, port)
        return box["smtp"]

    monkeypatch.setattr(auth.smtplib, "SMTP", fake_smtp)
    await auth.send_password_reset_email("u@example.com", "tok999")

    smtp = box["smtp"]
    assert smtp.sent
    from email import message_from_string

    parsed = message_from_string(smtp.sent[0][2])
    body = parsed.get_payload(decode=True).decode(
        parsed.get_content_charset() or "utf-8"
    )
    assert "tok999" in body


@pytest.mark.asyncio
async def test_send_ad_notification_email_formats_fields(monkeypatch):
    box = {}

    def fake_smtp(host, port):
        box["smtp"] = FakeSMTP(host, port)
        return box["smtp"]

    monkeypatch.setattr(auth.smtplib, "SMTP", fake_smtp)

    ad = type(
        "AdObj",
        (),
        {
            "status": "lost",
            "type": "dog",
            "size": "medium",
            "breed": "beagle",
            "color": "brown",
            "location": "Moscow",
            "time": __import__("datetime").datetime(2025, 1, 1, 12, 0),
        },
    )()

    await auth.send_ad_notification_email("u@example.com", ad)
    smtp = box["smtp"]
    assert smtp.sent
    from email import message_from_string

    parsed = message_from_string(smtp.sent[0][2])
    body = parsed.get_payload(decode=True).decode(
        parsed.get_content_charset() or "utf-8"
    )
    assert "beagle" in body
    assert "Moscow" in body
