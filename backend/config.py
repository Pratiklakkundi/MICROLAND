from pydantic_settings import BaseSettings
from pathlib import Path

# Get the directory where this config file is located
BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    mongodb_uri: str
    database_name: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    openai_api_key: str
    
    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = 'utf-8'

settings = Settings()
