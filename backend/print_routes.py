from app.main import app

def print_routes():
    for route in app.routes:
        if hasattr(route, "path"):
            if "ecosystem" in route.path:
                print(route.path)

if __name__ == "__main__":
    print_routes()
