document.addEventListener("DOMContentLoaded", () => {

/* ========= CONFIG ========= */
const PERIOD_DURATION = 60; // seconds (change if needed)

/* ========= STATE ========= */
let history = JSON.parse(localStorage.getItem("history") || "[]");

/* ========= ELEMENTS ========= */
const buttonsDiv = document.getElementById("buttons");
const historyDiv = document.getElementById("history");
const periodEl = document.getElementById("currentPeriod");
const timerEl = document.getElementById("timer");
const predictionEl = document.getElementById("predictionResult");
const photoImg = document.getElementById("photoPreview");

/* ========= PERIOD ENGINE (REAL TIME) ========= */
function getCurrentPeriod() {
  return Math.floor(Date.now() / 1000 / PERIOD_DURATION);
}

function getRemainingSeconds() {
  const now = Math.floor(Date.now() / 1000);
  return PERIOD_DURATION - (now % PERIOD_DURATION);
}

function updatePeriodUI() {
  periodEl.innerText = getCurrentPeriod();
  timerEl.innerText = getRemainingSeconds();
}

setInterval(updatePeriodUI, 1000);
updatePeriodUI();

/* ========= LOGIC ========= */
function getColor(n){
  if(n === 0 || n === 5) return "violet";
  if(n % 2 === 0) return "red";
  return "green";
}

function getSize(n){
  return n >= 5 ? "Big" : "Small";
}

/* ========= BUTTONS ========= */
for(let i=0;i<=9;i++){
  const btn = document.createElement("div");
  btn.className = "btn " + getColor(i);
  btn.innerText = i;
  btn.onclick = () => addHistory(i);
  buttonsDiv.appendChild(btn);
}

/* ========= ADD RESULT ========= */
function addHistory(num){
  history.unshift({
    period: getCurrentPeriod(),
    num,
    color: getColor(num),
    size: getSize(num)
  });

  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

/* ========= HISTORY ========= */
function renderHistory(){
  historyDiv.innerHTML = history.slice(0,12).map(h =>
    `<div>${h.period} → <b>${h.num}</b> ${h.color.toUpperCase()} ${h.size}</div>`
  ).join("");
}
renderHistory();

/* ========= ADVANCED PREDICTION ========= */
function advancedPredict(){
  if(history.length < 6) return null;

  const recent = history.slice(0,20).map(h=>h.num);
  let score = Array(10).fill(0);

  recent.forEach(n => score[n] += 2);
  recent.slice(0,5).forEach(n => score[n] += 3);

  for(let i=0;i<=9;i++){
    const idx = recent.indexOf(i);
    score[i] += idx === -1 ? 5 : Math.min(idx,5);
  }

  const lastColors = recent.slice(0,4).map(getColor);
  for(let i=0;i<=9;i++){
    if(lastColors.filter(c=>c===getColor(i)).length >= 3){
      score[i] -= 3;
    }
  }

  return score.indexOf(Math.max(...score));
}

window.predict = function(){
  const n = advancedPredict();
  predictionEl.innerText = n === null
    ? "Add more data"
    : `${n} - ${getColor(n).toUpperCase()} - ${getSize(n)}`;
};

/* ========= OCR ========= */
window.startOCR = function(){
  const input = document.getElementById("photoInput");
  const status = document.getElementById("ocrStatus");

  if(!input.files[0]){
    status.innerText = "Select image first";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(){
    const img = reader.result;
    photoImg.src = img;
    status.innerText = "Analyzing image…";

    Tesseract.recognize(img,"eng").then(({data:{text}})=>{
      const nums = (text.match(/\d/g)||[])
        .map(n=>parseInt(n))
        .filter(n=>n>=0&&n<=9);

      if(nums.length===0){
        status.innerText="No numbers found";
        return;
      }

      nums.forEach(n=>addHistory(n));
      status.innerText="Extracted: "+nums.join(", ");
    });
  };
  reader.readAsDataURL(input.files[0]);
};

});
