import base64
import io
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import model as cnn_model

app = Flask(__name__)
CORS(app)  # Izinkan request dari browser (frontend)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "CNN Backend is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Ambil gambar base64 dari request
        image_data = data["image"]

        # Hapus prefix "data:image/png;base64," jika ada
        if "," in image_data:
            image_data = image_data.split(",")[1]

        # Decode base64 → bytes → PIL Image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("L")  # Grayscale

        # Resize ke 28x28
        image = image.resize((28, 28), Image.LANCZOS)

        # Konversi ke numpy array, normalisasi 0-1
        image_array = np.array(image) / 255.0

        # Jalankan prediksi + ekstrak aktivasi
        result = cnn_model.predict(image_array)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting CNN Backend Server...")
    print("📡 Listening on http://localhost:5000")
    app.run(debug=True, port=5000)
