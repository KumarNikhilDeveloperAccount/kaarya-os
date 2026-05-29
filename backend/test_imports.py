import sys
import os
sys.path.append(os.getcwd())

def test_import_support():
    try:
        from app.routers import support
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()
        assert False, "Import failed"
