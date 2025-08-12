// Fetch sound manifest (sounds.json) at runtime
const fetchFiles = async () => {
  try {
    const res = await fetch("./sounds.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("manifest fetch failed");
    const arr = await res.json();
    if (Array.isArray(arr)) return arr;
  } catch (err) {
    console.warn("No sounds.json or invalid JSON — falling back to defaults.", err);
  }
  return ["beep.wav", "ding.wav", "pop.wav"];
};

const grid = document.getElementById("grid");
const unlockBtn = document.getElementById("unlockBtn");
const unlockMsg = document.getElementById("unlockMsg");
const volume = document.getElementById("volume");
const filter = document.getElementById("filter");

let ctx;
let gain;
const buffers = new Map();

const ensureContext = () => {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
    gain = ctx.createGain();
    gain.gain.value = parseFloat(volume.value);
    gain.connect(ctx.destination);
    unlockMsg.textContent = "Audio enabled";
  }
  if (ctx.state === "suspended") ctx.resume();
};

const setVolume = (v) => {
  if (gain) gain.gain.setTargetAtTime(parseFloat(v), ctx.currentTime, 0.01);
};

const loadBuffer = async (file) => {
  if (buffers.has(file)) return buffers.get(file);
  const url = `./sounds/${encodeURIComponent(file)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${file}`);
  const arr = await res.arrayBuffer();
  const buf = await ctx.decodeAudioData(arr);
  buffers.set(file, buf);
  return buf;
};

const play = async (file) => {
  ensureContext();
  try {
    const buf = await loadBuffer(file);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(gain);
    src.start();
  } catch (e) {
    console.error(e);
  }
};

const basename = (file) => {
  const i = file.lastIndexOf(".");
  return (i > 0 ? file.slice(0, i) : file).replace(/[-_]+/g, " ");
};

const render = (files) => {
  grid.innerHTML = "";
  files.forEach((file, idx) => {
    const btn = document.createElement("button");
    btn.className = "tile";
    btn.setAttribute("role", "listitem");
    const label = basename(file);
    btn.setAttribute("aria-label", `Play ${label}`);
    btn.innerHTML = `<span class="kbd">${idx < 9 ? idx + 1 : ""}</span><span class="label">${label}</span>`;
    btn.addEventListener("pointerdown", ensureContext, { once: true });
    btn.addEventListener("click", () => play(file));
    grid.appendChild(btn);
  });
};

const filterList = (files, q) => {
  q = q.toLowerCase().trim();
  return q ? files.filter((f) => basename(f).toLowerCase().includes(q)) : files;
};

const init = async () => {
  const files = await fetchFiles();
  render(files);
  unlockBtn.addEventListener("click", ensureContext);
  document.body.addEventListener("keydown", (e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9 && files[n - 1]) {
      e.preventDefault();
      play(files[n - 1]);
    }
  });
  volume.addEventListener("input", (e) => setVolume(e.target.value));
  filter.addEventListener("input", (e) => render(filterList(files, e.target.value)));
};

init();
