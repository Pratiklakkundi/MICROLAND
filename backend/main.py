from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from bson import ObjectId
from datetime import datetime

from database import init_db, users_collection, projects_collection
from models import *
from auth import hash_password, verify_password, create_access_token, get_current_user
from matching import get_skill_matches
from ai_service import build_team_with_ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Team Builder API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=Token)
async def register(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user.password)
    result = await users_collection.insert_one(user_dict)
    
    token = create_access_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users")
async def get_users(current_user: str = Depends(get_current_user)):
    users = await users_collection.find({}, {"password": 0}).to_list(length=100)
    for user in users:
        user["user_id"] = str(user.pop("_id"))
    return users

@app.get("/users/{user_id}")
async def get_user(user_id: str, current_user: str = Depends(get_current_user)):
    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["user_id"] = str(user.pop("_id"))
    return user

@app.put("/users/{user_id}")
async def update_user(user_id: str, update: UserUpdate, current_user: str = Depends(get_current_user)):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Profile updated successfully"}

@app.post("/projects")
async def create_project(project: ProjectCreate, current_user: str = Depends(get_current_user)):
    project_dict = project.model_dump()
    project_dict["created_by"] = current_user
    project_dict["created_at"] = datetime.utcnow()
    
    result = await projects_collection.insert_one(project_dict)
    project_dict["project_id"] = str(result.inserted_id)
    project_dict.pop("_id")
    return project_dict

@app.get("/projects")
async def get_projects(current_user: str = Depends(get_current_user)):
    projects = await projects_collection.find().to_list(length=100)
    for project in projects:
        project["project_id"] = str(project.pop("_id"))
    return projects

@app.get("/projects/{project_id}")
async def get_project(project_id: str, current_user: str = Depends(get_current_user)):
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project["project_id"] = str(project.pop("_id"))
    return project

@app.get("/match/{project_id}")
async def match_users(project_id: str, current_user: str = Depends(get_current_user)):
    matches = await get_skill_matches(project_id)
    return {"project_id": project_id, "matches": matches}

@app.post("/ai/team-builder")
async def ai_team_builder(request: AITeamRequest, current_user: str = Depends(get_current_user)):
    result = await build_team_with_ai(request.prompt, request.project_id)
    return result

@app.get("/")
async def root():
    return {"message": "Team Builder API", "status": "running"}

# WebSocket endpoint
from fastapi import WebSocket, WebSocketDisconnect
from websocket import manager

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now, can add more logic
            await manager.send_personal_message({
                "type": "echo",
                "message": data,
                "timestamp": datetime.utcnow().isoformat()
            }, user_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

# Enhanced match endpoint with notifications
@app.get("/match/{project_id}/notify")
async def match_and_notify(project_id: str, current_user: str = Depends(get_current_user)):
    matches = await get_skill_matches(project_id)
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    
    # Notify top matches
    for match in matches[:5]:  # Top 5 matches
        await manager.notify_match(
            match["user_id"],
            project["title"],
            match["match_score"]
        )
    
    return {"project_id": project_id, "matches": matches, "notifications_sent": len(matches[:5])}


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting Team Builder API (Full Mode)")
    print("="*60)
    print("✓ MongoDB connected")
    print("✓ OpenAI API configured")
    print("\nBackend running at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
