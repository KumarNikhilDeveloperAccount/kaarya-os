import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.sandbox import run_code_in_sandbox

def test_sandbox_correct_code():
    res = run_code_in_sandbox('print("Hello from Kaarya Docker Sandbox!")')
    assert "Hello from Kaarya Docker Sandbox!" in res, "Sandbox failed to execute correct code."

def test_sandbox_infinite_loop():
    res = run_code_in_sandbox('while True: pass', timeout_seconds=2)
    assert "Timeout" in res, "Sandbox did not timeout on infinite loop."

def test_sandbox_error_code():
    res = run_code_in_sandbox('1/0')
    assert "ZeroDivisionError" in res, "Sandbox did not handle error code correctly."

if __name__ == "__main__":
    test_sandbox_correct_code()
    test_sandbox_infinite_loop()
    test_sandbox_error_code()
