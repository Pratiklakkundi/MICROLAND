"""
Script to populate database with sample data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from auth import hash_password
from config import settings
from datetime import datetime

async def seed_database():
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]
    
    users_collection = db["users"]
    projects_collection = db["projects"]
    
    print("🌱 Seeding database with sample data...")
    
    # Clear existing data
    await users_collection.delete_many({})
    await projects_collection.delete_many({})
    print("✓ Cleared existing data")
    
    # Sample Users
    sample_users = [
        {
            "name": "Alice Johnson",
            "email": "alice@example.com",
            "password": hash_password("password123"),
            "skills": ["React", "JavaScript", "UI/UX", "Figma"],
            "experience_level": "advanced",
            "availability": "available",
            "bio": "Frontend developer with 5 years of experience. Love creating beautiful user interfaces."
        },
        {
            "name": "Bob Smith",
            "email": "bob@example.com",
            "password": hash_password("password123"),
            "skills": ["Python", "FastAPI", "MongoDB", "Docker"],
            "experience_level": "advanced",
            "availability": "available",
            "bio": "Backend engineer specializing in Python and microservices architecture."
        },
        {
            "name": "Carol Martinez",
            "email": "carol@example.com",
            "password": hash_password("password123"),
            "skills": ["React Native", "Flutter", "Mobile Development", "iOS"],
            "experience_level": "intermediate",
            "availability": "available",
            "bio": "Mobile app developer passionate about cross-platform solutions."
        },
        {
            "name": "David Lee",
            "email": "david@example.com",
            "password": hash_password("password123"),
            "skills": ["Machine Learning", "Python", "TensorFlow", "Data Science"],
            "experience_level": "intermediate",
            "availability": "available",
            "bio": "AI/ML engineer with focus on practical applications and model deployment."
        },
        {
            "name": "Emma Wilson",
            "email": "emma@example.com",
            "password": hash_password("password123"),
            "skills": ["UI/UX", "Figma", "Adobe XD", "User Research"],
            "experience_level": "advanced",
            "availability": "available",
            "bio": "UX designer focused on user-centered design and accessibility."
        },
        {
            "name": "Frank Chen",
            "email": "frank@example.com",
            "password": hash_password("password123"),
            "skills": ["DevOps", "AWS", "Kubernetes", "CI/CD"],
            "experience_level": "intermediate",
            "availability": "busy",
            "bio": "DevOps engineer automating everything. Cloud infrastructure enthusiast."
        },
        {
            "name": "Grace Taylor",
            "email": "grace@example.com",
            "password": hash_password("password123"),
            "skills": ["Node.js", "Express", "PostgreSQL", "GraphQL"],
            "experience_level": "intermediate",
            "availability": "available",
            "bio": "Full-stack developer with a passion for building scalable APIs."
        },
        {
            "name": "Henry Brown",
            "email": "henry@example.com",
            "password": hash_password("password123"),
            "skills": ["Blockchain", "Solidity", "Web3", "Ethereum"],
            "experience_level": "beginner",
            "availability": "available",
            "bio": "Blockchain developer exploring decentralized applications."
        }
    ]
    
    # Insert users
    result = await users_collection.insert_many(sample_users)
    user_ids = list(result.inserted_ids)
    print(f"✓ Created {len(user_ids)} sample users")
    
    # Sample Projects
    sample_projects = [
        {
            "title": "FinTech Mobile App",
            "description": "Building a mobile banking app with real-time transactions and budget tracking features.",
            "required_skills": ["React Native", "Python", "FastAPI", "UI/UX"],
            "team_size": 4,
            "created_by": str(user_ids[0]),
            "created_at": datetime.utcnow()
        },
        {
            "title": "AI-Powered Chatbot",
            "description": "Developing an intelligent customer service chatbot using NLP and machine learning.",
            "required_skills": ["Python", "Machine Learning", "TensorFlow", "FastAPI"],
            "team_size": 3,
            "created_by": str(user_ids[3]),
            "created_at": datetime.utcnow()
        },
        {
            "title": "E-Commerce Platform",
            "description": "Full-stack e-commerce solution with payment integration and inventory management.",
            "required_skills": ["React", "Node.js", "MongoDB", "UI/UX"],
            "team_size": 5,
            "created_by": str(user_ids[1]),
            "created_at": datetime.utcnow()
        },
        {
            "title": "Social Media Dashboard",
            "description": "Analytics dashboard for managing multiple social media accounts with scheduling features.",
            "required_skills": ["React", "Python", "Data Science", "UI/UX"],
            "team_size": 3,
            "created_by": str(user_ids[4]),
            "created_at": datetime.utcnow()
        },
        {
            "title": "Blockchain Voting System",
            "description": "Secure and transparent voting platform using blockchain technology.",
            "required_skills": ["Blockchain", "Solidity", "React", "Node.js"],
            "team_size": 4,
            "created_by": str(user_ids[7]),
            "created_at": datetime.utcnow()
        }
    ]
    
    # Insert projects
    result = await projects_collection.insert_many(sample_projects)
    print(f"✓ Created {len(result.inserted_ids)} sample projects")
    
    print("\n" + "="*60)
    print("✅ Database seeded successfully!")
    print("="*60)
    print("\nSample Login Credentials:")
    print("-" * 60)
    for user in sample_users:
        print(f"Email: {user['email']}")
        print(f"Password: password123")
        print(f"Skills: {', '.join(user['skills'])}")
        print("-" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
