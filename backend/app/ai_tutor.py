import os
import json
import openai

# Initialize client if key is available, else None
MODEL = "gpt-3.5-turbo"
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    openai.api_key = api_key

def generate_challenge(video_topic: str):
    """
    Generates a coding challenge based on the video topic.
    Returns a dictionary with 'description', 'initial_code', and 'test_cases'.
    """
    if not api_key:
        return {
            "description": f"Mock Challenge for {video_topic} (No API Key)",
            "initial_code": "# Write your code here",
            "test_cases": [{"input": "1", "output": "1"}]
        }

    system_prompt = "You are a programming instructor. Generate a coding challenge based on the provided topic."
    user_prompt = f"""
    Topic: {video_topic}
    Output JSON format:
    {{
        "title": "Challenge Title",
        "description": "Problem description...",
        "initial_code": "# Starter code...",
        "test_cases": [
            {{"input": "...", "output": "..."}}
        ]
    }}
    """

    try:
        response = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"AI Generation Error: {e}")
        return {
            "error": "Failed to generate challenge",
            "details": str(e)
        }

def analyze_submission(student_code: str, error_log: str, challenge_description: str = ""):
    """
    Analyzes failed submission and provides a Socratic hint.
    """
    if not api_key:
        return f"Mock Hint: Check your logic related to {challenge_description[:20]}..."

    system_prompt = "You are a helpful tutor. Analyze the error and the challenge goal. Provide a Socratic hint (ask a leading question) rather than fixing the code. Do NOT reveal the answer."
    user_prompt = f"""
    Challenge Goal:
    {challenge_description}

    Student Code:
    {student_code}

    Error Log / Output:
    {error_log}

    Provide a short, guiding question to help the student debug."
    """

    try:
        response = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Could not generate hint: {str(e)}"

def generate_success_message(stdout: str):
    """
    Generates a congratulatory message from a 'Supportive Senior Engineer' persona.
    """
    if not api_key:
        return "Great job! Your code runs perfectly. Keep it up!"

    system_prompt = "You are a Supportive Senior Engineer. The student just solved a coding problem. Give a short, high-energy congratulatory message."
    user_prompt = f"""
    Student Output:
    {stdout}
    
    Write a brief praise (1-2 sentences).
    """

    try:
        response = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return "Awesome work! Code passed."
