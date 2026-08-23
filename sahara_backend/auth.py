"""Authentication & Security Module for SAHARA API.

Features:
- PyJWT token issuance and decoding with configurable expiration.
- Role-based authorization dependencies (Student, Counselor, Admin).
- Password validation using database PBKDF2 hashing.
"""
from __future__ import annotations

import datetime
import os
from typing import Any, Dict, Optional

from fastapi import Depends, Header, HTTPException, status
import jwt

from storage.database import get_user_by_email, get_user_by_id, verify_password

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "sahara-production-secret-key-2026-sih-eval")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def create_access_token(user_id: str, email: str, role: str, name: str) -> str:
    """Generate a signed JWT access token."""
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "name": name,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )


async def get_current_user_optional(authorization: Optional[str] = Header(default=None)) -> Optional[Dict[str, Any]]:
    """Extract authenticated user if Authorization header is provided, or return None."""
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1]
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = get_user_by_id(user_id)
    return user


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    """Require a valid logged-in user."""
    user = await get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_roles(*allowed_roles: str):
    """Factory dependency to enforce specific user roles."""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role", "student")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role '{user_role}' is not authorized for this resource.",
            )
        return current_user
    return role_checker
