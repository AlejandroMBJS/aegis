from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from database import get_session
from schemas import Token
from crud.crud_user import authenticate_user
from auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """
    OAuth2 Login:
    username = employee_number
    password = user's password
    Returns JWT + user info for PHP session.
    """
    user = authenticate_user(session, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
            "full_name": user.full_name
        },
        expires_delta=access_token_expires
    )

    # 👉 Return full info for PHP session
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role
    }
