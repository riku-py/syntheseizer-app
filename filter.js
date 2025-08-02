// === Audio Context & Nodes ===
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let osc, filter, filtertype;

// 初期設定
function setupSynth() {
  osc = audioCtx.createOscillator();
  filter = audioCtx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.value = 220; // 基本音程
  filtertype = document.getElementById('selectfilter');
  filter.type = filtertype.value;
  filter.frequency.value = 1000; // 初期値
  filter.Q.value = 1;

  osc.connect(filter).connect(audioCtx.destination);
}

// // 再生・停止ボタン
// document.getElementById('start').onclick = () => {
//   setupSynth();
//   osc.start();
// };
// document.getElementById('stop').onclick = () => {
//   if (osc) osc.stop();
// };

// === XY Pad ===
const canvas = document.getElementById('xy-pad');
const ctx = canvas.getContext('2d');
let dragging = false;

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseleave', stopDrag);

// スマホ対応
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0]); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drag(e.touches[0]); });
canvas.addEventListener('touchend', stopDrag);

function startDrag(e) {
  dragging = true;
  drag(e);
  setupSynth();
  osc.start();
}

function drag(e) {
  if (!dragging) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;  // 0~1
  const y = (e.clientY - rect.top) / rect.height;  // 0~1

  // 値のマッピング
  const minFreq = 200;
  const maxFreq = 8000;
  const freq = minFreq + x * (maxFreq - minFreq);

  const minMainFreq = 200;
  const maxMainFreq = 8000;
  const  mainFreq= minMainFreq + y * (maxMainFreq - minMainFreq);

  if (filter) {
    filter.frequency.value = freq;
    osc.frequency.value = mainFreq;
  }

  drawPad(x, y);
}

function stopDrag() {
  dragging = false;
  if (osc) {
    osc.stop();
    osc.disconnect();
    osc = null;
  }
}

function drawPad(x, y) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // XYパッド背景
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ドラッグ位置を表示
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x * canvas.width, y * canvas.height, 10, 0, Math.PI * 2);
  ctx.fill();
}

// 初期状態
drawPad(0.5, 0.5);
