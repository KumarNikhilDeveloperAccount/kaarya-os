import requests

def run_tests():
    try:
        print("--- Testing Coding Engine ---")
        res = requests.post(
            'http://localhost:8000/api/coding/execute', 
            json={'language': 'c', 'code': '#include <stdio.h>\nint main() { printf("Hello from C!"); return 0; }'}
        )
        print('Coding Result:', res.json())
    except Exception as e:
        print('Coding Error:', e)
        
    try:
        print("\n--- Testing Interview Engine ---")
        res2 = requests.post(
            'http://localhost:8000/api/ai/assess-interview', 
            json={'job_description': 'Senior C Developer', 'candidate_resume': 'Expert in C', 'history': []}
        )
        print('Interview Result:', res2.json())
    except Exception as e:
        print('Interview Error:', e)

    try:
        print("\n--- Testing Rit.ai Chat ---")
        res3 = requests.post(
            'http://localhost:8000/api/ai/chat', 
            json={'message': 'Tell me what you do.', 'context': ''}
        )
        print('Rit.ai Result:', res3.json())
    except Exception as e:
        print('Rit.ai Error:', e)

if __name__ == "__main__":
    run_tests()
