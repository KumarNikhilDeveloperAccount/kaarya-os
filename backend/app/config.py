from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./kaarya_os.db"
    SECRET_KEY: str = "supersecretkey-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Integrations
    GEMINI_API_KEY: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_SERVICE_ACCOUNT_FILE: str = ""
    BOOMI_ENDPOINT: str = ""
    BOOMI_TOKEN: str = ""

    # Email / OTP
    EMAIL_MODE: str = "smtp"  # console | smtp
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "kaarya.support@gmail.com"
    SMTP_PASSWORD: str = "ALksdjhfvgmz#@202"
    SMTP_FROM: str = "kaarya.support@gmail.com"
    OTP_EXPIRE_MINUTES: int = 10
    OTP_DEBUG_RETURN_CODE: bool = False

    # LinkedIn OAuth
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    LINKEDIN_REDIRECT_URL: str = ""  # e.g. http://127.0.0.1:8000/api/auth/linkedin/callback
    LINKEDIN_SCOPES: str = "r_liteprofile r_emailaddress"
    FRONTEND_BASE_URL: str = "https://kaarya-os.vercel.app"

    CRISP_WEBSITE_ID: str = ""
    USE_DOCKER_SANDBOX: bool = False # Fallback to subprocess if Docker is not available

    class Config:
        env_file = ".env"

settings = Settings()
