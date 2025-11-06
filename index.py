from flask import Flask, jsonify, render_template
import serial

app = Flask(__name__)
ser = serial.Serial('/dev/cu.usbmodem1101', 9600)

@app.route('/')
def index():
    # index.html을 templates 폴더에서 불러옴
    return render_template('index.html')

@app.route('/data')
def get_data():
    line = ser.readline().decode(errors='ignore').strip()
    print(line)
    return jsonify({"arduino_data": line})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
