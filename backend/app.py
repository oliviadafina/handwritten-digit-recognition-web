import base64
import io
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageOps
import model as cnn_model

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "CNN Backend is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        image_data = data["image"]

        if "," in image_data:
            image_data = image_data.split(",")[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("L")

        # ✅ FIX 1: Crop hanya area yang ada angkanya (bounding box)
        image_array = np.array(image)
        coords = np.argwhere(image_array > 30)  # pixel non-background

        if len(coords) == 0:
            # Kalau canvas kosong, kirim array hitam
            image_array = np.zeros((28, 28), dtype=np.float32)
        else:
            y0, x0 = coords.min(axis=0)
            y1, x1 = coords.max(axis=0)

            # ✅ FIX 2: Crop digit, lalu tambah padding 20% supaya mirip MNIST
            cropped = image.crop((x0, y0, x1 + 1, y1 + 1))
            
            w, h = cropped.size
            padding = int(max(w, h) * 0.3)  # padding 30%
            
            padded = ImageOps.expand(cropped, border=padding, fill=0)

            # ✅ FIX 3: Resize ke 20x20 dulu, lalu center di canvas 28x28 (cara MNIST)
            digit = padded.resize((20, 20), Image.LANCZOS)
            
            final = Image.new("L", (28, 28), 0)
            final.paste(digit, (4, 4))  # center di 28x28
            
            image_array = np.array(final) / 255.0

        result = cnn_model.predict(image_array)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting CNN Backend Server...")
    print("📡 Listening on http://localhost:5000")
    app.run(debug=True, port=5000)