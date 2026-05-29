import os
from celery import Celery
from app.config import settings

# Initialize Celery explicitly pointing to our docker-compose redis
celery_app = Celery(
    "kaarya_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.task_routes = {
    "app.worker.send_registration_email": "main-queue",
    "app.worker.parse_large_resume": "ai-queue",
}
celery_app.conf.task_annotations = {'*': {'rate_limit': '10/s'}}
celery_app.conf.broker_connection_retry_on_startup = True

@celery_app.task(bind=True, max_retries=3, default_retry_delay=5)
def send_registration_email(self, email: str, name: str):
    """
    Sends a welcome email to candidates or employers on Signup.
    Using bind=True allows us to retry exponentially on failure.
    """
    try:
        # TODO: Implement SMTP
        print(f"Mock Email sent to {email}. Welcome {name}!")
        return True
    except Exception as exc:
        raise self.retry(exc=exc)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def compute_simulation_results(self, candidate_id: int, code_snippet: str):
    """
    Long-running background task that evaluates candidate simulation code.
    """
    from app.services.sandbox import run_code_in_sandbox
    try:
        result = run_code_in_sandbox(code_snippet)
        # TODO: DB insert result
        print(f"Candidate {candidate_id} simulation completed: {result['status']}")
        return result
    except Exception as exc:
        raise self.retry(exc=exc)
