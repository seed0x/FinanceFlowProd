
from flask import Flask, render_template, jsonify, request, redirect, url_for
from dotenv import load_dotenv
load_dotenv()
from routes import api
app = Flask(__name__)
app.register_blueprint(api, url_prefix="/api")
@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
        if request.method == 'POST':
            return "Welcome"   
        else:
            return render_template('login.html')



if __name__ == "__main__":
    app.run(debug=True)

