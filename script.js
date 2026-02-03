document.addEventListener("DOMContentLoaded", () => {

/* ===== AUTO PERIOD (SIMPLE & SAFE) ===== */
function updatePeriod(){
  document.getElementById("period").innerText =
    Math.floor(Date.now() / 60000); // updates every minute
}
setInterval(updatePeriod, 1000);
updatePeriod();

/* ===== STATE ===== */
let data = []; // latest numbers only
const status = document.getElementById("status");
const preview = document.getElementById("preview");

/* ===== COLOR / SIZE ===== */
function color(n){
  if(n === 0 || n === 5) return "VIOLET";
  return n % 2 === 0 ? "RED" : "GREEN";
}
function size(n){ return n >= 5 ? "BIG" : "SMALL"; }

/* ===== BUTTONS ===== */
const btns = document.getElementById("buttons");
for(let i=0;i<=9;i++){
  const b = document.createElement("div");
  b.className = "btn " + (color(i)==="RED"?"red":color(i)==="GREEN"?"green":"violet");
  b.innerText = i;
  b.onclick = () => addResult(i);
  btns.appendChild(b);
}

/* ===== ADD RESULT NUMBER ===== */
function addResult(n){
  data.unshift(n);
  if(data.length > 10) data.pop();
  renderHistory();
  aiPredict(); // AUTO predict next
}

/* ===== RENDER HISTORY ===== */
function renderHistory(){
  document.getElementById("history").innerHTML =
    data.map(n => `${n} ${color(n)} ${size(n)}`).join("<br>");
}

/* ===== 🤖 AI PREDICTION (AUTO) ===== */
function aiPredict(){
  if(data.length < 4){
    document.getElementById("prediction").innerText = "Need more data";
    return;
  }

  let score = Array(10).fill(0);

  // Frequency memory
  data.forEach(n => score[n] += 2);

  // Recent trend boost
  data.slice(0,4).forEach(n => score[n] += 4);

  // Gap (missing numbers)
  for(let i=0;i<=9;i++){
    const idx = data.indexOf(i);
    score[i] += idx === -1 ? 5 : Math.min(idx,3);
  }

  // Avoid repeating last number
  score[data[0]] -= 5;

  const pick = score.indexOf(Math.max(...score));

  document.getElementById("prediction").innerText =
    `${pick} ${color(pick)} ${size(pick)} (AI)`;
}

/* ===== OCR EXTRACT (LATEST DATA ONLY) ===== */
window.extract = function(){
  const file = document.getElementById("photoInput").files[0];
  if(!file){
    status.innerText = "Select photo first";
    return;
  }

  const r = new FileReader();
  r.onload = () => {
    preview.src = r.result;
    status.innerText = "Reading image...";

    Tesseract.recognize(r.result, "eng").then(({data:{text}})=>{
      const nums = (text.match(/\d/g) || [])
        .map(n=>parseInt(n))
        .filter(n=>n>=0 && n<=9);

      if(nums.length === 0){
        status.innerText = "No numbers found";
        return;
      }

      // ONLY latest extracted numbers
      data = nums.slice(-5);
      renderHistory();
      aiPredict(); // AUTO predict after extract
      status.innerText = "Latest data loaded";
    });
  };
  r.readAsDataURL(file);
};

});
