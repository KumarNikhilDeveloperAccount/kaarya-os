from fastapi import FastAPI, Body
from fastapi.testclient import TestClient

app = FastAPI()

@app.post("/test1")
def test1(
    resume_text: str = Body(..., embed=True),
    job_description: str = Body(..., embed=True)
):
    return {"resume_text": resume_text, "job_description": job_description}

client = TestClient(app)

def test_routes():
    payload = {
        "resume_text": "hello",
        "job_description": "world"
    }
    r = client.post("/test1", json=payload)
    print("test1 response:", r.status_code, r.text)

if __name__ == "__main__":
    test_routes()
