import requests
import os
import sys

# Configuration
BASE_URL = "http://localhost:8000/api"
EMAIL = "test_student@example.com"
PASSWORD = "password123"

def run_test():
    print("🚀 Starting Integration Test: Code Execution")
    
    # 1. Login
    print("\n1. Logging in...")
    try:
        auth_res = requests.post(f"{BASE_URL}/auth/token", data={
            "username": EMAIL,
            "password": PASSWORD
        })
        if auth_res.status_code != 200:
            # Try to register if login fails
            print("Login failed. Attempting verification/registration...")
            # For simplicity, let's assume user exists or we manually created one.
            # If 401/404, we might need to seed data.
            print(f"Auth failed: {auth_res.text}")
            return
            
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login successful.")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # 2. Get Courses to find a lesson
    print("\n2. Fetching Courses...")
    courses_res = requests.get(f"{BASE_URL}/courses", headers=headers)
    if courses_res.status_code != 200:
        print(f"❌ Failed to get courses: {courses_res.text}")
        return
    
    courses = courses_res.json()
    if not courses:
        print("❌ No courses found. Seed database first.")
        return
        
    course = courses[0]
    print(f"✅ Found course: {course['title']}")
    
    # 3. Get First Lesson
    print("\n3. Fetching First Lesson...")
    if not course['lessons']:
         print("❌ Course has no lessons.")
         return
         
    lesson = course['lessons'][0]
    print(f"✅ Found lesson: {lesson['title']} (ID: {lesson['id']})")
    
    # 4. Enroll (idempotent)
    print("\n4. Enrolling...")
    requests.post(f"{BASE_URL}/enrollments", json={"course_id": course['id']}, headers=headers)
    print("✅ Enrolled (or already enrolled).")

    # 5. Submit Code
    print("\n5. Submitting Code...")
    # We need to know what the challenge is to send correct code. 
    # For now, let's assume a simple "Hello World" or generic python success.
    # To be robust, we should maybe fetch the challenge first?
    # But get_lesson returns challenge info?
    
    # Let's try a generic good submission.
    code = "print('Hello World')"
    
    submit_res = requests.post(f"{BASE_URL}/submissions/submit_code", json={
        "code_submitted": code,
        "lesson_id": lesson['id']
    }, headers=headers)
    
    if submit_res.status_code != 200:
        print(f"❌ Submission failed HTTP: {submit_res.text}")
        return
        
    result = submit_res.json()
    print(f"Result: {result['status']}")
    print(f"Output: {result.get('stdout', '').strip()}")
    
    if result['status'] == "Passed" or result.get('exit_code') == 0:
        print("✅ TEST PASSED: Code executed successfully.")
    else:
        print("❌ TEST FAILED: Code did not pass.")

if __name__ == "__main__":
    run_test()
