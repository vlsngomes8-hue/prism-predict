const buttonsDiv = document.getElementById("buttons");
const historyDiv = document.getElementById("history");

let history = [];

function getColor(n){
  if(n === 0 || n === 5) return "violet";
  if(n % 2 === 0) return "red";
  return "green";
}

function getSize(n){
  return n >= 5 ? "Big" : "Small";
}

for(let i=0;i<=9;i++){
  const btn = document.createElement("div");
  btn.className = "btn " + getColor(i);
  btn.innerText = i;
  btn.onclick = () => addHistory(i);
  buttonsDiv.appendChild(btn);
}

function addHistory(num){
  const color = getColor(num);
  const size = getSize(num);
  history.unshift(`${num} - ${color.toUpperCase()} - ${size}`);
  renderHistory();
}

function renderHistory(){
  historyDiv.innerHTML = history.slice(0,12)
    .map(h => `<div>${h}</div>`).join("");
}
function predict(){
  if(history.length < 3){
    document.getElementById("predictionResult").innerText =
      "Add more history for prediction";
    return;
  }

  // take last 3 numbers
  const lastNums = history.slice(0,3).map(h => parseInt(h));
  const avg = Math.round(
    lastNums.reduce((a,b)=>a+b,0) / lastNums.length
  );

  const predicted = avg % 10;
  const color = getColor(predicted);
  const size = getSize(predicted);

  document.getElementById("predictionResult").innerHTML =
    `<b>${predicted}</b> - ${color.toUpperCase()} - ${size}`;
}
