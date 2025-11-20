from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from database import get_session
from auth import verify_token
from models import User
from crud.crud_user import get_user_by_employee_number

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

    # Verificar token
    token_data = verify_token(token)
    if token_data is None or token_data.employee_number is None:
        raise credentials_exception

    # Obtener usuario de la base de datos
    user = get_user_by_employee_number(session, token_data.employee_number)
    if user is None:
        raise credentials_exception

    return user


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
