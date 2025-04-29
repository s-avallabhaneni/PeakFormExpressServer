import os
from flask import Flask, flash, request
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)
model = tf.keras.models.load_model(os.path.abspath('squat_model_v1.keras'))
sample_input = np.random.random((1, 512, 512, 3))
print('shape', sample_input.shape)

def isPng(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'png'


def resize_and_crop_image(image):
    orig_w, orig_h = image.size

    if orig_w < orig_h:
        resize_ratio = 512 / orig_w
        new_w = 512
        new_h = int(orig_h * resize_ratio)
    
    else:
        resize_ratio = 512 / orig_h
        new_h = 512
        new_w = int(orig_w * resize_ratio)
    
    resized_img = image.resize(( new_w, new_h ), Image.Resampling.LANCZOS)

    left = (new_w - 512) // 2
    top = (new_h - 512) // 2
    right = left + 512
    bottom = top + 512

    cropped_img = resized_img.crop((left, top, right, bottom))

    return cropped_img

def predict(image_arr):
    predictions = model.predict(image_arr)
    chosen = np.argmax(predictions[0])
    class_names = ['squats', 'bench_press', 'bicep_curls', 'lunges', 'shoulder_press']
    return class_names[chosen]



@app.route("/classify", methods=['POST'])
def classify():
    if "file" not in request.files:
        return ({ "message": "No image attached "}), 400
    
    file = request.files['file']
    if file.filename == '':
        return ({ "message": "Empty File Sent"}), 401
    
    if file and isPng(file.filename):
        try:
            img = Image.open(file).convert('RGB')

            new_img = resize_and_crop_image(img)
            image_arr = np.array(new_img)
            image_arr = image_arr / 255.0
            image_arr = np.expand_dims(image_arr, axis=0)
            print(image_arr.shape)
            classification = predict(image_arr)

            return({ "message": classification}), 200
        except Exception as e:
            return ({ "message": str(e)}), 401




app.run(debug=True)