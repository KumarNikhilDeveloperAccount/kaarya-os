from app.main import app

for route in app.routes:
    print(f"{getattr(route, 'methods', None)} {getattr(route, 'path', route.path if hasattr(route, 'path') else 'Unknown')}")
