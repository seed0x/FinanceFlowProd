import os
from flask_cors import CORS
from flask import Flask, render_template, jsonify, request, redirect, url_for,session
from dotenv import load_dotenv
load_dotenv()
from routes import transactions_bp, analytics_bp, auth_bp, budgets_bp, plaid_bp
from status import status_bp

from db import init_db

app = Flask(__name__)

# CONFIG 
app.secret_key = 't1am4-4t2am-t1am4-4t3am'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Required for cross-origin requests
app.config['SESSION_COOKIE_SECURE'] = True  # Required when SameSite=None
app.config['SESSION_COOKIE_HTTPONLY'] = True

# right now SQLite by default, override with DATABASE_URL for getting Postgres
database_url = os.getenv("DATABASE_URL", "sqlite:///financeflow.db")
# Fix for SQLAlchemy 2.x: postgres:// is deprecated, must use postgresql://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Init ORM + Migratoins
init_db(app)

# CORS 
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173", 
    "http://localhost:5174", 
    "https://myfinance-henna.vercel.app",
    "https://myfinance-git-main-seedxs-projects.vercel.app",
    "https://myfinance-omvmjfhqr-seedxs-projects.vercel.app",
    "https://myfinance-mwsooblga-seedxs-projects.vercel.app"
])

# Register blueprints
app.register_blueprint(transactions_bp, url_prefix="/api")
app.register_blueprint(analytics_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(budgets_bp, url_prefix="/api")
app.register_blueprint(status_bp)
app.register_blueprint(plaid_bp, url_prefix="/api")



if __name__ == "__main__":
    app.run(debug=True)

