# backend/auth.py
#
# Minimal JWT-based auth for the CMS admin panel.
# Single admin user, credentials come from environment variables:
#   ADMIN_USERNAME       - plain username (default: "admin")
#   ADMIN_PASSWORD_HASH  - bcrypt hash of the admin password
# Generate a hash with:
#   python -c "import bcrypt; print(bcrypt.hashpw(b'yourpassword', bcrypt.gensalt()).decode())"

import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_SECRET = os.environ.get("JWT_SECRET", "change-this-secret-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.environ.get("JWT_EXPIRE_HOURS", "72"))

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", "")

security = HTTPBearer()


def verify_admin_credentials(username: str, password: str) -> bool:
    if username != ADMIN_USERNAME:
        return False
    if not ADMIN_PASSWORD_HASH:
        # No hash configured — refuse login rather than silently accepting.
        return False
    return bcrypt.checkpw(password.encode(), ADMIN_PASSWORD_HASH.encode())


def create_access_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    return decode_access_token(credentials.credentials)
