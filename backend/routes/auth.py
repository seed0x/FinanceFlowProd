from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash


from models import db, User

auth_bp = Blueprint("auth", __name__)

USERS = {
    'derek':'123',
    'vlad':'123',
    'david':'123'
}

@auth_bp.post('/login')
def login():
    data = request.get_json() or {}
    username = data.get('user')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    
    if not user:
        # Create new user if doesn't exist
        hashed_password = generate_password_hash(password)
        user = User(username=username, password=hashed_password)
        db.session.add(user)
        db.session.commit()
    
    if user and check_password_hash(user.password, password):
        session['user'] = username
        session['user_id'] = user.id
        print(f"Session set: {session}")  # Debug
        return {'success': True, 'user': username}, 200
    else:
        print("Login failed")  # Debug
        return {'success': False, 'error': 'Invalid credentials'}, 401
        db.session.commit()
        return {'success': False, 'error': 'Invalid credentials'}, 401

    # find-or-create DB user so we can scope data by user_id


@auth_bp.get('/user')
def get_current_user():
    print(f"Checking session: {session}")  # Debug
    if 'user' not in session:
        return {'error': 'Not logged in'}, 401
    
    return {'user': session['user']}, 200

@auth_bp.post('/logout')
def logout():
    session.pop('user', None)  # Remove user from session
    return {'success': True}, 200