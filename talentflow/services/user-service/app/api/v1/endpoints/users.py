from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    blacklist_token,
    is_token_blacklisted,
)
from app.core.config import settings
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    UserUpdateRequest,
    UserResponse,
    TokenResponse,
    MessageResponse,
    RefreshTokenRequest,
)
from app.services.user_service import UserService

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    token = credentials.credentials
    if is_token_blacklisted(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload["sub"]


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user (job seeker or employer)"""
    return UserService.register(db, data)


@router.post("/auth/login", response_model=TokenResponse)
def login(data: UserLoginRequest, db: Session = Depends(get_db)):
    """Login and receive JWT access + refresh tokens"""
    user = UserService.authenticate(db, data.email, data.password)
    access_token = create_access_token({"sub": user.id, "role": user.role.value})
    refresh_token = create_refresh_token({"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/auth/refresh", response_model=TokenResponse)
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = UserService.get_by_id(db, payload["sub"])
    access_token = create_access_token({"sub": user.id, "role": user.role.value})
    refresh_token = create_refresh_token({"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/auth/logout", response_model=MessageResponse)
def logout(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """Logout — blacklist current access token"""
    if credentials:
        token = credentials.credentials
        payload = decode_token(token)
        if payload:
            import time
            expire_in = max(0, int(payload.get("exp", 0) - time.time()))
            blacklist_token(token, expire_in)
    return MessageResponse(message="Logged out successfully")


@router.get("/users/me", response_model=UserResponse)
def get_me(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get current authenticated user profile"""
    return UserService.get_by_id(db, current_user_id)


@router.put("/users/me", response_model=UserResponse)
def update_me(
    data: UserUpdateRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update current user profile"""
    return UserService.update(db, current_user_id, data)


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID (public profile)"""
    return UserService.get_by_id(db, user_id)
