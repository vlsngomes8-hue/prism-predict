let history = [];
let photoLoaded = false;

const status = document.getElementById("status");
const photoData = document.getElementById("photoData");
const prediction = document.getElementById("prediction");
const btnBox = document.getElementById("buttons");

// ===== COLOR =====
function color(n){
  if(n===0||n===5) return "violet";
  return n%2===0?"red":"green";
}

// ===== CREATE NUMBER BUTTONS (LOCKED INITIALLY) =====
let btns=[];
for(let i=0;i<=9;i++){
  const d=document.createElement("div");
  d.className="num "+color(i);
  d.innerText=i;
  d.onclick=()=>manualAdd(i);
  btnBox.appendChild(d);
  btns.push(d);
}

// ===== ENABLE BUTTONS =====
function enableButtons(){
  btns.forEach(b=>{
    b.style.opacity="1";
    b.style.pointerEvents="auto";
  });
}

// ===== OCR PHOTO (MUST BE FIRST) =====
function readPhoto(){
  const file=document.getElementById("photo").files[0];
  if(!file){
    status.innerText="Select image first";
    return;
  }

  status.innerText="Reading photo...";
  Tesseract.recognize(
    file,
    "eng",
    {tessedit_char_whitelist:"0123456789"}
  ).then(({data:{text}})=>{
    const nums=(text.match(/\d/g)||[])
      .map(n=>parseInt(n))
      .filter(n=>n>=0&&n<=9);

    if(nums.length<3){
      status.innerText="Not enough data in photo";
      return;
    }

    history = nums.slice(-5);
    photoData.innerText = history.join(", ");
    photoLoaded = true;
    enableButtons();
    prediction.innerText = "Add latest result";
    status.innerText="Photo data loaded";
  });
}

// ===== MANUAL ADD (ONLY AFTER PHOTO) =====
function manualAdd(n){
  if(!photoLoaded) return;

  history.push(n);
  if(history.length>6) history.shift();
  photoData.innerText = history.join(", ");
  predictNext();
}

// ===== AI PREDICTION =====
function predictNext(){
  let score = Array(10).fill(0);

  history.forEach(n=>score[n]+=2);       // frequency
  history.slice(-3).forEach(n=>score[n]+=3); // trend

  for(let i=0;i<=9;i++){
    if(!history.includes(i)) score[i]+=4; // gap
  }

  score[history[history.length-1]]-=5;  // avoid repeat

  const pick = score.indexOf(Math.max(...score));
  prediction.innerText = pick;
}
