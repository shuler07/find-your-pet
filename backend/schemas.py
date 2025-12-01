from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal, List, Union
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    phone: Optional[str] = Field(None, pattern=r"^\+7\d{10}$")
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    date: str
    avatar_display_url: str = ""

    class Config:
        from_attributes = True


class AdCreate(BaseModel):
    status: Literal["lost", "found", "closed"]
    type: Literal["dog", "cat"]
    breed: Literal["labrador", "german_shepherd", "poodle", "metis"]
    color: str
    size: Literal["little", "medium", "big"]
    distincts: str
    nickname: str
    danger: Literal["danger", "safe", "unknown"]
    location: str
    geoLocation: List[float]
    time: str
    contactName: str
    contactPhone: str
    contactEmail: EmailStr
    extras: str


class AdOut(BaseModel):
    id: int
    user_id: int
    status: str
    type: str
    breed: str
    color: str
    size: str
    distincts: str
    nickname: str
    danger: str
    location: str
    geoLocation: List[float]
    ad_image_display_url: str = ""
    ad_image_delete_url: str = ""
    time: datetime
    contactName: str
    contactPhone: str
    contactEmail: str
    extras: str
    ischecked: bool

    class Config:
        from_attributes = True


class AdFilters(BaseModel):
    status: Optional[str] = None
    type: Optional[str] = None
    breed: Optional[str] = None
    size: Optional[str] = None
    danger: Optional[str] = None
    region: Optional[str] = None
    geoloc: Optional[Union[List[float], str]] = None
    radius: Optional[int] = None


class UpdateName(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class UpdateEmail(BaseModel):
    email: EmailStr


class UpdatePhone(BaseModel):
    phone: str = Field(None, pattern=r"^\+7\d{10}$")


class UpdatePassword(BaseModel):
    curPassword: str = Field(..., min_length=8)
    newPassword: str = Field(..., min_length=8, max_length=72)


class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=8, max_length=72)


class LocationUpdate(BaseModel):
    notificationsLocation: List[float]


class AdApprove(BaseModel):
    ad_id: int


class AdReject(BaseModel):
    ad_id: int
