// Fetch the static manifest produced at commit-time: sounds.json
async function fetchFiles() {
  try {
    const res = await fetch("./sounds.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("manifest fetch failed");
    const arr = await res.json();
    if (Array.isArray(arr)) return arr;
  } catch (err) {
    console.warn("No sounds.json or invalid JSON — falling back to defaults.", err);
  }
  return ["beep.wav","ding.wav","pop.wav"];
}

let ctx; let gain; const buffers = new Map();

function ensureContext(){
  if(!ctx){
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
    gain = ctx.createGain();
    gain.gain.value = parseFloat(document.getElementById("volume").value);
    gain.connect(ctx.destination);
    document.getElementById("unlockMsg").textContent = "Audio enabled";
  }
  if(ctx.state === "suspended") ctx.resume();
}

function setVolume(v){ if(gain) gain.gain.setTargetAtTime(parseFloat(v), ctx.currentTime, 0.01); }

async function loadBuffer(file){
  if(buffers.has(file)) return buffers.get(file);
  const url = `./sounds/${encodeURIComponent(file)}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Failed to fetch ${file}`);
  const arr = await res.arrayBuffer();
  const buf = await ctx.decodeAudioData(arr);
  buffers.set(file, buf);
  return buf;
}

async function play(file){
  ensureContext();
  try{ const buf = await loadBuffer(file); const src=ctx.createBufferSource(); src.buffer=buf; src.connect(gain); src.start(); }
  catch(e){ console.error(e); }
}

function basename(file){ const i=file.lastIndexOf("."); return (i>0?file.slice(0,i):file).replace(/[-_]+/g," "); }

function render(files){
  const grid = document.getElementById("grid"); grid.innerHTML="";
  files.forEach((file, idx) => {
    const btn = document.createElement("button");
    btn.className = "tile"; btn.role = "listitem";
    const label = basename(file);
    btn.setAttribute("aria-label", `Play ${label}`);
    btn.innerHTML = `<span class="kbd">${idx<9?idx+1:""}</span><span class="label">${label}</span>`;
    btn.addEventListener("pointerdown", ensureContext, { once: true });
    btn.addEventListener("click", () => play(file));
    grid.appendChild(btn);
  });
}

function filterList(files, q){ q=q.toLowerCase().trim(); return q? files.filter(f=>basename(f).toLowerCase().includes(q)) : files; }

(async function init(){
  const files = await fetchFiles();
  render(files);
  document.getElementById("unlockBtn").addEventListener("click", ensureContext);
  document.body.addEventListener("keydown", (e)=>{ const n=parseInt(e.key,10); if(n>=1&&n<=9&&files[n-1]){ e.preventDefault(); play(files[n-1]); } });
  document.getElementById("volume").addEventListener("input", (e)=> setVolume(e.target.value));
  document.getElementById("filter").addEventListener("input", (e)=> render(filterList(files, e.target.value)));
})();
