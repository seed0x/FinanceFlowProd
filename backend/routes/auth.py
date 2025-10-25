from flask import Blueprint, request, jsonify, session

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
    if not username or not password:
        return {'success': False, 'error': 'Missing credentials'}, 400
    if USERS.get(username) != password:
        return {'success': False, 'error': 'Invalid credentials'}, 401

    # find-or-create DB user so we can scope data by user_id
    user = User.query.filter_by(username=username).first()
    if not user:
        user = User(username=username)
        db.session.add(user)
        db.session.commit()

    session['user'] = username
    session['user_id'] = user.id
    return {'success': True, 'user': username}, 200


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