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
    image_array: numpy array shape (28, 28) ATAU (1, 28, 28, 1), nilai 0-1
    Returns: dict berisi prediksi dan aktivasi tiap layer
    """
    # Pastikan shape selalu (1, 28, 28, 1) apapun yang dikirim
    image_array = np.array(image_array, dtype=np.float32)
    if image_array.ndim == 2:
        image_array = image_array.reshape(1, 28, 28, 1)
    elif image_array.ndim == 4:
        pass  # sudah benar
    else:
        image_array = image_array.reshape(1, 28, 28, 1)

    x = tf.constant(image_array, dtype=tf.float32)


    # Jalankan tiap layer satu per satu
    # Dropout dinonaktifkan saat inferensi (training=False)
    layer_outputs = {}
    current = x
    for layer in model.layers:
        if isinstance(layer, tf.keras.layers.Dropout):
            # Lewati dropout saat inferensi — tidak ubah nilai
            current = layer(current, training=False)
        else:
            current = layer(current)
        layer_outputs[layer.name] = current.numpy()

    names = [layer.name for layer in model.layers]

    # =====================================================
    # Layer names baru (setelah temanmu update model):
    # [0] conv2d              → Conv1
    # [1] max_pooling2d       → Pool1
    # [2] conv2d_1            → Conv2
    # [3] max_pooling2d_1     → Pool2
    # [4] flatten             → (skip)
    # [5] dense               → FC1
    # [6] dropout             → (skip)
    # [7] dense_1             → Output (10 kelas)
    # =====================================================

    conv1  = layer_outputs[names[0]]  # (1, H, W, 6)
    pool1  = layer_outputs[names[1]]  # (1, H, W, 6)
    conv2  = layer_outputs[names[2]]  # (1, H, W, 16)
    pool2  = layer_outputs[names[3]]  # (1, H, W, 16)
    fc1    = layer_outputs[names[5]]  # (1, N) — dense
    # names[6] = dropout → skip
    output = layer_outputs[names[7]]  # (1, 10) — dense_1

    result = {
        "prediction": int(np.argmax(output[0])),
        "confidence": output[0].tolist(),
        "activations": {
            "conv1":  [normalize(conv1[0, :, :, i]).tolist() for i in range(conv1.shape[-1])],
            "pool1":  [normalize(pool1[0, :, :, i]).tolist() for i in range(pool1.shape[-1])],
            "conv2":  [normalize(conv2[0, :, :, i]).tolist() for i in range(conv2.shape[-1])],
            "pool2":  [normalize(pool2[0, :, :, i]).tolist() for i in range(pool2.shape[-1])],
            "fc1":    normalize(fc1[0]).tolist(),
            "fc2":    [],          # Tidak ada FC2 di model baru (ada dropout di sini)
            "output": normalize(output[0]).tolist(),
        }
    }

    return result

# Debug: print nama layer saat startup
print("📋 Layer names:", [l.name for l in model.layers])
