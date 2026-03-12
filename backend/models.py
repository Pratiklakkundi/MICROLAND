from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    skills: List[str] = []
    experience_level: str = "beginner"
    availability: str = "available"
    bio: str = ""

class UserUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    availability: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    skills: List[str]
    experience_level: str
    availability: str
    bio: str

class ProjectCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    team_size: int

class ProjectResponse(BaseModel):
    project_id: str
    title: str
    description: str
    required_skills: List[str]
    team_size: int
    created_by: str
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AITeamRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None
