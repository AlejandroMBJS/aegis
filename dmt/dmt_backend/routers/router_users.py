from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from schemas import UserRead
from models import User
from deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserRead])
def list_users(
    role: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    List all users, optionally filtered by role

    Args:
        role: Optional role filter (e.g., "Tech Engineer", "Quality Engineer")
        session: Database session
        current_user: Current authenticated user

    Returns:
        List of users
    """
    statement = select(User)

    if role:
        statement = statement.where(User.role == role)

    users = session.exec(statement).all()
    return users


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific user by ID

    Args:
        user_id: User ID
        session: Database session
        current_user: Current authenticated user

    Returns:
        User details
    """
    user = session.get(User, user_id)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return user
