// ========================================
// cnn3d.js — CNN 3D Visualizer (Three.js)
// ========================================

class CNNVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    // --- Scene Setup ---
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x01162b);

    // --- Camera ---
    const w = this.canvas.clientWidth  || 800;
    const h = this.canvas.clientHeight || 500;
    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    this.camera.position.set(0, 6, 22);
    this.camera.lookAt(0, 0, 0);

    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // --- OrbitControls ---
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);

    // --- Lighting ---
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 10, 10);
    this.scene.add(dir);

    // Storage untuk objek 3D tiap layer
    this.layers = {};

    // Bangun arsitektur CNN
    this._buildArchitecture();

    // Label layer
    this._buildLabels();

    // Resize handler
    window.addEventListener('resize', () => this._onResize());

    // Mulai render loop
    this._animate();

    console.log('✅ CNNVisualizer initialized');
  }

  // =============================================
  // Heatmap color: nilai 0-1 → warna RGB
  // Hitam → Biru → Cyan → Kuning → Putih
  // =============================================
  // Palet: #01162b → #00385a → #6a90b4 → #d2dbeb → #fff
  _heatmapNavy(v) {
    v = Math.max(0, Math.min(1, v));
    const stops = [
      [0,   [1,   22,  43]],
      [0.3, [0,   56,  90]],
      [0.65,[106, 144, 180]],
      [0.85,[210, 219, 235]],
      [1.0, [255, 255, 255]],
    ];
    for (let i = 0; i < stops.length - 1; i++) {
      const [t0, c0] = stops[i];
      const [t1, c1] = stops[i + 1];
      if (v >= t0 && v <= t1) {
        const t = (v - t0) / (t1 - t0);
        return c0.map((c, j) => Math.round(c + t * (c1[j] - c)));
      }
    }
    return [255, 255, 255];
  }

  // =============================================
  // Buat texture dari 2D array (feature map)
  // =============================================
  _makeTexture(data2D) {
    const H = data2D.length;
    const W = data2D[0].length;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const [r, g, b] = this._heatmapNavy(data2D[y][x]);
        const idx = (y * W + x) * 4;
        img.data[idx]     = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return new THREE.CanvasTexture(cv);
  }

  // =============================================
  // Buat satu "panel" feature map 3D
  // =============================================
  _makePlane(w, h, x, z, color = 0x112244) {
    const geo  = new THREE.PlaneGeometry(w, h);
    const mat  = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.88 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);

    // Border biru tipis
    const edges = new THREE.EdgesGeometry(geo);
    const line  = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x6a90b4, transparent: true, opacity: 0.5 }));
    line.position.set(x, 0, z);
    this.scene.add(line);

    return mesh;
  }

  // =============================================
  // Bangun semua layer CNN
  // =============================================
  _buildArchitecture() {
    // Posisi X tiap layer (kiri ke kanan)
    // Input  Conv1  Pool1  Conv2  Pool2  FC1   FC2   Out
    //  -13   -8.5   -4.5    -1     2     5.5   7.5    10

    // --- INPUT (28×28, 1 plane) ---
    // --- INPUT (28×28, 1 plane) ---
    this.layers.input = {
      planes: [this._makePlane(4, 4, -13, 0, 0x00385a)],
      type: 'conv',
    };

    // --- CONV1 (24×24, 6 filters) ---
    this.layers.conv1 = { planes: this._makeConvGroup(-8.5, 6, 3.2, 3.2, 0.7), type: 'conv' };

    // --- POOL1 (12×12, 6 filters) ---
    this.layers.pool1 = { planes: this._makeConvGroup(-4.5, 6, 2.2, 2.2, 0.6), type: 'conv' };

    // --- CONV2 (8×8, 16 filters) ---
    this.layers.conv2 = { planes: this._makeConvGroup(-1, 16, 1.5, 1.5, 0.45), type: 'conv' };

    // --- POOL2 (4×4, 16 filters) ---
    this.layers.pool2 = { planes: this._makeConvGroup(2, 16, 1.0, 1.0, 0.4), type: 'conv' };

    // --- FC1 (120 nodes) ---
    this.layers.fc1 = { nodes: this._makeFCGroup(5.5, 120, 0.13, 9), type: 'fc' };

    // --- FC2 (84 nodes) ---
    this.layers.fc2 = { nodes: this._makeFCGroup(7.5, 84, 0.15, 8), type: 'fc' };

    // --- OUTPUT (10 nodes) ---
    this.layers.output = { nodes: this._makeOutputGroup(10), type: 'output' };

    // Garis penghubung antar layer
    this._addConnectors([-13, -8.5, -4.5, -1, 2, 5.5, 7.5, 10]);
  }

  _makeConvGroup(xPos, count, pw, ph, gap) {
    const planes = [];
    const total = (count - 1) * gap;
    for (let i = 0; i < count; i++) {
      const z = i * gap - total / 2;
      planes.push(this._makePlane(pw, ph, xPos, z));
    }
    return planes;
  }

  _makeFCGroup(xPos, count, nodeSize, colCount) {
    const nodes = [];
    const rows = Math.ceil(count / colCount);
    const sp = nodeSize * 1.6;
    for (let i = 0; i < count; i++) {
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      const geo = new THREE.BoxGeometry(nodeSize, nodeSize, nodeSize);
      const mat = new THREE.MeshLambertMaterial({ color: 0x00385a });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(xPos, (row - rows / 2) * sp, (col - colCount / 2) * sp);
      this.scene.add(mesh);
      nodes.push(mesh);
    }
    return nodes;
  }

  _makeOutputGroup(xPos) {
    const nodes = [];
    const sp = 1.1;
    for (let i = 0; i < 10; i++) {
      const geo  = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const mat  = new THREE.MeshLambertMaterial({ color: 0x00385a });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(xPos, (i - 4.5) * sp, 0);
      this.scene.add(mesh);
      nodes.push(mesh);
      this._addSprite(String(i), xPos + 1.1, (i - 4.5) * sp, 0, 0.5);
    }
    return nodes;
  }

  _addConnectors(xArr) {
    for (let i = 0; i < xArr.length - 1; i++) {
      const pts = [new THREE.Vector3(xArr[i], 0, 0), new THREE.Vector3(xArr[i + 1], 0, 0)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0x00385a, transparent: true, opacity: 0.5 });
      this.scene.add(new THREE.Line(geo, mat));
    }
  }

  // =============================================
  // Label teks (sprite)
  // =============================================
  _buildLabels() {
    const labels = [
      { text: 'Input\n28×28',    x: -13  },
      { text: 'Conv1\n24×24×6', x: -8.5 },
      { text: 'Pool1\n12×12×6', x: -4.5 },
      { text: 'Conv2\n8×8×16',  x: -1   },
      { text: 'Pool2\n4×4×16',  x:  2   },
      { text: 'FC1\n120',        x:  5.5 },
      { text: 'FC2\n84',         x:  7.5 },
      { text: 'Output\n10',      x:  10  },
    ];
    labels.forEach(({ text, x }) => {
      text.split('\n').forEach((line, i) => this._addSprite(line, x, 5.5 - i * 0.7, 0, 0.55));
    });
  }

  _addSprite(text, x, y, z, scale) {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 64;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    const mat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true });
    const sp  = new THREE.Sprite(mat);
    sp.position.set(x, y, z);
    sp.scale.set(scale * 3.2, scale * 0.85, 1);
    this.scene.add(sp);
  }

  // =============================================
  // Update activation dari data backend
  // =============================================
  updateActivations(data) {
    const { activations } = data;
    this._updateConvLayer('conv1', activations.conv1);
    this._updateConvLayer('pool1', activations.pool1);
    this._updateConvLayer('conv2', activations.conv2);
    this._updateConvLayer('pool2', activations.pool2);
    this._updateFCLayer('fc1', activations.fc1);
    this._updateFCLayer('fc2', activations.fc2);
    this._updateOutputLayer(activations.output, data.prediction);
  }

  updateInputLayer(pixels2D) {
    const layer = this.layers.input;
    if (!layer) return;
    const tex = this._makeTexture(pixels2D);
    layer.planes[0].material.map   = tex;
    layer.planes[0].material.color.setHex(0xffffff);
    layer.planes[0].material.needsUpdate = true;
  }

  _updateConvLayer(name, featureMaps) {
    const layer = this.layers[name];
    if (!layer) return;
    featureMaps.forEach((map2D, i) => {
      if (i >= layer.planes.length) return;
      const plane = layer.planes[i];
      plane.material.map   = this._makeTexture(map2D);
      plane.material.color.setHex(0xffffff);
      plane.material.needsUpdate = true;
    });
  }

  _updateFCLayer(name, values) {
    const layer = this.layers[name];
    if (!layer) return;
    values.forEach((v, i) => {
      if (i >= layer.nodes.length) return;
      const [r, g, b] = this._heatmapNavy(v);
      layer.nodes[i].material.color.setRGB(r / 255, g / 255, b / 255);
    });
  }

  _updateOutputLayer(values, prediction) {
    const layer = this.layers.output;
    if (!layer) return;
    values.forEach((v, i) => {
      const [r, g, b] = this._heatmapNavy(v);
      layer.nodes[i].material.color.setRGB(r / 255, g / 255, b / 255);
      const s = i === prediction ? 1.6 : 1;
      layer.nodes[i].scale.setScalar(s);
    });
  }

  // =============================================
  // Resize & Animation Loop
  // =============================================
  _onResize() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
