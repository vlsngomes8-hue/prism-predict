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
