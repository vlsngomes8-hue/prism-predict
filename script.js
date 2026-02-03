document.addEventListener("DOMContentLoaded", () => {

const periodEl = document.getElementById("periodId");
const historyEl = document.getElementById("history");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

let history = [];

// ===== AUTO PERIOD (REAL-TIME SIMPLE) =====
function updatePeriod(){
  periodEl.innerText = Math.floor(Date.now() / 60000);
}
setInterval(updatePeriod, 1000);
updatePeriod();

// ===== COLOR & SIZE =====
function color(n){
  if(n === 0 || n === 5) return "Violet";
  return n % 2 === 0 ? "Red" : "Green";
}
function size(n){
  return n >= 5 ? "Big" : "Small";
}

// ===== RENDER HISTORY =====
function render(){
  historyEl.innerHTML = "";
  history.slice(0,12).forEach(n=>{
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div><b>${n}</b> ${color(n)}</div>
      <span class="badge ${size(n).toLowerCase()}">${size(n)}</span>
    `;
    historyEl.appendChild(div);
  });
}

// ===== FAST OCR EXTRACT =====
window.extractFast = function(){
  const file = document.getElementById("photoInput").files[0];
  if(!file){
    status.innerText = "Select image first";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    status.innerText = "Reading image (fast)…";

    Tesseract.recognize(
      reader.result,
      "eng",
      {
        tessedit_char_whitelist: "0123456789",
        classify_bln_numeric_mode: 1
      }
    ).then(({data:{text}})=>{
      const nums = (text.match(/\d/g) || [])
        .map(n=>parseInt(n))
        .filter(n=>n>=0 && n<=9);

      if(nums.length === 0){
        status.innerText = "No numbers found";
        return;
      }

      history = nums.reverse(); // latest on top
      render();
      status.innerText = "Data extracted successfully";
    });
  };
  reader.readAsDataURL(file);
};

});
