// ================== CONFIG ==================
const PERIOD_DURATION = 60; // seconds (change if needed)

// ================== STATE ==================
let history = JSON.parse(localStorage.getItem("history") || "[]");

let currentPeriod = localStorage.getItem("currentPeriod")
  ? parseInt(localStorage.getItem("currentPeriod"))
  : Date.now();

let remaining = PERIOD_DURATION;

// ================== ELEMENTS ==================
const buttonsDiv = document.getElementById("buttons");
const historyDiv = document.getElementById("history");
const periodEl = document.getElementById("currentPeriod");
const timerEl = document.getElementById("timer");
const predictionEl = document.getElementById("predictionResult");
const photoImg = document.getElementById("photoPreview");

// ================== INIT ==================
periodEl.innerText = currentPeriod;
timerEl.innerText = remaining;

// load saved photo
const savedPhoto = localStorage.getItem("savedPhoto");
if(savedPhoto && photoImg) photoImg.src = savedPhoto;

renderHistory();

// ================== PERIOD TIMER ==================
setInterval(() => {
  remaining--;
  timerEl.innerText = remaining;

  if (remaining <= 0) {
    currentPeriod++;
    remaining = PERIOD_DURATION;
    periodEl.innerText = currentPeriod;
    localStorage.setItem("currentPeriod", currentPeriod);
  }
}, 1000);

// ================== LOGIC ==================
function getColor(n){
  if(n === 0 || n === 5) return "violet";
  if(n % 2 === 0) return "red";
  return "green";
}

function getSize(n){
  return n >= 5 ? "Big" : "Small";
}

// ================== BUTTONS ==================
for(let i=0;i<=9;i++){
  const btn = document.createElement("div");
  btn.className = "btn " + getColor(i);
  btn.innerText = i;
  btn.onclick = () => addHistory(i);
  buttonsDiv.appendChild(btn);
}

// ================== ADD RESULT ==================
function addHistory(num){
  const entry = {
    period: currentPeriod,
    num: num,
    color: getColor(num),
    size: getSize(num)
  };

  history.unshift(entry);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

// ================== RENDER HISTORY ==================
function renderHistory(){
  historyDiv.innerHTML = history.slice(0,12).map(h =>
    `<div>
      ${h.period} → 
      <b>${h.num}</b> 
      ${h.color.toUpperCase()} 
      ${h.size}
    </div>`
  ).join("");
}

// ================== PREDICTION ==================
function predict(){
  if(history.length < 3){
    predictionEl.innerText = "Add more data";
    return;
  }

  const last3 = history.slice(0,3).map(h => h.num);
  const avg = Math.round(last3.reduce((a,b)=>a+b,0)/3);
  const p = avg % 10;

  predictionEl.innerHTML =
    `<b>${p}</b> - ${getColor(p).toUpperCase()} - ${getSize(p)}`;
}

// ================== LOAD OLD DATA ==================
function loadData(){
  const input = document.getElementById("dataInput").value;
  if(!input) return;

  input.split(",")
    .map(n=>parseInt(n.trim()))
    .filter(n=>!isNaN(n)&&n>=0&&n<=9)
    .forEach(n=>addHistory(n));
}

// ================== OCR FROM PHOTO ==================
function extractFromPhoto(event){
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(){
    const imgData = reader.result;
    photoImg.src = imgData;
    localStorage.setItem("savedPhoto", imgData);

    document.getElementById("ocrStatus").innerText = "Reading image...";

    Tesseract.recognize(imgData,"eng")
      .then(({data:{text}})=>{
        const nums = text.match(/\d/g) || [];
        const clean = nums.map(n=>parseInt(n)).filter(n=>n>=0&&n<=9);

        if(clean.length===0){
          document.getElementById("ocrStatus").innerText="No numbers found";
          return;
        }

        clean.forEach(n=>addHistory(n));
        document.getElementById("ocrStatus").innerText =
          "Extracted: " + clean.join(", ");
      });
  };
  reader.readAsDataURL(file);
}
