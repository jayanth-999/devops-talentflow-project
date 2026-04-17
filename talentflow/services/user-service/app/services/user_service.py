import logging
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.user import User
from app.schemas.user import UserRegisterRequest, UserUpdateRequest
from app.core.security import hash_password, verify_password
from app.services.kafka_producer import publish_event

logger = logging.getLogger(__name__)


class UserService:

    @staticmethod
    def register(db: Session, data: UserRegisterRequest) -> User:
        # Check email uniqueness
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        # Check username uniqueness
        existing_username = db.query(User).filter(User.username == data.username).first()
        if existing_username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

        user = User(
            email=data.email,
            username=data.username,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Publish Kafka event (non-blocking, fails gracefully)
        publish_event(
            topic="user.registered",
            key=user.id,
            payload={
                "userId": user.id,
                "email": user.email,
                "username": user.username,
                "role": user.role.value,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        logger.info("User registered: %s", user.id)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
        return user

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    @staticmethod
    def update(db: Session, user_id: str, data: UserUpdateRequest) -> User:
        user = UserService.get_by_id(db, user_id)
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.username is not None:
            user.username = data.username
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user
