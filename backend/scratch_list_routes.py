from app.main import app

for route in app.routes:
    # Handle API routes
    if hasattr(route, 'path'):
        print(f"Path: {route.path} | Methods: {getattr(route, 'methods', 'N/A')}")
