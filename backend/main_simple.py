"""
Simplified version using in-memory storage for quick testing without MongoDB
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
import uuid

# Auth setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = "test-secret-key-change-in-production"
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

# Models
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

class ProjectCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    team_size: int

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AITeamRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None

# In-memory storage
users_db: Dict[str, dict] = {}
projects_db: Dict[str, dict] = {}
email_to_id: Dict[str, str] = {}

app = FastAPI(title="Team Builder API (Simple Mode)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Team Builder API - Simple Mode (No MongoDB Required)",
        "status": "running",
        "note": "Using in-memory storage - data will be lost on restart"
    }

@app.post("/register", response_model=Token)
async def register(user: UserCreate):
    if user.email in email_to_id:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user.password)
    user_dict["user_id"] = user_id
    
    users_db[user_id] = user_dict
    email_to_id[user.email] = user_id
    
    token = create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    user_id = email_to_id.get(credentials.email)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_db[user_id]
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users")
async def get_users(current_user: str = Depends(get_current_user)):
    result = []
    for user_id, user in users_db.items():
        user_copy = user.copy()
        user_copy.pop("password", None)
        result.append(user_copy)
    return result

@app.get("/users/{user_id}")
async def get_user(user_id: str, current_user: str = Depends(get_current_user)):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_copy = user.copy()
    user_copy.pop("password", None)
    return user_copy

@app.put("/users/{user_id}")
async def update_user(user_id: str, update: UserUpdate, current_user: str = Depends(get_current_user)):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    users_db[user_id].update(update_data)
    
    return {"message": "Profile updated successfully"}

@app.post("/projects")
async def create_project(project: ProjectCreate, current_user: str = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    project_dict = project.model_dump()
    project_dict["project_id"] = project_id
    project_dict["created_by"] = current_user
    project_dict["created_at"] = datetime.utcnow()
    
    projects_db[project_id] = project_dict
    return project_dict

@app.get("/projects")
async def get_projects(current_user: str = Depends(get_current_user)):
    return list(projects_db.values())

@app.get("/projects/{project_id}")
async def get_project(project_id: str, current_user: str = Depends(get_current_user)):
    project = projects_db.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.get("/match/{project_id}")
async def match_users(project_id: str, current_user: str = Depends(get_current_user)):
    project = projects_db.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    required_skills = project.get("required_skills", [])
    matches = []
    
    for user_id, user in users_db.items():
        if user_id == project.get("created_by"):
            continue
        
        if user.get("availability") != "available":
            continue
        
        user_skills = user.get("skills", [])
        matching_skills = list(set(user_skills) & set(required_skills))
        
        if matching_skills:
            score = (len(matching_skills) / len(required_skills)) * 100 if required_skills else 0
            matches.append({
                "user_id": user_id,
                "name": user["name"],
                "skills": user_skills,
                "experience_level": user.get("experience_level", "beginner"),
                "match_score": round(score, 2),
                "matching_skills": matching_skills
            })
    
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return {"project_id": project_id, "matches": matches}

@app.post("/ai/team-builder")
async def ai_team_builder(request: AITeamRequest, current_user: str = Depends(get_current_user)):
    # Simple mock response without OpenAI
    project = None
    if request.project_id:
        project = projects_db.get(request.project_id)
    
    # Get top matches
    available_users = [u for u in users_db.values() if u.get("availability") == "available"][:3]
    
    recommendations = []
    roles = ["Frontend Developer", "Backend Developer", "UI/UX Designer"]
    
    for i, user in enumerate(available_users):
        recommendations.append({
            "role": roles[i] if i < len(roles) else "Team Member",
            "user_id": user["user_id"],
            "name": user["name"],
            "reasoning": f"Strong skills in {', '.join(user.get('skills', [])[:2])} with {user.get('experience_level', 'beginner')} experience"
        })
    
    return {
        "analysis": f"Based on your request: '{request.prompt}', here are the recommended team members.",
        "recommendations": recommendations,
        "introduction_message": f"Hi team! I'm building a project and think you'd be a great fit. Let's collaborate!"
    }

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting Team Builder API (Simple Mode)")
    print("="*60)
    print("✓ No MongoDB required - using in-memory storage")
    print("✓ No OpenAI key required - using mock AI responses")
    print("\nBackend running at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("\nNow start the frontend with: cd frontend && npm start")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
