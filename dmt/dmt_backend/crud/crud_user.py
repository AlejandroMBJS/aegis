from typing import Optional, List
from sqlmodel import Session, select
from models import User
from schemas import UserCreate, UserUpdate
from auth import get_password_hash, verify_password


def create_user(session: Session, user_data: UserCreate) -> User:
    """
    Create a new user with a hashed password.
    """
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        hashed_password=hashed_password
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_username(session: Session, username: str) -> Optional[User]:
    """
    Get a user by username.
    """
    statement = select(User).where(User.username == username)
    result = session.exec(statement).first()
    return result


def get_user(session: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID.
    """
    return session.get(User, user_id)


def list_users(session: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    List all users with pagination.
    """
    statement = select(User).offset(skip).limit(limit)
    results = session.exec(statement).all()
    return results


def update_user(session: Session, user: User, user_update: UserUpdate) -> User:
    """
    Update a user's details.
    """
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        hashed_password = get_password_hash(update_data["password"])
        user.hashed_password = hashed_password
    
    # Update other fields
    for key, value in update_data.items():
        if key != "password":
            setattr(user, key, value)
            
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user: User):
    """
    Delete a user.
    """
    session.delete(user)
    session.commit()


def authenticate_user(session: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user by verifying username and password.
    Returns the User if credentials are valid, otherwise None.
    """
    user = get_user_by_username(session, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
