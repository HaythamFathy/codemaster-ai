from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import os

# We can rely on os.environ for config, or pass a Config object if we had a .env file loader that authlib likes.
# Since we are using python-dotenv in main.py, os.environ should be populated.

oauth = OAuth()

oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)
