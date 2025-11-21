from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from jose import JWTError
from database import get_session
from auth import verify_token
from models import User
from crud.crud_user import get_user_by_username

# OAuth2 scheme para extraer token del header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    """
    Dependency para obtener el usuario actual desde el JWT token
    Valida el token y retorna la instancia User desde la DB
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Verificar token
        token_data = verify_token(token)
        if token_data is None or token_data.username is None:
            print(f"Token verification failed: token_data is None or username is missing")
            raise credentials_exception

        # Obtener usuario de la base de datos
        user = get_user_by_username(session, token_data.username)
        if user is None:
            print(f"User not found in database: {token_data.username}")
            raise credentials_exception

        return user
    except JWTError as e:
        print(f"JWTError in get_current_user: {e}")
        raise credentials_exception
    except HTTPException:
        # Re-raise HTTP exceptions without wrapping
        raise
    except Exception as e:
        # Log any other unexpected errors during user retrieval
        print(f"Unexpected error in get_current_user: {type(e).__name__}: {e}")
        raise credentials_exception


def role_required(allowed_roles: List[str]):
    """
    Dependency factory para verificar que el usuario tiene uno de los roles permitidos

    Uso:
        @router.get("/admin-only", dependencies=[Depends(role_required(["Admin"]))])
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}. Your role: {current_user.role}"
            )
        return current_user

    return role_checker
