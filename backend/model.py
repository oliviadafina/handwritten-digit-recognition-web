import numpy as np
import tensorflow as tf
from tensorflow import keras

MODEL_PATH = "mnist_model_kaggle.h5"

# Load model sekali saja saat server start
model = keras.models.load_model(MODEL_PATH)

def normalize(arr):
    """Normalisasi array ke range 0-1 untuk pewarnaan."""
    mn, mx = arr.min(), arr.max()
    if mx - mn < 1e-8:
        return np.zeros_like(arr)
    return (arr - mn) / (mx - mn)

def predict(image_array):
    """
    image_array: numpy array shape (28, 28) dengan nilai 0-1
    Returns: dict berisi prediksi dan aktivasi tiap layer
    """
    # Reshape ke (1, 28, 28, 1)
    x = tf.constant(image_array.reshape(1, 28, 28, 1), dtype=tf.float32)

    # Jalankan tiap layer satu per satu dan simpan outputnya
    layer_outputs = {}
    current = x
    for layer in model.layers:
        current = layer(current)
        layer_outputs[layer.name] = current.numpy()

    # Ambil output tiap layer berdasarkan nama
    # Nama layer bisa dilihat dengan: [l.name for l in model.layers]
    names = [layer.name for layer in model.layers]

    conv1  = layer_outputs[names[0]]  # Conv2D(6) → (1, 24, 24, 6)
    pool1  = layer_outputs[names[1]]  # AvgPool   → (1, 12, 12, 6)
    conv2  = layer_outputs[names[2]]  # Conv2D(16)→ (1, 8, 8, 16)
    pool2  = layer_outputs[names[3]]  # AvgPool   → (1, 4, 4, 16)
    # names[4] = Flatten
    fc1    = layer_outputs[names[5]]  # Dense(120) → (1, 120)
    fc2    = layer_outputs[names[6]]  # Dense(84)  → (1, 84)
    output = layer_outputs[names[7]]  # Dense(10)  → (1, 10)

    result = {
        "prediction": int(np.argmax(output[0])),
        "confidence": output[0].tolist(),
        "activations": {
            # Conv/Pool: list of 2D arrays (satu per filter)
            "conv1": [normalize(conv1[0, :, :, i]).tolist() for i in range(conv1.shape[-1])],
            "pool1": [normalize(pool1[0, :, :, i]).tolist() for i in range(pool1.shape[-1])],
            "conv2": [normalize(conv2[0, :, :, i]).tolist() for i in range(conv2.shape[-1])],
            "pool2": [normalize(pool2[0, :, :, i]).tolist() for i in range(pool2.shape[-1])],
            # FC: 1D array
            "fc1":    normalize(fc1[0]).tolist(),
            "fc2":    normalize(fc2[0]).tolist(),
            "output": normalize(output[0]).tolist(),
        }
    }

    return result

# Debug: print nama-nama layer saat startup
print("📋 Layer names:", [l.name for l in model.layers])
