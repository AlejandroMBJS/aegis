from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from schemas import UserRead, UserCreate, UserUpdate
from models import User
from deps import get_current_user, role_required
from crud import crud_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/", response_model=List[UserRead])
def list_users(
    role: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # Accessible to all authenticated users
):
    """
    List all users, optionally filtered by role.
    """
    statement = select(User)
    if role:
        statement = statement.where(User.role == role)
    users = session.exec(statement).all()
    return users


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(role_required(["Admin"]))]) # Admin only
def create_user(
    user_in: UserCreate,
    session: Session = Depends(get_session),
):
    """
    Create a new user. Admin only.
    """
    # Check for existing user with the same username or email
    existing_user = crud_user.get_user_by_username(session, user_in.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered",
        )
    # You might want to add a similar check for email
    # existing_email = session.exec(select(User).where(User.email == user_in.email)).first()
    # if existing_email:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail="Email already registered",
    #     )
        
    user = crud_user.create_user(session, user_in)
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # Accessible to all authenticated users
):
    """
    Get a specific user by ID.
    """
    user = crud_user.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    return user


@router.put("/{user_id}", response_model=UserRead,
            dependencies=[Depends(role_required(["Admin"]))]) # Admin only
def update_user(
    user_id: int,
    user_in: UserUpdate,
    session: Session = Depends(get_session),
):
    """
    Update a user's details. Admin only.
    """
    user = crud_user.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    
    user = crud_user.update_user(session, user, user_in)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT,
            dependencies=[Depends(role_required(["Admin"]))]) # Admin only
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a user. Admin only.
    """
    user = crud_user.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot delete themselves.",
        )
        
    crud_user.delete_user(session, user)
    return
