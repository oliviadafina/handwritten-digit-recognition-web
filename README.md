# ✍️ Handwritten Digit Recognition Web

Aplikasi web interaktif untuk mengenali angka tulisan tangan (0–9) menggunakan model **CNN LeNet** yang dilatih pada dataset **MNIST**, dilengkapi dengan **visualisasi 3D arsitektur CNN** secara real-time.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?logo=tensorflow&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r128-000000?logo=three.js&logoColor=white)

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Arsitektur Proyek](#-arsitektur-proyek)
- [Prasyarat](#-prasyarat)
- [Instalasi & Menjalankan](#-instalasi--menjalankan)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Setup Backend](#2-setup-backend)
  - [3. Jalankan Frontend](#3-jalankan-frontend)
- [Penggunaan](#-penggunaan)
- [Teknologi](#-teknologi)

---

## ✨ Fitur

- **Canvas Gambar** — Gambar angka 0–9 langsung di browser (mendukung mouse & touch)
- **Prediksi Real-time** — Model CNN LeNet memproses gambar dan menampilkan prediksi beserta confidence score
- **Visualisasi 3D CNN** — Arsitektur jaringan saraf divisualisasikan dalam 3D menggunakan Three.js, dengan aktivasi layer yang terupdate secara real-time
- **Responsive** — Mendukung desktop dan perangkat mobile

---

## 📁 Arsitektur Proyek

```
handwritten-digit-recognition-web/
├── backend/
│   ├── app.py                  # Flask server (API endpoint)
│   ├── model.py                # Load model & fungsi prediksi
│   ├── mnist_model_kaggle.h5   # Model CNN yang sudah dilatih
│   └── venv/                   # Virtual environment Python
├── frontend/
│   ├── index.html              # Halaman utama
│   ├── style.css               # Styling (Ethereal Glass design)
│   ├── main.js                 # Canvas drawing & komunikasi backend
│   └── cnn3d.js                # Visualisasi 3D arsitektur CNN
└── docs/                       # Dokumentasi proyek
```

---

## ⚙️ Prasyarat

Pastikan tools berikut sudah terinstal di sistem Anda:

| Tool       | Versi Minimum | Cek Instalasi          |
| ---------- | ------------- | ---------------------- |
| **Python** | 3.10+         | `python --version`     |
| **pip**    | 21+           | `pip --version`        |
| **Browser**| Modern        | Chrome / Firefox / Edge|

---

## 🚀 Instalasi & Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/oliviadafina/handwritten-digit-recognition-web.git
cd handwritten-digit-recognition-web
```

### 2. Setup Backend

#### a. Buat Virtual Environment

```bash
cd backend
python -m venv venv
```

#### b. Aktifkan Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
.\venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

#### c. Install Dependencies

```bash
pip install flask flask-cors numpy pillow tensorflow
```

#### d. Jalankan Backend Server

```bash
python app.py
```

Jika berhasil, akan muncul output:

```
🚀 Starting CNN Backend Server...
📡 Listening on http://localhost:5000
```

> **⚠️ Catatan:** Jangan tutup terminal ini. Backend harus tetap berjalan selama menggunakan aplikasi.

---

### 3. Jalankan Frontend

Buka terminal **baru** (terpisah dari backend), lalu jalankan salah satu cara berikut:

#### Opsi A: Menggunakan Python HTTP Server (Recommended)

```bash
cd frontend
python -m http.server 8000
```

Lalu buka browser dan akses: **http://localhost:8000**

#### Opsi B: Menggunakan VS Code Live Server

1. Install ekstensi **Live Server** di VS Code
2. Klik kanan pada `frontend/index.html`
3. Pilih **"Open with Live Server"**

#### Opsi C: Buka Langsung di Browser

Buka file `frontend/index.html` langsung di browser.

> **⚠️ Catatan:** Beberapa browser mungkin memblokir request ke backend karena CORS jika dibuka langsung via `file://`. Gunakan Opsi A atau B untuk menghindari masalah ini.

---

## 🎮 Penggunaan

1. Pastikan **backend sudah berjalan** di `http://localhost:5000`
2. Buka frontend di browser
3. Cek indikator status di bawah canvas — harus menampilkan **"Backend terhubung"**
4. **Gambar angka** (0–9) pada canvas hitam menggunakan mouse atau sentuhan
5. Prediksi akan muncul secara otomatis di panel kanan beserta confidence bar
6. Visualisasi 3D di panel tengah akan menampilkan aktivasi tiap layer CNN
7. Klik tombol **"Hapus"** untuk menghapus canvas dan menggambar ulang

---

## 🛠️ Teknologi

### Backend
- **Python 3.10+** — Bahasa pemrograman utama
- **Flask** — Web framework untuk REST API
- **TensorFlow / Keras** — Deep learning framework untuk model CNN
- **NumPy** — Komputasi numerik
- **Pillow (PIL)** — Pemrosesan gambar

### Frontend
- **HTML5 Canvas** — Area menggambar angka
- **Three.js** — Visualisasi 3D arsitektur CNN
- **Vanilla JavaScript** — Logika interaksi dan komunikasi API
- **CSS3** — Styling dengan efek glassmorphism

### Model
- **Arsitektur:** LeNet (Conv2D → AvgPool → Conv2D → AvgPool → Dense → Dense → Output)
- **Dataset:** MNIST (60,000 training / 10,000 testing images)
- **Input:** Gambar grayscale 28×28 piksel
- **Output:** Probabilitas untuk setiap angka 0–9
