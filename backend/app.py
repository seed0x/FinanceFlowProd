
import os

from flask_cors import CORS
from flask import Flask, render_template, jsonify, request, redirect, url_for,session
from dotenv import load_dotenv
load_dotenv()
from routes import transactions_bp, analytics_bp, auth_bp

from db import init_db

app = Flask(__name__)

# CONFIG 
app.secret_key = 't1am4-4t2am-t1am4-4t3am'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

# right now SQLite by default, override with DATABASE_URL for getting Postgres
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "sqlite:///financeflow.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Init ORM + Migratoins
init_db(app)

# CORS 
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:5174", "https://finaceflow.onrender.com"])

# Register blueprints
app.register_blueprint(transactions_bp, url_prefix="/api")
app.register_blueprint(analytics_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api")


if __name__ == "__main__":
    app.run(debug=True)

