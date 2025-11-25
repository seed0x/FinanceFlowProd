import os
from plaid.api.plaid_api import PlaidApi
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
from dotenv import load_dotenv

load_dotenv()

# plaid config for sandbox
configuration = Configuration(
    host="https://sandbox.plaid.com",
    api_key={
        "clientId": os.getenv("PLAID_CLIENT_ID"),
        "secret": os.getenv("PLAID_SECRET")
    }
)

api_client = ApiClient(configuration)
plaid_client = PlaidApi(api_client)
