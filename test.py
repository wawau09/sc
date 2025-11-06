from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    # index.html을 templates 폴더에서 불러옴
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
