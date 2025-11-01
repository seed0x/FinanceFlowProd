from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash


from models import db, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post('/login')
def login():
    data = request.get_json() or {}
    username = data.get('user')
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return {'success': False, 'error': 'Couldnt find you in the database'}, 401
    
    if user and check_password_hash(user.password, password):
        session.clear()  # Clear any existing session data first
        session['user'] = username
        session['user_id'] = user.id
        print(f"Session set: {session}")  # Debug
        return {'success': True, 'user': username}, 200
    else: 
        print("Login failed")  # Debug
        return {'success': False, 'error': 'Invalid credentials'}, 401
       

@auth_bp.get('/user')
def get_current_user():
    print(f"Checking session: {session}")  # Debug
    if 'user' not in session:
        return {'error': 'Not logged in'}, 401
    
    return {'user': session['user']}, 200

@auth_bp.post('/logout')
def logout():
    session.clear()  # Clear entire session
    return {'success': True}, 200

# Sign-Up endpoint
@auth_bp.post('/signup')
def signup():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Create new user if doesn't exist
        hashed_password = generate_password_hash(password)
        user = User(username=username, password=hashed_password, email=email)
        db.session.add(user)
        db.session.commit()
        return {'success': True, 'user': username}, 200  
    else:
        print("You already have an account")  # Debug
        return {'success': False, 'error': 'Already registered'}, 401
