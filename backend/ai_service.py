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
    
    # Try OpenAI first, fallback to mock if quota exceeded
    try:
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
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    
    except Exception as e:
        # Fallback to mock response if OpenAI fails
        print(f"OpenAI API error: {e}. Using fallback mock response.")
        return generate_mock_team_response(prompt, user_data, project_id)

def generate_mock_team_response(prompt: str, user_data: list, project_id: str = None) -> dict:
    """Generate a mock team recommendation when OpenAI is unavailable"""
    
    # Simple keyword matching for roles
    prompt_lower = prompt.lower()
    recommendations = []
    
    # Define role keywords
    role_keywords = {
        "Frontend Developer": ["react", "javascript", "ui", "ux", "frontend", "figma"],
        "Backend Developer": ["python", "fastapi", "node", "backend", "api", "mongodb"],
        "Mobile Developer": ["react native", "flutter", "mobile", "ios", "android"],
        "AI/ML Engineer": ["machine learning", "tensorflow", "ai", "data science"],
        "DevOps Engineer": ["devops", "aws", "kubernetes", "docker", "ci/cd"],
        "UI/UX Designer": ["ui/ux", "figma", "adobe xd", "design"],
        "Full-stack Developer": ["full-stack", "node.js", "express", "graphql"],
        "Blockchain Developer": ["blockchain", "solidity", "web3", "ethereum"]
    }
    
    # Match users to roles based on skills
    used_users = set()
    for role, keywords in role_keywords.items():
        for user in user_data:
            if user["id"] in used_users:
                continue
            
            # Check if user has relevant skills
            user_skills_lower = [skill.lower() for skill in user["skills"]]
            matches = any(keyword in skill for keyword in keywords for skill in user_skills_lower)
            
            if matches and len(recommendations) < 4:  # Limit to 4 recommendations
                recommendations.append({
                    "role": role,
                    "user_id": user["id"],
                    "name": user["name"],
                    "reasoning": f"Strong expertise in {', '.join(user['skills'][:3])} with {user['experience']} level experience. Perfect fit for this role."
                })
                used_users.add(user["id"])
                break
    
    # If no matches, just take first available users
    if not recommendations:
        for i, user in enumerate(user_data[:3]):
            recommendations.append({
                "role": f"Team Member {i+1}",
                "user_id": user["id"],
                "name": user["name"],
                "reasoning": f"Versatile team member with skills in {', '.join(user['skills'][:2])}."
            })
    
    return {
        "analysis": f"Based on your request '{prompt}', I've identified the best team members from our available talent pool. The recommended team brings together complementary skills and experience levels to ensure project success.",
        "recommendations": recommendations,
        "introduction_message": f"Hi team! I'm excited to bring you together for this project. Each of you brings unique skills that will be crucial for our success. Let's schedule a kickoff meeting to discuss the project vision and how we can collaborate effectively. Looking forward to working with you all!"
    }
