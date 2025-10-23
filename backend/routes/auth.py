from flask import Blueprint, request, jsonify, session

auth_bp = Blueprint("auth", __name__)

USERS = {
    'derek':'123',
    'vlad':'123',
    'david':'123'
}

@auth_bp.post('/login')
def login():
        if request.method == 'POST':
            
             data = request.get_json() or {}
             user = data.get('user') 
             password = data.get('password')   
             
             if user in USERS and USERS[user] == password:
                session['user'] = user
                print(f"Session set: {session}")# Debug
                return {'success': True, 'user': user}, 200  
             else:
                print("Login failed")# Debug
                return {'success': False, 'error': 'Invalid credentials'}, 401

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