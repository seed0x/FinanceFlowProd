
from flask_cors import CORS
from flask import Flask, render_template, jsonify, request, redirect, url_for,session
from dotenv import load_dotenv
load_dotenv()
from routes import transactions_bp, analytics_bp, auth_bp

app = Flask(__name__)

# CONFIG
app.secret_key = 't1am4-4t2am-t1am4-4t3am'
app.register_blueprint(transactions_bp, url_prefix="/api")
app.register_blueprint(analytics_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api")

CORS(app, supports_credentials=True) #supports_credntials will allow cookies/sessions

if __name__ == "__main__":
    app.run(debug=True)

