
from flask_cors import CORS
from flask import Flask, render_template, jsonify, request, redirect, url_for,session
from dotenv import load_dotenv
load_dotenv()
from routes import api

app = Flask(__name__)

# CONFIG
app.secret_key = 't1am4-4t2am-t1am4-4t3am'
app.register_blueprint(api, url_prefix="/api")

CORS(app)

USERS = {
    'derek':'123',
    'vlad':'123',
    'david':'123'
}



@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
        if request.method == 'POST':
            
             data = request.get_json() or {}
             user = data.get('user') 
             password = data.get('password')   
             
             if user in USERS and USERS[user] == password:
                session['user'] = user
                return {'success': True}   
             else:
                return {'success': False, 'error': 'Invalid credentials'}, 401

@app.route('/dashboard')
def dashboard():
	return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)

