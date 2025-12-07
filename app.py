from flask import Flask, jsonify, render_template, request, redirect, session
import random
from supabase import create_client, Client

SUPABASE_URL = "https://ktrurjresubcppberwis.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cnVyanJlc3ViY3BwYmVyd2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMzQ4NDUsImV4cCI6MjA3OTYxMDg0NX0.2K1n93-zseOvSU27KTnkAIyl5VGo7NibERubEnkdtRY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
app.secret_key = "secret123"

# 로그인
@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form['username'].strip()   # username → email로 사용
        password = request.form['password'].strip()

        try:
            result = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            # 로그인 성공
            if result.user: 
                session['user'] = result.user.email
                return redirect('/')
            else:
                return "로그인 실패했다 이기야. 이메일/비번 확인해라."

        except Exception as e:
            return "로그인 중 오류났데이: " + str(e)

    return render_template('login.html')

# 회원가입
@app.route('/signup', methods=['GET','POST'])
def signup():
    if request.method == 'POST':
        email = request.form['username'].strip()
        password = request.form['password'].strip()

        try:
            result = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            return redirect('/login')

        except Exception as e:
            return "회원가입 실패했다 이기야: " + str(e)

    return render_template('signup.html')

# 로그아웃
@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

# index.html
@app.route('/')
def index():
    return render_template('index.html')

# 프로필 페이지
@app.route('/profile')
def profile():
    if 'user' not in session:
        return redirect('/login')
    return f"프로필 페이지: {session['user']} 이기야"

# # /data 라우트 (테스트용 랜덤 데이터)
# @app.route('/data')
# def get_data():
#     line = random.randint(0, 1023)
#     return jsonify({"arduino_data": line})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
