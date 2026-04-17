from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# ── Request Schemas ──────────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = None
    role: UserRole = UserRole.JOB_SEEKER


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Response Schemas ─────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class MessageResponse(BaseModel):
    message: str
