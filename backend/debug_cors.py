import requests
import os

# Configuration
BACKEND_LOCAL_URL = "http://localhost:8001"
# The origin we want to test
TEST_ORIGIN = "https://codemaster-ai.vercel.app"

def test_cors():
    print(f"Testing CORS for origin: {TEST_ORIGIN}")
    print(f"Target URL: {BACKEND_LOCAL_URL}/courses/")
    
    headers = {
        "Origin": TEST_ORIGIN,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "ngrok-skip-browser-warning"
    }
    
    try:
        response = requests.options(f"{BACKEND_LOCAL_URL}/courses/", headers=headers, timeout=5)
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for k, v in response.headers.items():
            if "access-control" in k.lower():
                print(f"  {k}: {v}")
                
        if response.headers.get("access-control-allow-origin") == TEST_ORIGIN:
            print("\nSUCCESS: Access-Control-Allow-Origin header is present and correct.")
        else:
            print(f"\nFAILURE: Access-Control-Allow-Origin header is missing or incorrect. Got: {response.headers.get('access-control-allow-origin')}")
            
    except Exception as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    test_cors()
