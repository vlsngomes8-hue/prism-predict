// ===== PERIOD ID (LIKE REAL APPS) =====
function getPeriodId(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  const seq = Math.floor(Date.now()/60000);
  return `${y}${m}${day}${seq}`;
}
setInterval(()=>periodId.innerText=getPeriodId(),1000);
periodId.innerText=getPeriodId();

// ===== STATE =====
let history = [];

// ===== COLOR & SIZE =====
function color(n){
  if(n===0||n===5) return "Violet";
  return n%2===0 ? "Red" : "Green";
}
function size(n){
  return n>=5 ? "Big" : "Small";
}

// ===== NUMBER GRID =====
const grid = document.getElementById("numberGrid");
for(let i=0;i<=9;i++){
  const d = document.createElement("div");
  d.className = `num ${color(i)==="Red"?"red":color(i)==="Green"?"green":"violet"}`;
  d.innerText = i;
  d.onclick = ()=>addLatest(i);
  grid.appendChild(d);
}

// ===== ADD LATEST RESULT =====
function addLatest(n){
  history.unshift({
    period:getPeriodId(),
    num:n
  });
  if(history.length>12) history.pop();
  renderHistory();
  predictNext();
}

// ===== HISTORY UI =====
function renderHistory(){
  historyBox.innerHTML="";
  history.forEach(h=>{
    const div=document.createElement("div");
    div.className="history-item";
    div.innerHTML=`
      <div>${h.period}<br><b>${h.num}</b> ${color(h.num)}</div>
      <span class="badge ${size(h.num).toLowerCase()}">${size(h.num)}</span>
    `;
    historyBox.appendChild(div);
  });
}
const historyBox=document.getElementById("history");

// ===== AI PREDICTION (SIMPLE & STABLE) =====
function predictNext(){
  if(history.length<4){
    prediction.innerText="Need more data";
    return;
  }

  const nums = history.map(h=>h.num);
  let score = Array(10).fill(0);

  // frequency
  nums.forEach(n=>score[n]+=2);

  // recent trend
  nums.slice(0,3).forEach(n=>score[n]+=3);

  // gap logic
  for(let i=0;i<=9;i++){
    if(!nums.includes(i)) score[i]+=4;
  }

  // avoid repeat
  score[nums[0]]-=5;

  const pick = score.indexOf(Math.max(...score));
  prediction.innerText = pick;
}
