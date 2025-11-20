from typing import Optional, List
from sqlmodel import Session, select
from models import User
from schemas import UserCreate
from auth import get_password_hash, verify_password


def create_user(session: Session, user_data: UserCreate) -> User:
    """
    Crear nuevo usuario con password hasheado
    """
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        employee_number=user_data.employee_number,
        full_name=user_data.full_name,
        role=user_data.role,
        hashed_password=hashed_password
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_employee_number(session: Session, employee_number: str) -> Optional[User]:
    """
    Obtener usuario por employee_number
    """
    statement = select(User).where(User.employee_number == employee_number)
    result = session.exec(statement).first()
    return result


def get_user(session: Session, user_id: int) -> Optional[User]:
    """
    Obtener usuario por ID
    """
    return session.get(User, user_id)


def list_users(session: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Listar todos los usuarios con paginación
    """
    statement = select(User).offset(skip).limit(limit)
    results = session.exec(statement).all()
    return results


def authenticate_user(session: Session, employee_number: str, password: str) -> Optional[User]:
    """
    Autenticar usuario verificando employee_number y password
    Retorna User si las credenciales son válidas, None si no
    """
    user = get_user_by_employee_number(session, employee_number)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
