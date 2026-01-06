from flask import Flask, jsonify, render_template, request, redirect, session
import os
import sqlite3
from datetime import datetime
import random
from supabase import create_client, Client


SUPABASE_URL = "https://ktrurjresubcppberwis.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cnVyanJlc3ViY3BwYmVyd2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMzQ4NDUsImV4cCI6MjA3OTYxMDg0NX0.2K1n93-zseOvSU27KTnkAIyl5VGo7NibERubEnkdtRY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
app.secret_key = "secret123"
DB_PATH = os.path.join(app.root_path, "database.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            email TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rankings (
            email TEXT PRIMARY KEY,
            score REAL NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(email) REFERENCES user_profiles(email)
        )
    """)
    conn.commit()
    conn.close()

def ensure_profile(email):
    if not email:
        return
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM user_profiles WHERE email = ?", (email,))
    exists = cursor.fetchone()
    if not exists:
        display_name = email.split("@")[0]
        cursor.execute(
            "INSERT INTO user_profiles (email, display_name, updated_at) VALUES (?, ?, ?)",
            (email, display_name, datetime.utcnow().isoformat())
        )
        conn.commit()
    conn.close()

init_db()

def map_signup_error(exc):
    message = str(exc)
    lower = message.lower()
    if "user already registered" in lower or "user_already_exists" in lower or "already registered" in lower:
        return "이미 있는 아이디(이메일)입니다."
    if "invalid email" in lower or ("email" in lower and "invalid" in lower):
        return "이메일 형식이 올바르지 않습니다."
    if "weak_password" in lower or ("password" in lower and "weak" in lower):
        return "비밀번호가 너무 약합니다."
    if "rate limit" in lower or "too many requests" in lower:
        return "요청이 너무 많습니다. 잠시 후 다시 시도하세요."
    return f"회원가입 실패: {message}"

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
                if result.session:
                    session['access_token'] = result.session.access_token
                    session['refresh_token'] = result.session.refresh_token
                ensure_profile(session['user'])
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
            error_message = map_signup_error(e)
            return render_template('signup.html', error_message=error_message)

    return render_template('signup.html', error_message=None)

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
    email = session['user']
    ensure_profile(email)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT display_name FROM user_profiles WHERE email = ?", (email,))
    row = cursor.fetchone()
    cursor.execute("SELECT score FROM rankings WHERE email = ?", (email,))
    score_row = cursor.fetchone()
    conn.close()
    display_name = row["display_name"] if row else email.split("@")[0]
    best_score = score_row["score"] if score_row else None
    message = request.args.get('msg', '')
    return render_template(
        'profile.html',
        email=email,
        display_name=display_name,
        best_score=best_score,
        message=message
    )

@app.route('/profile', methods=['POST'])
def update_profile():
    if 'user' not in session:
        return redirect('/login')
    new_name = request.form.get('display_name', '').strip()
    if not new_name:
        return redirect('/profile')
    email = session['user']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_profiles (email, display_name, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
            display_name = excluded.display_name,
            updated_at = excluded.updated_at
    """, (email, new_name, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return redirect('/profile')

@app.route('/profile/password', methods=['POST'])
def update_password():
    if 'user' not in session:
        return redirect('/login')
    current_pw = request.form.get('current_password', '').strip()
    new_pw = request.form.get('new_password', '').strip()
    confirm_pw = request.form.get('confirm_password', '').strip()
    if not current_pw or not new_pw or new_pw != confirm_pw:
        return redirect('/profile?msg=비밀번호+확인+필요')

    email = session['user']
    try:
        reauth = supabase.auth.sign_in_with_password({
            "email": email,
            "password": current_pw
        })
        if not reauth.user or not reauth.session:
            return redirect('/profile?msg=현재+비밀번호+오류')
        access_token = reauth.session.access_token
        supabase.auth.update_user({"password": new_pw}, access_token=access_token)
        session['access_token'] = access_token
        session['refresh_token'] = reauth.session.refresh_token
        return redirect('/profile?msg=비밀번호+변경+완료')
    except Exception:
        return redirect('/profile?msg=비밀번호+변경+실패')

# 시뮬레이터 페이지
@app.route('/sc.html')
def sc_page():
    return render_template('sc.html')

# # /data 라우트 (테스트용 랜덤 데이터)
# @app.route('/data')
# def get_data():
#     line = random.randint(0, 1023)
#     return jsonify({"arduino_data": line})

@app.route('/rankings')
def rankings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.score, COALESCE(p.display_name, r.email) AS display_name
        FROM rankings r
        LEFT JOIN user_profiles p ON p.email = r.email
        ORDER BY r.score DESC, r.updated_at DESC
        LIMIT 10
    """)
    rows = cursor.fetchall()
    conn.close()
    data = [{"display_name": row["display_name"], "score": row["score"]} for row in rows]
    return jsonify({"rankings": data})

@app.route('/rankings/update', methods=['POST'])
def update_rankings():
    if 'user' not in session:
        return jsonify({"error": "로그인 필요"}), 401
    payload = request.get_json(silent=True) or {}
    score = payload.get("score")
    if score is None:
        return jsonify({"error": "score 필요"}), 400
    try:
        score = float(score)
    except (TypeError, ValueError):
        return jsonify({"error": "score 형식 오류"}), 400

    email = session['user']
    ensure_profile(email)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT score FROM rankings WHERE email = ?", (email,))
    row = cursor.fetchone()
    now = datetime.utcnow().isoformat()
    if row is None or score > row["score"]:
        cursor.execute("""
            INSERT INTO rankings (email, score, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
                score = excluded.score,
                updated_at = excluded.updated_at
        """, (email, score, now))
        conn.commit()
    conn.close()
    return jsonify({"ok": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
