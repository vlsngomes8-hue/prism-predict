document.addEventListener("DOMContentLoaded", () => {

// ================= CONFIG =================
const PERIOD_DURATION = 60; // seconds

// ================= STATE =================
let history = JSON.parse(localStorage.getItem("history") || "[]");

let currentPeriod = localStorage.getItem("currentPeriod")
  ? parseInt(localStorage.getItem("currentPeriod"))
  : Date.now();

let remaining = PERIOD_DURATION;

// ================= ELEMENTS =================
const buttonsDiv = document.getElementById("buttons");
const historyDiv = document.getElementById("history");
const periodEl = document.getElementById("currentPeriod");
const timerEl = document.getElementById("timer");
const predictionEl = document.getElementById("predictionResult");
const photoImg = document.getElementById("photoPreview");

// ================= INIT =================
periodEl.innerText = currentPeriod;
timerEl.innerText = remaining;

const savedPhoto = localStorage.getItem("savedPhoto");
if(savedPhoto) photoImg.src = savedPhoto;

renderHistory();

// ================= PERIOD TIMER =================
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

// ================= LOGIC =================
function getColor(n){
  if(n === 0 || n === 5) return "violet";
  if(n % 2 === 0) return "red";
  return "green";
}

function getSize(n){
  return n >= 5 ? "Big" : "Small";
}

// ================= BUTTONS =================
for(let i=0;i<=9;i++){
  const btn = document.createElement("div");
  btn.className = "btn " + getColor(i);
  btn.innerText = i;
  btn.onclick = () => addHistory(i);
  buttonsDiv.appendChild(btn);
}

// ================= ADD RESULT =================
function addHistory(num){
  const entry = {
    period: currentPeriod,
    num,
    color: getColor(num),
    size: getSize(num)
  };

  history.unshift(entry);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

// ================= RENDER HISTORY =================
function renderHistory(){
  historyDiv.innerHTML = history.slice(0,12).map(h =>
    `<div>${h.period} → <b>${h.num}</b> ${h.color.toUpperCase()} ${h.size}</div>`
  ).join("");
}

// ================= PREDICTION =================
window.predict = function(){
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

// ================= LOAD OLD DATA =================
window.loadData = function(){
  const input = document.getElementById("dataInput").value;
  if(!input) return;

  input.split(",")
    .map(n=>parseInt(n.trim()))
    .filter(n=>!isNaN(n)&&n>=0&&n<=9)
    .forEach(n=>addHistory(n));
}

// ================= OCR SAFE MODE =================
window.startOCR = function(){
  const input = document.getElementById("photoInput");
  const status = document.getElementById("ocrStatus");

  if(!input.files || !input.files[0]){
    status.innerText = "Select a photo first";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(){
    const imgData = reader.result;
    photoImg.src = imgData;
    localStorage.setItem("savedPhoto", imgData);

    status.innerText = "Reading image… wait 5–10s";

    Tesseract.recognize(imgData,"eng")
      .then(({data:{text}})=>{
        const nums = text.match(/\d/g) || [];
        const clean = nums.map(n=>parseInt(n)).filter(n=>n>=0&&n<=9);

        if(clean.length===0){
          status.innerText="No numbers found";
          return;
        }

        clean.forEach(n=>addHistory(n));
        status.innerText="Extracted: "+clean.join(", ");
      })
      .catch(()=>{
        status.innerText="OCR failed – try clear image";
      });
  };
  reader.readAsDataURL(input.files[0]);
};

});
