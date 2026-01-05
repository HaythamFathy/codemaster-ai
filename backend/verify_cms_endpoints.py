import requests

BASE_URL = "http://localhost:8001"

def check_endpoint(method, path, expected_status_codes):
    try:
        url = f"{BASE_URL}{path}"
        response = requests.request(method, url)
        if response.status_code in expected_status_codes:
            print(f"PASS: {method} {path} returned {response.status_code} (Expected {expected_status_codes})")
            return True
        else:
            print(f"FAIL: {method} {path} returned {response.status_code} (Expected {expected_status_codes})")
            return False
    except Exception as e:
        print(f"ERROR: Could not connect to {url}: {e}")
        return False

def verify():
    print("Verifying CMS Endpoints...")
    # We expect 401 Unauthorized (since no token provided) or 403, NOT 404.
    # If it returns 404, the router isn't registered.
    
    # 1. Course CRUD (POST)
    check_endpoint("POST", "/courses/", [401, 403])
    
    # 2. Lesson CRUD (GET/POST)
    # Note: GET /lessons/{course_id} is public or student access? implementation says depends(get_db) so public access likely allowed or 200 with empty list.
    # Checking POST which is admin only.
    check_endpoint("POST", "/lessons/", [401, 403])
    
    # 3. Check if we can get the course list (GET /courses/) - should be 200
    check_endpoint("GET", "/courses/", [200])

if __name__ == "__main__":
    verify()
