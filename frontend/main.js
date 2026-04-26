// ========================================
// main.js — Canvas Drawing + Backend Communication
// ========================================

const BACKEND_URL = 'http://localhost:5000';

let isDrawing = false;
let debounceTimer = null;
let visualizer = null;

// Jalankan setelah semua HTML dimuat
document.addEventListener('DOMContentLoaded', () => {

  // --- Inisialisasi Three.js Visualizer ---
  visualizer = new CNNVisualizer('three-canvas');

  // --- Setup Canvas Gambar ---
  const canvas = document.getElementById('draw-canvas');
  const ctx = canvas.getContext('2d');

  // Background hitam, warna gambar putih (seperti MNIST)
  resetCanvas(ctx, canvas);

  // --- Event Mouse ---
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    document.getElementById('canvas-wrapper').classList.add('is-drawing');
    const pos = getPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getPos(canvas, e);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Kirim ke backend setelah 300ms berhenti menggambar
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => sendToBackend(canvas), 300);
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    document.getElementById('canvas-wrapper').classList.remove('is-drawing');
    sendToBackend(canvas);
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    document.getElementById('canvas-wrapper').classList.remove('is-drawing');
  });

  // --- Event Touch (tablet/mobile) ---
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    document.getElementById('canvas-wrapper').classList.add('is-drawing');
    const pos = getTouchPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getTouchPos(canvas, e);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => sendToBackend(canvas), 300);
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    isDrawing = false;
    document.getElementById('canvas-wrapper').classList.remove('is-drawing');
  });

  // --- Tombol Clear ---
  document.getElementById('clear-btn').addEventListener('click', () => {
    resetCanvas(ctx, canvas);
    document.getElementById('predicted-digit').textContent = '?';
    document.getElementById('predicted-digit').style.color = '';
    document.getElementById('confidence-bars').innerHTML =
      '<p id="conf-placeholder">Gambar angka untuk melihat prediksi</p>';
  });

  // --- Cek koneksi backend saat startup ---
  checkBackend();

  // --- Trigger entrance animations ---
  document.querySelectorAll('#draw-panel, #viz-panel, #predict-panel').forEach((el, i) => {
    el.style.setProperty('--entrance-delay', `${i * 120}ms`);
    el.classList.add('panel-enter');
  });
});

// ========================================
// Helper Functions
// ========================================

function resetCanvas(ctx, canvas) {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top)  * (canvas.height / rect.height),
  };
}

function getTouchPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top)  * (canvas.height / rect.height),
  };
}

async function checkBackend() {
  const statusEl = document.getElementById('backend-status');
  try {
    const res = await fetch(`${BACKEND_URL}/`);
    const data = await res.json();
    statusEl.querySelector('.status-text').textContent = 'Backend terhubung';
    statusEl.className = 'ok';
  } catch {
    statusEl.querySelector('.status-text').textContent = 'Backend tidak terhubung';
    statusEl.className = 'error';
  }
}

// ========================================
// Kirim gambar ke backend & update UI
// ========================================

async function sendToBackend(drawCanvas) {
  // Buat canvas kecil 28×28 untuk dikirim ke model
  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = 28;
  smallCanvas.height = 28;
  const smallCtx = smallCanvas.getContext('2d');
  smallCtx.drawImage(drawCanvas, 0, 0, 28, 28);

  // Update input layer di 3D visualizer
  updateInputVisualization(smallCtx);

  // Konversi canvas ke string base64
  const imageBase64 = smallCanvas.toDataURL('image/png');

  try {
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) throw new Error('HTTP ' + response.status);

    const data = await response.json();

    // Update tampilan 3D
    if (visualizer) visualizer.updateActivations(data);

    // Update panel prediksi
    updatePredictionPanel(data);

  } catch (err) {
    console.error('Gagal prediksi:', err);
  }
}

function updateInputVisualization(smallCtx) {
  // Ambil pixel 28×28 sebagai array 2D (nilai 0-1)
  const imageData = smallCtx.getImageData(0, 0, 28, 28);
  const pixels2D = [];

  for (let y = 0; y < 28; y++) {
    const row = [];
    for (let x = 0; x < 28; x++) {
      // Gambar grayscale: R = G = B, ambil channel R saja
      row.push(imageData.data[(y * 28 + x) * 4] / 255);
    }
    pixels2D.push(row);
  }

  if (visualizer) visualizer.updateInputLayer(pixels2D);
}

function updatePredictionPanel(data) {
  // Tampilkan angka prediksi besar
  document.getElementById('predicted-digit').textContent = data.prediction;

  // Color the digit based on confidence
  const maxConf = Math.max(...data.confidence);
  const digitEl = document.getElementById('predicted-digit');
  digitEl.style.color = maxConf > 0.8 ? 'var(--amber)' : 'var(--accent)';

  // Buat confidence bar untuk tiap angka 0-9
  const barsEl = document.getElementById('confidence-bars');
  barsEl.innerHTML = '';

  data.confidence.forEach((conf, i) => {
    const percent = (conf * 100).toFixed(1);
    const isMax = (i === data.prediction);

    const row = document.createElement('div');
    row.className = 'conf-row' + (isMax ? ' conf-max' : '');
    row.style.setProperty('--i', i);

    row.innerHTML = `
      <span class="conf-label">${i}</span>
      <div class="conf-bar-bg">
        <div class="conf-bar" style="width: ${percent}%"></div>
      </div>
      <span class="conf-pct">${percent}%</span>
    `;

    barsEl.appendChild(row);
  });
}
