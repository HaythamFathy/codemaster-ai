import os
import json
import openai

# Initialize client configuration
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    openai.api_key = api_key

MODEL = "gpt-3.5-turbo"

def generate_challenge(video_topic: str):
    """
    Generates a coding challenge based on the video topic.
    Returns a dictionary with 'description', 'initial_code', and 'test_cases'.
    """
    if not api_key:
        import random
        challenges = [
            {
                "title": "Variable Mastery",
                "description": f"Create a variable called `my_var` and assign it a value based on {video_topic}. Then print its type.",
                "initial_code": "my_var = \n# Print type here",
                "test_cases": [{"input": "", "output": "<class"}]
            },
            {
                "title": "Data Type Detective",
                "description": f"Someone mixed up the data types! {video_topic}. Cast a string to an integer and print the result + 10.",
                "initial_code": "val = '42'\n# Your code",
                "test_cases": [{"input": "", "output": "52"}]
            },
            {
                "title": "The Printer",
                "description": f"Write a function that takes {video_topic} as input and prints it three times.",
                "initial_code": "def printer(val):\n    pass",
                "test_cases": [{"input": "a", "output": "aaa"}]
            }
        ]
        chosen = random.choice(challenges)
        # Ensure description handles the injected context gracefully
        clean_topic = video_topic.split('. Context:')[0]
        chosen['description'] = chosen['description'].replace(video_topic, clean_topic) + " (Mock AI Mode)"
        return chosen

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
        # Legacy API call (v0.28.1)
        response = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            # v0.28 won't validate response_format, but API might accept it. 
            # If it errors, remove likely. Keeping usage simple for now.
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

def get_voice_response(code_snippet: str, user_question: str):
    if not api_key:
        return f"Mock Voice Answer: You asked '{user_question}'. Try checking line 1 of your code: {code_snippet[:20]}..."

    system_prompt = "You are a friendly AI coding tutor. The student is speaking to you. Keep your answer conversational, short (under 2 sentences), and helpful. Do not read out code, just explain concepts."
    user_prompt = f"""
    Context (Student Code):
    {code_snippet}
    
    Student Question:
    {user_question}
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
        return "Sorry, I'm having trouble thinking right now."
