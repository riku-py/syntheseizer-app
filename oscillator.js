const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = [];
let filter;
// const canvas = document.getElementById('xy-pad');
// const canvasCtx = canvas.getContext('2d');
let dragging = false;

// オシレーターの初期設定
function setupSynth() {
  stopAllOscillators(); // 古いオシレーターを止める

  filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1000;

  filter.connect(audioCtx.destination);

  oscillators = [];

  for (let i = 0; i < 3; i++) {
    if (document.getElementById(`swich${i}`) == false) {
      continue;
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // HTMLから波形と音量を取得
    const waveType = document.getElementById(`wave${i}`).value;
    const gainValue = parseFloat(document.getElementById(`gain${i}`).value);

    osc.type = waveType;
    osc.frequency.value = 440; // 初期周波数
    gainNode.gain.value = gainValue;

    osc.connect(gainNode).connect(filter);

    osc.start();
    oscillators.push({ osc, gainNode });
  }
}

// 全オシレーターを停止
function stopAllOscillators() {
  if (oscillators.length > 0) {
    for (let { osc } of oscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    }
    oscillators = [];
  }
}

// // XYパッドの操作処理
// function startDrag(e) {
//   dragging = true;
//   drag(e);
//   setupSynth();
// }

// function drag(e) {
//   if (!dragging) return;

//   const rect = canvas.getBoundingClientRect();
//   const x = (e.clientX - rect.left) / rect.width;
//   const y = (e.clientY - rect.top) / rect.height;

//   const minFreq = 200;
//   const maxFreq = 8000;

//   const filterFreq = minFreq + x * (maxFreq - minFreq);
//   const mainFreq = minFreq + y * (maxFreq - minFreq);

//   if (filter) {
//     filter.frequency.setValueAtTime(filterFreq, audioCtx.currentTime);
//   }

//   for (let { osc } of oscillators) {
//     osc.frequency.setValueAtTime(mainFreq, audioCtx.currentTime);
//   }

//   drawPad(x, y);
// }

// function stopDrag() {
//   dragging = false;
//   stopAllOscillators();
// }

// function drawPad(x, y) {
//   canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
//   canvasCtx.fillStyle = '#eee';
//   canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
//   canvasCtx.fillStyle = '#333';
//   canvasCtx.beginPath();
//   canvasCtx.arc(x * canvas.width, y * canvas.height, 10, 0, Math.PI * 2);
//   canvasCtx.fill();
// }

// オシレーターA,B,CのコントロールUI作成
function createOscillatorControls(i) {
  const controlsDiv = document.createElement("div");
  controlsDiv.innerHTML = `
    <h4>オシレーター${i + 1}</h4>
    波形:
    <select id="wave${i}">
      <option value="sine">正弦波</option>
      <option value="triangle">三角波</option>
      <option value="square">矩形波</option>
      <option value="sawtooth">ノコギリ波</option>
    </select><br>

    音量:
    <input type="range" id="gain${i}" min="0" max="1" step="0.01" value="0.3"
      oninput="document.getElementById('gainVal${i}').innerText = this.value">
    <span id="gainVal${i}">0.3</span><br><br>

    スイッチ:
    <input type="checkbox" id="swich${i}">

    <button type="button" id="playb${i}" onClick="playSound(${i})">再生</button>
  `;
  document.getElementById("controls").appendChild(controlsDiv);

  // 個別パッド追加
  const pad = document.createElement("canvas");
  pad.id = `osc-pad-${i}`;
  pad.width = 200;
  pad.height = 200;
  pad.style.border = "1px solid black";
  pad.dataset.index = i;
  document.getElementById("oscillatorPads").appendChild(pad);

  drawPadForOsc(pad, 0.3, 1 - 0.3); // 初期音量表示

  // パッドのイベント設定
  pad.addEventListener("mousedown", (e) => handleOscPadDrag(e, pad));
  pad.addEventListener("mousemove", (e) => handleOscPadDrag(e, pad));
}

function handleOscPadDrag(e, canvas) {
  if (e.buttons !== 1) return; // 左ボタンドラッグのみ対応
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const gain = Math.min(Math.max(x, 0), 1); // 0〜1に制限
  const i = parseInt(canvas.dataset.index);

  // ゲイン変更
  document.getElementById(`gain${i}`).value = gain.toFixed(2);
  document.getElementById(`gainVal${i}`).innerText = gain.toFixed(2);
  if (oscillators[i]) {
    oscillators[i].gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
  }

  drawPadForOsc(canvas, x, y);
}

function drawPadForOsc(canvas, x, y) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x * canvas.width, y * canvas.height, 10, 0, Math.PI * 2);
  ctx.fill();
}

function playSound(oscillatorNo) {
  const ctx = new AudioContext();
  const gainNode = audioCtx.createGain();

  const oscillator = new OscillatorNode(ctx)
  oscillator.frequency.value = 440;
  console.log(oscillatorNo);
  oscillator.type = document.getElementById(`wave${oscillatorNo}`).value;

  gainNode.gain.value = parseFloat(document.getElementById(`gain${oscillatorNo}`).value);

  //oscillator.connect(gainNode);

  oscillator.connect(ctx.destination);

  oscillator.start();

  oscillator.stop(ctx.currentTime + 3);
}

function startAllOscillators() {
  setupSynth();
}

// コントロール作成
for (let i = 0; i < 3; i++) createOscillatorControls(i);

// // イベント登録
// canvas.addEventListener('mousedown', startDrag);
// canvas.addEventListener('mousemove', drag);
// canvas.addEventListener('mouseup', stopDrag);
// canvas.addEventListener('mouseleave', stopDrag);

// // スマホ対応
// canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0]); });
// canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drag(e.touches[0]); });
// canvas.addEventListener('touchend', stopDrag);

// // 初期描画
// drawPad(0.5, 0.5);
