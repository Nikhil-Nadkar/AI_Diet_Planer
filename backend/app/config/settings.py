from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL:str
    GEMINI_API_KEY : str
    REDIS_HOST : str
    
    model_config=SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
    
settings = Settings()