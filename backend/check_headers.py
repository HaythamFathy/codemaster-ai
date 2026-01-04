import requests

headers = {
    "Origin": "https://codemaster-ai.vercel.app",
    "Access-Control-Request-Method": "GET",
    "Access-Control-Request-Headers": "ngrok-skip-browser-warning"
}
try:
    r = requests.options("http://localhost:8001/courses/", headers=headers, timeout=2)
    print(f"Allow-Headers: {r.headers.get('access-control-allow-headers')}")
except Exception as e:
    print(e)
