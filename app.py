from flask import Flask, jsonify, render_template, request, redirect, session
import sqlite3
import os
import random

app = Flask(__name__)
app.secret_key = "secret123"

DB_NAME = "database.db"

# DB 초기화
if not os.path.exists(DB_NAME):
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

# 로그인
@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()
        conn = sqlite3.connect(DB_NAME)
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
        user = cur.fetchone()
        conn.close()
        if user:
            session['user'] = username
            return redirect('/')
        return "아이디나 비밀번호 틀렸다 이기야"
    return render_template('login.html')

# 회원가입
@app.route('/signup', methods=['GET','POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()
        conn = sqlite3.connect(DB_NAME)
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username=?", (username,))
        if cur.fetchone():
            return "이미 존재하는 아이디다 이기야"
        cur.execute("INSERT INTO users(username,password) VALUES(?,?)", (username, password))
        conn.commit()
        conn.close()
        return redirect('/login')
    return render_template('signup.html')

# 로그아웃
@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')  # 로그아웃 후 index.html로 이동 → 버튼 표시 갱신

# index.html
@app.route('/')
def index():
    return render_template('index.html')  # 버튼 표시 제어는 index.html에서 session으로

# 프로필 페이지
@app.route('/profile')
def profile():
    if 'user' not in session:
        return redirect('/login')
    return f"프로필 페이지: {session['user']} 이기야"

# /data 라우트 (테스트용 랜덤 데이터)
@app.route('/data')
def get_data():
    line = random.randint(0, 1023)
    return jsonify({"arduino_data": line})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
