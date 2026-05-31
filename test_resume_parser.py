import asyncio
import httpx
import os

async def main():
    async with httpx.AsyncClient() as client:
        # Create a dummy PDF
        with open("dummy.pdf", "wb") as f:
            f.write(b"%PDF-1.4 dummy content")
            
        print("Testing POST /api/ai/resume/parse ...")
        
        with open("dummy.pdf", "rb") as f:
            files = {"file": ("dummy.pdf", f, "application/pdf")}
            data = {"job_description": "Software Engineer"}
            try:
                response = await client.post("http://localhost:8000/api/ai/parse-resume", json={"resume_text": "Test resume", "job_description": "Software Engineer"}, timeout=10)
                print(f"Status: {response.status_code}")
                print(f"Response: {response.text}")
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
