from app.main import app

def dump_routes():
    for route in app.routes:
        if hasattr(route, "path"):
            if "ecosystem" in route.path:
                print(f"Path: {route.path}, Methods: {getattr(route, 'methods', 'No methods')}")

if __name__ == "__main__":
    dump_routes()
