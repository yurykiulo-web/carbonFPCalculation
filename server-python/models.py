from sqlalchemy import Column, String, Integer, Identity
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, Identity(), primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
