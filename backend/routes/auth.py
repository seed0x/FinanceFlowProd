from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime, timedelta

from models import db, User
from auth_middleware import token_required

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = os.getenv('SECRET_KEY', 't1am4-4t2am-t1am4-4t3am')

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
        # Generate JWT token
        token = jwt.encode(
            {
                'user_id': user.id,
                'username': username,
                'exp': datetime.utcnow() + timedelta(days=30)  # Token expires in 30 days
            },
            SECRET_KEY,
            algorithm='HS256'
        )
        return {'success': True, 'user': username, 'token': token}, 200
    else: 
        print("Login failed")  # Debug
        return {'success': False, 'error': 'Invalid credentials'}, 401
       

@auth_bp.get('/user')
@token_required
def get_current_user(current_user_id, current_username):
    return {'user': current_username}, 200

@auth_bp.post('/logout')
def logout():
    # With JWT, logout is handled client-side by removing the token
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
        
        # Generate JWT token for new user
        token = jwt.encode(
            {
                'user_id': user.id,
                'username': username,
                'exp': datetime.utcnow() + timedelta(days=30)
            },
            SECRET_KEY,
            algorithm='HS256'
        )
        return {'success': True, 'user': username, 'token': token}, 200  
    else:
        print("You already have an account")  # Debug
        return {'success': False, 'error': 'Already registered'}, 401
