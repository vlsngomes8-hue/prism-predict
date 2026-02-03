let extractedData = [];
let history = [];

const extractedDiv = document.getElementById("extracted");
const predictionDiv = document.getElementById("prediction");
const statusDiv = document.getElementById("status");

// ===== COLOR =====
function color(n){
  if(n===0||n===5) return "violet";
  return n%2===0?"red":"green";
}

// ===== CREATE BUTTONS =====
const btns = document.getElementById("buttons");
for(let i=0;i<=9;i++){
  const d=document.createElement("div");
  d.className="num "+color(i);
  d.innerText=i;
  d.onclick=()=>addManual(i);
  btns.appendChild(d);
}

// ===== OCR EXTRACT =====
function extract(){
  const file=document.getElementById("photo").files[0];
  if(!file){
    statusDiv.innerText="Select image first";
    return;
  }

  statusDiv.innerText="Reading image...";
  Tesseract.recognize(
    file,
    "eng",
    { tessedit_char_whitelist:"0123456789" }
  ).then(({data:{text}})=>{
    extractedData = (text.match(/\d/g)||[])
      .map(n=>parseInt(n))
      .filter(n=>n>=0&&n<=9);

    if(extractedData.length===0){
      statusDiv.innerText="No numbers found";
      return;
    }

    history = extractedData.slice(-5); // ONLY latest
    extractedDiv.innerText = history.join(", ");
    statusDiv.innerText="Data loaded. Add next result.";
    predictionDiv.innerText="Waiting for manual input";
  });
}

// ===== MANUAL ADD =====
function addManual(n){
  history.push(n);
  if(history.length>6) history.shift();
  extractedDiv.innerText = history.join(", ");
  predictNext();
}

// ===== AI PREDICTION =====
function predictNext(){
  if(history.length<4){
    predictionDiv.innerText="Need more data";
    return;
  }

  let score = Array(10).fill(0);

  // frequency
  history.forEach(n=>score[n]+=2);

  // recent trend
  history.slice(-3).forEach(n=>score[n]+=3);

  // gap
  for(let i=0;i<=9;i++){
    if(!history.includes(i)) score[i]+=4;
  }

  // avoid repeat
  score[history[history.length-1]] -= 5;

  const pick = score.indexOf(Math.max(...score));
  predictionDiv.innerText = pick;
}
