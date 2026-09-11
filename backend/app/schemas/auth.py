"""
Pydantic schemas for authentication endpoints.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Requests ─────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    """Schema for updating basic user profile fields."""
    full_name: Optional[str] = None
    phone: Optional[str] = None


# ── Responses ────────────────────────────────────────────────────────────────

class TokenData(BaseModel):
    """Only the access token is issued. No refresh token endpoint exists."""
    access: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    tokens: TokenData
    user: UserResponse
