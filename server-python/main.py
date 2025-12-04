import logging
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import uuid
from passlib.context import CryptContext
from typing import List
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import User as DBUser
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key") # Read from environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserIn(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: uuid.UUID
    username: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables on startup
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

def get_user_from_db(db: Session, username: str):
    return db.query(DBUser).filter(DBUser.username == username).first()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user_from_db(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_from_db(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: DBUser = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username}

# Create user
@app.post("/api/users", response_model=User)
def create_user(user_in: UserIn, db: Session = Depends(get_db)):
    logging.info(f"Attempting to register new user: {user_in.username}")
    db_user = db.query(DBUser).filter(DBUser.username == user_in.username).first()
    if db_user:
        logging.warning(f"Registration failed: Username already registered: {user_in.username}")
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = pwd_context.hash(user_in.password)
    new_user = DBUser(username=user_in.username, password=hashed_password, id=uuid.uuid4())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logging.info(f"Successfully registered new user: {new_user.username} with ID: {new_user.id}")
    return {"id": new_user.id, "username": new_user.username}

# Get all users
@app.get("/api/users", response_model=List[User])
def get_all_users(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    return [{"id": user.id, "username": user.username} for user in users]

# Get user by ID
@app.get("/api/users/{user_id}", response_model=User)
def get_user_by_id(user_id: uuid.UUID, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "username": user.username}