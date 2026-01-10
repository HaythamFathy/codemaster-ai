import os
import logging
from openai import AsyncOpenAI, RateLimitError, APIError
from typing import Optional

# Logger configuration
logger = logging.getLogger(__name__)

# Initialize Async Client
# v1.0+ automatically looks for OPENAI_API_KEY env var
# We explicitly retrieve it to log a warning if missing.
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.warning("OPENAI_API_KEY not set. AI features will return mock responses.")

client = AsyncOpenAI(api_key=api_key) if api_key else None
MODEL = "gpt-3.5-turbo"

async def get_code_suggestion(prompt: str) -> str:
    """
    Asynchronously fetches a code suggestion or explanation from OpenAI.
    
    Args:
        prompt (str): The user's query or code context.
        
    Returns:
        str: The AI's response text.
        
    Raises:
        Mock response if API key is missing.
        Graceful error message on RateLimit or API failure.
    """
    if not client:
        return "AI Service Unavailable: API Key missing. (Mock Response)"

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful coding assistant. Provide concise and accurate Python code suggestions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()

    except RateLimitError:
        logger.error("OpenAI Rate Limit Exceeded")
        return "I'm currently overloaded with requests. Please try again in 30 seconds."
        
    except APIError as e:
        logger.error(f"OpenAI API Error: {str(e)}")
        return "I encountered a connection error. Please try again later."
        
    except Exception as e:
        logger.error(f"Unexpected AI Error: {str(e)}")
        return "An unexpected error occurred while processing your request."
