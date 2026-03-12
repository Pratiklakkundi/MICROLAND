from openai import OpenAI
from config import settings
from database import users_collection, projects_collection
from bson import ObjectId
import json

client = OpenAI(api_key=settings.openai_api_key)

async def build_team_with_ai(prompt: str, project_id: str = None) -> dict:
    context = ""
    
    if project_id:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if project:
            context = f"Project: {project['title']}\nRequired Skills: {', '.join(project['required_skills'])}\nTeam Size: {project['team_size']}\n\n"
    
    users = await users_collection.find({"availability": "available"}).to_list(length=100)
    user_data = []
    for user in users:
        user_data.append({
            "id": str(user["_id"]),
            "name": user["name"],
            "skills": user["skills"],
            "experience": user["experience_level"]
        })
    
    system_prompt = """You are a team building assistant. Analyze the user's request and available candidates to recommend the best team.
    
    Return a JSON response with this structure:
    {
        "analysis": "Brief analysis of requirements",
        "recommendations": [
            {
                "role": "Role name (e.g., Frontend Developer)",
                "user_id": "user id",
                "name": "user name",
                "reasoning": "Why this person fits"
            }
        ],
        "introduction_message": "A friendly message to send to the team"
    }"""
    
    user_message = f"{context}User Request: {prompt}\n\nAvailable Candidates:\n{json.dumps(user_data, indent=2)}"
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7
    )
    
    result = json.loads(response.choices[0].message.content)
    return result
