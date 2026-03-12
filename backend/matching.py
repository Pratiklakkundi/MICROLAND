from typing import List, Dict
from database import users_collection, projects_collection
from bson import ObjectId

async def calculate_match_score(user_skills: List[str], required_skills: List[str]) -> float:
    if not required_skills:
        return 0.0
    matching_skills = set(user_skills) & set(required_skills)
    return (len(matching_skills) / len(required_skills)) * 100

async def get_skill_matches(project_id: str) -> List[Dict]:
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        return []
    
    required_skills = project.get("required_skills", [])
    users = await users_collection.find({"availability": "available"}).to_list(length=100)
    
    matches = []
    for user in users:
        if str(user["_id"]) == project.get("created_by"):
            continue
        
        score = await calculate_match_score(user.get("skills", []), required_skills)
        if score > 0:
            matches.append({
                "user_id": str(user["_id"]),
                "name": user["name"],
                "skills": user["skills"],
                "experience_level": user["experience_level"],
                "match_score": round(score, 2),
                "matching_skills": list(set(user.get("skills", [])) & set(required_skills))
            })
    
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches
