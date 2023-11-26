import base64, json
from flask import Flask, render_template, request, jsonify, Response
from werkzeug.utils import secure_filename
import tensorflow as tf
from PIL import Image
import numpy as np
import cv2, io, math, os
import torch
from ultralytics import YOLO
from process import preparation, generate_response
import uuid
secret_key = uuid.uuid4().hex
print(secret_key)

# Download nltk
preparation()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/files'
app.secret_key = '70c6d037a8ba454595ed72e7abf29379'

global result_image_path

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/webcam")
def webcam():
    return render_template("webcam.html")

@app.route('/Predict', methods=["GET", "POST"])
def predict():
    text = request.get_json().get("message")
    response = generate_response(text)
    message = {"answer": response}
    return jsonify(message)


def process_image(image_path):
    image = Image.open(image_path)
    img_array = np.array(image)
    model = YOLO('model/best.pt')
    results = model.predict(img_array)
    classnames = ["Kucing Sakit", "Kucing Sehat"]

    for pred in results:
        prediction = pred.probs
        top1_index = int(prediction.top1)
        label = classnames[top1_index]
        probability = float(prediction.top1conf)  
        text = f"{label}: {probability:.2f}"
        print(text)
        
        font_scale = 2  
        font_thickness = 10
        font_color = (0, 255, 0)

        margin_top = 50
        text_coordinates = (10, 30 + margin_top)

        cv2.putText(img_array, text, text_coordinates, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_color, font_thickness, cv2.LINE_AA)

    return Image.fromarray(img_array)


def webcam_image(frame):
    model = YOLO('model/best.pt')
    results = model.predict(frame)
    classnames = ["Kucing Sakit", "Kucing Sehat"]

    for pred in results:
        prediction = pred.probs
        top1_index = int(prediction.top1)
        label = classnames[top1_index]
        probability = float(prediction.top1conf)  
        text = f"{label}: {probability:.2f}"

        font_scale = 1  
        font_thickness = 5
        font_color = (0, 255, 0)
        margin_top = 20
        text_coordinates = (10, 30 + margin_top)

        cv2.putText(frame, text, text_coordinates, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_color, font_thickness, cv2.LINE_AA)

    return frame


@app.route('/Upload-image', methods=['GET','POST'])
def detection_image():
    global result_image_path
    if request.method == 'POST':
        uploaded_file = request.files['file']

        if uploaded_file.filename != '':
            image_path = f"static/{uploaded_file.filename}"
            uploaded_file.save(image_path)
            processed_image = process_image(image_path)
            
            img_byte_array = io.BytesIO()
            processed_image.save(img_byte_array, format='JPEG')
            img_byte_array.seek(0)
            result_image_path = base64.b64encode(img_byte_array.getvalue()).decode('utf-8')

    return render_template('index.html', result_image_path=result_image_path, show_image=True)


def generate_frames():
    camera = cv2.VideoCapture(0)  # Gunakan 0 untuk kamera default

    while True:
        success, frame = camera.read()
        if not success:
            break

        processed_frame = webcam_image(frame)
        ret, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    camera.release()


cv2.destroyAllWindows()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    app.run(debug=True) 
