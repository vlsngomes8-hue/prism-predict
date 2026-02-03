document.addEventListener("DOMContentLoaded",()=>{

/* ===== AUTO PERIOD ===== */
function getPeriod(){
  return Math.floor(Date.now()/60000);
}
setInterval(()=>period.innerText=getPeriod(),1000);

/* ===== STATE ===== */
let data=[];
const status=document.getElementById("status");
const preview=document.getElementById("preview");

/* ===== COLOR / SIZE ===== */
function color(n){
  if(n===0||n===5) return "VIOLET";
  return n%2===0?"RED":"GREEN";
}
function size(n){return n>=5?"BIG":"SMALL";}

/* ===== BUTTONS ===== */
const btns=document.getElementById("buttons");
for(let i=0;i<=9;i++){
  const b=document.createElement("div");
  b.className="btn "+(color(i)==="RED"?"red":color(i)==="GREEN"?"green":"violet");
  b.innerText=i;
  b.onclick=()=>addResult(i);
  btns.appendChild(b);
}

/* ===== ADD RESULT ===== */
function addResult(n){
  data.unshift(n);
  if(data.length>15) data.pop();
  render();
  aiPredict();
}

/* ===== RENDER ===== */
function render(){
  history.innerHTML=data.map(n=>`${n} ${color(n)} ${size(n)}`).join("<br>");
}

/* ===== 🤖 AI PREDICTION ===== */
function aiPredict(){
  if(data.length<5){
    prediction.innerText="Need more data";
    return;
  }

  let score=Array(10).fill(0);

  // 1. Frequency (AI memory)
  data.forEach(n=>score[n]+=2);

  // 2. Recent trend (strong weight)
  data.slice(0,5).forEach(n=>score[n]+=4);

  // 3. Gap (missing number boost)
  for(let i=0;i<=9;i++){
    const idx=data.indexOf(i);
    if(idx===-1) score[i]+=6;
    else score[i]+=Math.min(idx,3);
  }

  // 4. Momentum break
  score[data[0]]-=4;

  const pick=score.indexOf(Math.max(...score));

  prediction.innerText=
    `${pick} ${color(pick)} ${size(pick)} (AI)`;
}

/* ===== OCR ===== */
window.extract=function(){
  const file=photoInput.files[0];
  if(!file){status.innerText="Select image";return;}

  const r=new FileReader();
  r.onload=()=>{
    preview.src=r.result;
    status.innerText="AI reading image...";
    Tesseract.recognize(r.result,"eng").then(({data:{text}})=>{
      const nums=(text.match(/\d/g)||[])
        .map(n=>parseInt(n))
        .filter(n=>n>=0&&n<=9);

      if(nums.length===0){
        status.innerText="No data found";
        return;
      }

      data=[...nums.slice(-5)];
      render();
      aiPredict();
      status.innerText="Latest data loaded";
    });
  };
  r.readAsDataURL(file);
};

});
