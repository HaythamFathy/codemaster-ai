from fastapi import FastAPI
app = FastAPI()

@app.get("/api/hello")
def hello():
    return {"message": "Hello from standalone index.py"}

@app.get("/api/debug")
def debug():
    return {"message": "Debug from standalone"}
