// ================== STATE ==================
let history = JSON.parse(localStorage.getItem("history") || "[]");

let period = history.length > 0
  ? history[0].period + 1
  : Date.now();

// ================== ELEMENTS ==================
const buttonsDiv = document.getElementById("buttons");
const historyDiv = document.getElementById("history");
const periodEl = document.getElementById("periodId");
const predictionEl = document.getElementById("predictionResult");
const photoImg = document.getElementById("photoPreview");

// ================== INIT ==================
if (periodEl) periodEl.innerText = period;

// Load saved photo
const savedPhoto = localStorage.getItem("savedPhoto");
if (savedPhoto && photoImg) {
  photoImg.src = savedPhoto;
}

renderHistory();

// ================== CORE LOGIC ==================
function getColor(n) {
  if (n === 0 || n === 5) return "violet";
  if (n % 2 === 0) return "red";
  return "green";
}

function getSize(n) {
  return n >= 5 ? "Big" : "Small";
}

// ================== CREATE BUTTONS ==================
if (buttonsDiv) {
  for (let i = 0; i <= 9; i++) {
    const btn = document.createElement("div");
    btn.className = "btn " + getColor(i);
    btn.innerText = i;
    btn.onclick = () => addHistory(i);
    buttonsDiv.appendChild(btn);
  }
}

// ================== ADD HISTORY ==================
function addHistory(num) {
  const entry = {
    period: period,
    num: num,
    color: getColor(num),
    size: getSize(num)
  };

  history.unshift(entry);
  localStorage.setItem("history", JSON.stringify(history));

  period++;
  if (periodEl) periodEl.innerText = period;

  renderHistory();
}

// ================== RENDER HISTORY ==================
function renderHistory() {
  if (!historyDiv) return;

  historyDiv.innerHTML = history.slice(0, 12).map(h =>
    `<div>
      ${h.period} → 
      <b>${h.num}</b> 
      ${h.color.toUpperCase()} 
      ${h.size}
    </div>`
  ).join("");
}

// ================== AUTO PREDICTION ==================
function predict() {
  if (!predictionEl) return;

  if (history.length < 3) {
    predictionEl.innerText = "Add more data for prediction";
    return;
  }

  const last3 = history.slice(0, 3).map(h => h.num);
  const avg = Math.round(
    last3.reduce((a, b) => a + b, 0) / last3.length
  );

  const predicted = avg % 10;

  predictionEl.innerHTML =
    `<b>${predicted}</b> - 
     ${getColor(predicted).toUpperCase()} - 
     ${getSize(predicted)}`;
}

// ================== LOAD OLD DATA ==================
function loadData() {
  const inputEl = document.getElementById("dataInput");
  if (!inputEl || !inputEl.value) return;

  const nums = inputEl.value.split(",")
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n) && n >= 0 && n <= 9);

  nums.forEach(n => addHistory(n));
  inputEl.value = "";
}

// ================== PHOTO UPLOAD ==================
function savePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    localStorage.setItem("savedPhoto", e.target.result);
    if (photoImg) photoImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
