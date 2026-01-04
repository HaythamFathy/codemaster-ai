import requests
import os

# Configuration
BACKEND_LOCAL_URL = "http://localhost:8001"
TEST_ORIGIN = "https://codemaster-ai.vercel.app"

def test_cors():
    print(f"Testing CORS for origin: {TEST_ORIGIN}")
    print(f"Target URL: {BACKEND_LOCAL_URL}/courses/")
    
    # Simulate the browser's preflight request
    headers = {
        "Origin": TEST_ORIGIN,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type,ngrok-skip-browser-warning"
    }
    
    try:
        response = requests.options(f"{BACKEND_LOCAL_URL}/courses/", headers=headers, timeout=5)
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for k, v in response.headers.items():
            if "access-control" in k.lower():
                print(f"  {k}: {v}")
                
        # Checks
        allow_origin = response.headers.get("access-control-allow-origin")
        allow_headers = response.headers.get("access-control-allow-headers")
        allow_creds = response.headers.get("access-control-allow-credentials")

        print(f"\n--- Analysis ---")
        if allow_origin == TEST_ORIGIN:
            print(f"PASS: Origin allowed correctly ({allow_origin})")
        else:
            print(f"FAIL: Origin mismatch. Expected '{TEST_ORIGIN}', got '{allow_origin}'")

        if allow_headers and "ngrok-skip-browser-warning" in allow_headers:
            print(f"PASS: Custom header allowed.")
        elif allow_headers == "*": # Some servers send *
            print(f"PASS: Wildcard headers allowed.")
        elif allow_headers:
             # FastAPI typically echoes 'content-type,ngrok-skip-browser-warning'
             if "ngrok-skip-browser-warning" in allow_headers:
                  print(f"PASS: Custom header found in echoed allowed headers: {allow_headers}")
             else:
                  print(f"FAIL: Custom header NOT found in allowed headers: {allow_headers}")
        else:
            print(f"FAIL: No Access-Control-Allow-Headers returned header.")

        if allow_creds == "true":
            print(f"PASS: Credentials allowed.")
        else:
            print(f"WARN: Credentials not expressly allowed (might be ok if not needed).")
            
    except Exception as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    test_cors()
